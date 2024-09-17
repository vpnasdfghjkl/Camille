---
title: "Transformer"
description: Transformer from scratch.
date: '2024-09-17'
image: 
    - /transformer-learning-from-scratch.png
tags: 
    - Machine Learning
    - Transformer
draft: false
---

```py {93-109}
import torch
import torch.nn as nn
import math

class InputEmbeddings(nn.Module):
    
    def __init__(self, vocab_size: int , d_model: int):
        super.__init__()
        self.vocab_size = vocab_size
        self.d_model=d_model
        self.embedding = nn.Embedding(vocab_size, d_model)
        
    def forward(self, x):
        return self.embedding(x)*math.sqrt(self.d_model)
        
class PositionEmbedding(nn.Module):
    
    def __init__(self, Seq_len:int, d_model:int, dropout:float)-> None:
        super().__init__()
        self.Seq_len=Seq_len
        self.d_model=d_model
        self.dropout=nn.Dropout(dropout)
        
        pe=torch.zeros(self.Seq_len,self.d_model)
        position = torch.arange(0,self.Seq_len,dtype=torch.float).unsqueeze(1)
        
        # apply sin to 2i
        div_term = torch.exp(torch.arange(0,d_model,2).float()*(-math.log(10000.0)/d_model))
        pe[:,0::2] = torch.sin(position * div_term)
        pe[:,1::2] = torch.cos(position * div_term)
        pe = pe.unsqueeze(0)
        
        self.register_buffer("pe",pe)
        
    def forward(self,x):
        x = x + (self.pe[:,:x.shape[1],:]).requires_grad_(False)
        return self.dropout(x)
    
class LayerNormalization(nn.Module):
    
    def __init__(self, epsilon:float=10**-6)->None:
        super().__init__()
        self.epsilon=epsilon
        self.alpha=nn.Parameter(torch.ones(1))
        self.bias=nn.Parameter(torch.zeros(1))
    
    def forward(self,x):
        mean = x.mean(dim = -1, keepdim=True)
        std = x.std(dim=-1, keepdim=True)
        return self.alpha*(x-mean) / (std+self.epsilon) + self.bias

class FeedForwardBlock(nn.Module):
    
    def __init__(self, d_model: int, d_ff: int ,dropout: float) -> None:
        super().__init__()
        self.linear_1 = nn.Linear(d_model, d_ff)
        self.dropout = nn.Dropout(dropout)
        self.linear_2 = nn.Linear(d_ff, d_model)
        
    def forward(self,x):
        return self.linear_2(self.dropout(torch.relu(self.linear_1(x))))
    
    
class MutiHeadAttentionBlock(nn.Module):
    
    def __init__(self, d_model: int, h: int, dropout: float) -> None:
        super().__init__()
        self.d_model = d_model
        self.h = h 
        assert d_model % h ==0, "d_model isn't divisible by h"
        
        self.d_k=d_model//h
        self.w_q = nn.Linear(d_model,d_model)
        self.w_k = nn.Linear(d_model,d_model)
        self.w_v = nn.Linear(d_model,d_model)
        
        self.w_o=nn.Linear(d_model,d_model)
        self.dropout=nn.Dropout(dropout)
        
    @staticmethod
    def attention(query, key, value, mask, dropout: nn.Dropout):
        d_k = query.shape[-1]
        
        # (Batch, h, Seq_len, d_k) --> # (Batch, h, Seq_len, Seq_len)
        attention_scores = (query @ key.transpose(-2,-1)) / math.sqrt(value)
        if mask is not None:
            attention_scores.masked_fill_(mask == 0 ,-1e-9)
        attention_scores = attention_scores.softmax(dim = -1) # (Batch, h, Seq_len, Seq_len)
        if dropout is not None:
            attention_scores = dropout(attention_scores)
        return (attention_scores @ value), attention_scores
    
    def forward(self, q, k, v, mask):
        query = self.w_q(q)
        key = self.w_k(k)
        value = self.w_v(v)
        
        # (Batch, Seq_len, d_model) --> (Batch, Seq_len, h, d_k) --> (Batch, h, Seq_len, d_k)
        query = query.view(query.shape[0], query.shape[1], self.h, self.d_k).transpose(1,2)
        key = key.view(key.shape[0], key.shape[1], self.h, self.d_k).transpose(1,2)
        value = value.view(value.shape[0], value.shape[1], self.h, self.d_k).transpose(1,2)
        
        x, self.attention_scores = MutiHeadAttentionBlock.attention(query, key, value, mask, self.dropout)
        
        # (Batch, h, Seq_len, d_k) --> (Batch, Seq_len, h, d_k) --> （Batch, Seq_len, d_model)
        x = x.transpose(1,2).contiguous().view(x.shape[0], -1, self.h * self.d_k)
        
        # (Batch, Seq_len, d_model) --> (Batch, Seq_len, d_model)
        return self.w_o(x)
        
        
```