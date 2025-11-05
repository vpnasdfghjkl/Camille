---
title: Act
description: Action Chunking with Transformer
date: '2025-8-25'
order: 5
tags:
  - IL
  - Action Chunking of Transformer
  - generative model
image: /act.svg
# image: /vae.png
draft: false
---


### 异构相机的注意力机制

```py {9-59}
class ACTHeterogeneousCameraCrossAttention(nn.Module):
    """异构相机的交叉注意力模块"""
    
    def __init__(self, config: ACTConfig):
        super().__init__()
        self.config = config
        self.backbone_features = 2048  # ResNet layer4
        
        # 1. 相机类型分类（异构性体现）
        self.camera_types = {
            0: 'wrist_detail',    # 腕部相机：关注操作细节
            1: 'wrist_context',   # 腕部相机：关注操作上下文  
            2: 'global_overview'  # 头部相机：全局概览
        }
        
        # 2. 每种相机类型的特征提取器（体现异构性）
        self.camera_feature_extractors = nn.ModuleDict({
            'wrist_detail': nn.Sequential(
                nn.AdaptiveAvgPool2d((6, 6)),  # 保留更多细节
                nn.Flatten(),
                nn.Linear(self.backbone_features * 36, config.dim_model),
                nn.ReLU(),
                nn.Dropout(config.dropout)
            ),
            'wrist_context': nn.Sequential(
                nn.AdaptiveAvgPool2d((4, 4)),  # 中等细节
                nn.Flatten(),
                nn.Linear(self.backbone_features * 16, config.dim_model),
                nn.ReLU(),
                nn.Dropout(config.dropout)
            ),
            'global_overview': nn.Sequential(
                nn.AdaptiveAvgPool2d((2, 2)),  # 全局特征
                nn.Flatten(),
                nn.Linear(self.backbone_features * 4, config.dim_model),
                nn.ReLU(),
                nn.Dropout(config.dropout)
            )
        })
        
        # 3. 交叉注意力模块（核心：不同相机类型之间的交叉注意力）
        self.cross_attention_modules = nn.ModuleDict({
            # 腕部细节 -> 全局概览
            'detail_to_global': nn.MultiheadAttention(
                config.dim_model, config.n_heads, dropout=config.dropout, batch_first=True
            ),
            # 全局概览 -> 腕部细节
            'global_to_detail': nn.MultiheadAttention(
                config.dim_model, config.n_heads, dropout=config.dropout, batch_first=True
            ),
            # 腕部上下文 -> 腕部细节
            'context_to_detail': nn.MultiheadAttention(
                config.dim_model, config.n_heads, dropout=config.dropout, batch_first=True
            ),
            # 腕部细节 -> 腕部上下文
            'detail_to_context': nn.MultiheadAttention(
                config.dim_model, config.n_heads, dropout=config.dropout, batch_first=True
            )
        })
        
        # 4. 融合层
        self.fusion_layers = nn.ModuleDict({
            camera_type: nn.Sequential(
                nn.Linear(config.dim_model * 3, config.dim_model),  # 3个来源的特征
                nn.ReLU(),
                nn.Dropout(config.dropout),
                nn.Linear(config.dim_model, config.dim_model)
            ) for camera_type in self.camera_types.values()
        })
        
        # 5. 层归一化
        self.layer_norms = nn.ModuleList([
            nn.LayerNorm(config.dim_model) for _ in range(len(self.camera_types))
        ])
        
    def forward(self, batch):
        """
        异构相机交叉注意力的前向传播
        """
        batch_size = batch["observation.images"].shape[0]
        
        # 第一阶段：每种相机类型的特征提取
        camera_features = {}
        
        for cam_idx in range(3):
            # backbone特征提取
            cam_features = self.backbone(batch["observation.images"][:, cam_idx])["feature_map"]
            
            # 根据相机类型使用不同的特征提取器
            cam_type = self.camera_types[cam_idx]
            extracted_features = self.camera_feature_extractors[cam_type](cam_features)
            camera_features[cam_type] = extracted_features  # (B, dim_model)
        
        # 第二阶段：异构相机间的交叉注意力
        enhanced_features = {}
        
        # 为每种相机类型计算增强特征
        for cam_type in self.camera_types.values():
            # 当前相机的原始特征
            current_feat = camera_features[cam_type].unsqueeze(1)  # (B, 1, dim_model)
            
            # 收集来自其他相机类型的信息
            cross_attended_features = [current_feat]
            
            if cam_type == 'wrist_detail':
                # 腕部细节相机从全局和上下文获取信息
                global_feat = camera_features['global_overview'].unsqueeze(1)
                context_feat = camera_features['wrist_context'].unsqueeze(1)
                
                # 交叉注意力：细节 attend to 全局
                detail_from_global, _ = self.cross_attention_modules['detail_to_global'](
                    current_feat, global_feat, global_feat
                )
                
                # 交叉注意力：细节 attend to 上下文
                detail_from_context, _ = self.cross_attention_modules['context_to_detail'](
                    current_feat, context_feat, context_feat
                )
                
                cross_attended_features.extend([detail_from_global, detail_from_context])
                
            elif cam_type == 'wrist_context':
                # 腕部上下文相机从全局和细节获取信息
                global_feat = camera_features['global_overview'].unsqueeze(1)
                detail_feat = camera_features['wrist_detail'].unsqueeze(1)
                
                # 类似的交叉注意力操作...
                context_from_global, _ = self.cross_attention_modules['global_to_detail'](
                    current_feat, global_feat, global_feat
                )
                context_from_detail, _ = self.cross_attention_modules['detail_to_context'](
                    current_feat, detail_feat, detail_feat
                )
                
                cross_attended_features.extend([context_from_global, context_from_detail])
                
            elif cam_type == 'global_overview':
                # 全局相机从两个腕部相机获取信息
                detail_feat = camera_features['wrist_detail'].unsqueeze(1)
                context_feat = camera_features['wrist_context'].unsqueeze(1)
                
                global_from_detail, _ = self.cross_attention_modules['global_to_detail'](
                    current_feat, detail_feat, detail_feat
                )
                global_from_context, _ = self.cross_attention_modules['global_to_detail'](
                    current_feat, context_feat, context_feat
                )
                
                cross_attended_features.extend([global_from_detail, global_from_context])
            
            # 融合所有交叉注意力的结果
            fused_features = torch.cat(cross_attended_features, dim=-1)  # (B, 1, dim_model*3)
            fused_features = self.fusion_layers[cam_type](fused_features.squeeze(1))  # (B, dim_model)
            
            # 残差连接和层归一化
            enhanced_features[cam_type] = self.layer_norms[0](
                fused_features + camera_features[cam_type]
            )
        
        # 返回增强后的相机特征
        return [
            enhanced_features['wrist_detail'],
            enhanced_features['wrist_context'], 
            enhanced_features['global_overview']
        ]


# 集成到ACT中
class ACT(nn.Module):
    def __init__(self, config: ACTConfig):
        super().__init__()
        # ... 原有代码 ...
        
        if self.config.image_features:
            # 添加异构相机交叉注意力模块
            self.heterogeneous_camera_cross_attention = ACTHeterogeneousCameraCrossAttention(config)
            
            # 原有backbone保持不变
            backbone_model = getattr(torchvision.models, config.vision_backbone)(
                replace_stride_with_dilation=[False, False, config.replace_final_stride_with_dilation],
                weights=config.pretrained_backbone_weights,
                norm_layer=FrozenBatchNorm2d,
            )
            self.backbone = IntermediateLayerGetter(backbone_model, return_layers={"layer4": "feature_map"})
            
            # 将backbone传递给交叉注意力模块
            self.heterogeneous_camera_cross_attention.backbone = self.backbone
    
    def forward(self, batch: dict[str, Tensor]):
        # ... VAE encoder 部分保持不变 ...
        
        # 准备encoder输入
        encoder_in_tokens = [self.encoder_latent_input_proj(latent_sample)]
        encoder_in_pos_embed = [self.encoder_1d_feature_pos_embed.weight[0].unsqueeze(0).unsqueeze(1)]
        
        # Robot state和env state保持不变
        if self.config.robot_state_feature:
            encoder_in_tokens.append(self.encoder_robot_state_input_proj(batch["observation.state"]))
            encoder_in_pos_embed.append(self.encoder_1d_feature_pos_embed.weight[1].unsqueeze(0).unsqueeze(1))
        
        # 使用异构相机交叉注意力处理图像
        if self.config.image_features:
            camera_tokens = self.heterogeneous_camera_cross_attention(batch)
            
            # 添加每个相机的token和位置编码
            base_pos_idx = len(encoder_in_tokens)
            for cam_idx, cam_token in enumerate(camera_tokens):
                encoder_in_tokens.append(cam_token)
                pos_idx = base_pos_idx + cam_idx
                encoder_in_pos_embed.append(
                    self.encoder_1d_feature_pos_embed.weight[pos_idx].unsqueeze(0).unsqueeze(1)
                )
        
        # ... 后续处理保持不变 ...
```
#### 异构体现

-   **不同相机类型**：腕部细节、腕部上下文、全局概览。
-   **不同特征提取策略**：细节相机保留 `6x6` 空间信息，全局相机压缩到 `2x2`。
-   **不同语义角色**：每种相机在任务中承担不同职责。

#### 交叉注意力体现

-   **显式的Cross-Attention模块**：不是简单的self-attention。
-   **有向的信息流动**：`detail→global`, `global→detail` 等。
-   **多层次交互**：每种相机都从其他类型获取补充信息。

#### 实际技术价值

-   **避免信息冗余**：不同相机提取不同粒度的特征。
-   **互补信息融合**：细节相机获得全局上下文，全局相机获得细节信息。
-   **任务适应性**：不同阶段可以依赖不同类型的相机。

#### 总结描述

> 设计了异构相机的分层交叉注意力机制，将腕部细节相机、腕部上下文相机和全局概览相机视为不同的异构模态，通过定向的交叉注意力模块实现不同视角间的信息互补和语义融合，相比简单拼接方式提升了多视角视觉信息的利用效率。

### Q&A

1.  **pooling是否会丢失信息？**
  > 会的，但是可以通过设计不同的pooling策略来尽量保留信息，比如自适应池化。

2.  **交叉注意力的query、key、value是如何设计的？**
  > `query` 来自当前相机的特征，`key` 和 `value` 来自其他相机的特征。

3.  **3相机 + 1state + 1latent, 进入encoder之后本来就会计算注意力，那么为什么还要设计这个模块？**
  > 因为直接在encoder中计算注意力可能无法充分利用不同相机的异构信息，而专门设计的交叉注意力模块可以更有针对性地融合这些信息。

4.  **VAE在ACT算法中的作用到底是什么？如何理解？**
    > VAE通过引入潜在变量z，能够捕捉演示数据中的多样性和不确定性，使得模型在面对相同状态时可以生成多样化的动作序列，提升了泛化能力。区别于传统bc，vae引入至少在训练阶段对于同样的输入状态，可以采样出不同的潜在变量z，对于同样目标的不同轨迹都可以学到，否则等价于传统bc，输入同样的状态，输出同样的编码，对于同样目标的不同轨迹会取平均。

5. **为什么假设一个分布，为什么假设正态分布？**
    > 假设一个分布是为了建模数据的生成过程，正态分布因其数学性质良好且易于处理，常被用作潜在空间的先验分布。

6. **为什么从分布中采样？**
    > 采样允许模型在训练和推理阶段生成多样化的潜在变量z，从而生成多样化的动作序列，增强模型的表达能力和泛化能力。


### VAE在模型中运用的合理性
- 常见的VAE的应用是在图像生成中，图像本身具有高维度和复杂的分布，VAE通过引入潜在变量z，能够捕捉图像数据中的多样性和不确定性，使得模型在面对相同输入时可以生成多样化的图像。相当于是给图像也就是生成的对象提取特征。这里本来可以直接将state, env, img信息直接输入act-encoder,但是引入VAE后先将state，action输入vae生成隐变量z,然后将z和state, img等一起输入act-encoder,相当于给act-encoder提供了一个更丰富的特征表示，z捕捉了state-action对的潜在结构和多样性，从而提升了模型生成动作序列的能力。



### 4. References
- [VAE变分自编码机详解——原理篇](https://zhuanlan.zhihu.com/p/108262170)
