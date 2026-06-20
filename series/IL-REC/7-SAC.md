```math
\nabla_{\theta} J(\theta) = \mathbb{E}_{s,a}[\nabla_{\theta} \log \pi_{\theta}(a|s) \cdot Q^{\pi}(s,a)]\\

J(\pi) = \sum_{t} \mathbb{E}_{(s,a) \sim \rho_\pi} [r(s_t, a_t) + \alpha \mathcal{H}(\pi(\cdot|s_t))]
```

# sac

## why no reward func for bp

1. Sparse Reward
2. Short horizontal
3. huge 方差

## critic

```math
Q(s_t, a_t) \approx r_t + \gamma r_{t+1} + \gamma^2 r_{t+2} + \dots
```

```math
y_t = r_t + \gamma \cdot \underbrace{\left( \min_{i=1,2} Q_{\text{target}, i}(s_{t+1}, \tilde{a}_{t+1}) - \alpha \cdot \log \pi(\tilde{a}_{t+1}|s_{t+1}) \right)}_{\text{下一时刻的软价值 (Soft Value)}}
```

1. as conclusive compute

## Bootstrapping

```math
\theta' \leftarrow \tau \theta + (1 - \tau) \theta'
```

## coding

```py
def update_actor_and_alpha(self, obs, state, L=None, step=None, update_alpha=True):
		mu, pi, log_pi, log_std = self.actor(obs, state)	# 均值，采样值，采样概率，log方差
		Q1, Q2 = self.critic(obs, state, pi)	# 分数
		Q = torch.min(Q1, Q2)
		actor_loss = (self.alpha.detach() * log_pi - Q).mean()	# loss，最大化分数（鼓励最优），最小化pi被选中的概率(强迫在低概率情况下也可以满足，鼓励分散)
		if L is not None:
				L.log('train_actor/loss', actor_loss, step)

		self.actor_optimizer.zero_grad(set_to_none=True)
		actor_loss.backward()
		self.actor_optimizer.step()

		if update_alpha:
				self.log_alpha_optimizer.zero_grad(set_to_none=True)
				alpha_loss = (self.alpha * (-log_pi - self.target_entropy).detach()).mean()

				if L is not None:
						L.log('train_alpha/loss', alpha_loss, step)
						L.log('train_alpha/value', self.alpha, step)

				alpha_loss.backward()
				self.log_alpha_optimizer.step()
```

```math
\begin{aligned}
&\frac{\partial L}{\partial Q} = -1 \\
&\frac{\partial Q}{\partial a}\\
&\frac{\partial a}{\partial \phi} = \frac{\partial a}{\partial \mu}\frac{\partial \mu}{\partial \phi} + \frac{\partial a}{\partial \sigma}\frac{\partial \sigma}{\partial \phi}
\end{aligned}
```
