<script>
	// VideoPlayer 组件 - 专用于展示项目演示视频
	export let src = '';
	export let poster = '';
	export let title = '';
	export let subtitle = '';
	export let maxWidth = '800px';
	export let aspectRatio = '16/9'; // 默认16:9比例，可自定义如 '4/3', '1/1' 等
	
	let isPlaying = false;
	let videoElement;
	let posterOpacity = 1;
	
	// 处理视频播放开始
	function handlePlay() {
		isPlaying = true;
		// 延长延迟时间，让过渡更平滑
		setTimeout(() => {
			posterOpacity = 0;
		}, 2);
	}
	
	// 处理视频暂停
	function handlePause() {
		isPlaying = false;
	}
	
	// 处理视频结束
	function handleEnded() {
		isPlaying = false;
		posterOpacity = 1;
	}
	
	// 初始化视频设置
	function handleVideoLoad() {
		if (videoElement) {
			videoElement.volume = 0.05; // 设置默认音量为50%
			videoElement.playbackRate = 1.00; // 设置播放速度
		}
	}
</script>

<div class="video-wrapper" style="max-width: {maxWidth};">
	<div class="video-container" style="aspect-ratio: {aspectRatio};">
		<!-- 自定义poster层，支持淡入淡出 -->
		{#if poster}
			<div 
				class="poster-overlay" 
				style="opacity: {posterOpacity}; background-image: url({poster});"
				class:playing={isPlaying}
			>
				<!-- 播放按钮覆盖层 -->
				{#if !isPlaying}
					<button 
						type="button"
						class="play-button-overlay" 
						on:click={() => videoElement?.play()}
						aria-label="播放视频"
					>
						<div class="play-button">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
								<path d="M8 5.14v13.72L19 12L8 5.14z" fill="currentColor"/>
							</svg>
						</div>
					</button>
				{/if}
			</div>
		{/if}
		
		<video 
			bind:this={videoElement}
			controls 
			{src}
			class="demo-video"
			on:play={handlePlay}
			on:pause={handlePause}
			on:ended={handleEnded}
			on:loadedmetadata={handleVideoLoad}
		>
			<track kind="captions" src="" label="无字幕" default />
			您的浏览器不支持视频播放。
		</video>
	</div>
	
	{#if title || subtitle}
		<div class="video-caption">
			{#if title}
				<p class="caption-text">{title}</p>
			{/if}
			{#if subtitle}
				<p class="caption-subtitle">{subtitle}</p>
			{/if}
		</div>
	{/if}
</div>

<style>
	.video-wrapper {
		position: relative;
		margin: 2rem auto;
	}

	.video-container {
		position: relative;
		width: 100%;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
		transition: transform 0.3s ease, box-shadow 0.3s ease;
		background-color: #000; /* 视频加载时的背景色 */
	}

	.video-container:hover {
		transform: translateY(-2px);
		box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
	}

	.demo-video {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover; /* 确保poster和视频都以相同方式填充容器 */
		border-radius: inherit;
		z-index: 1;
	}
	
	.poster-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		border-radius: inherit;
		z-index: 2;
		transition: opacity 0.8s ease-in-out;
		pointer-events: auto; /* 允许点击播放按钮 */
	}
	
	/* 播放时让poster不阻挡video控制栏 */
	.poster-overlay.playing {
		pointer-events: none;
		z-index: 0;
	}
	
	.play-button-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: flex-end;
		justify-content: flex-end;
		cursor: pointer;
		background: transparent;
		border: none; /* 移除button默认边框 */
		transition: background 0.3s ease;
		padding: 16px; /* 给右下角留出空间 */
	}
	
	.play-button-overlay:hover {
		background: rgba(0, 0, 0, 0.05);
	}
	
	.play-button-overlay:focus {
		outline: 2px solid rgba(255, 255, 255, 0.8);
		outline-offset: 2px;
	}
	
	.play-button {
		width: 56px;
		height: 56px;
		background: rgba(255, 255, 255, 0.8);
		border: 2px solid rgba(255, 255, 255, 0.9);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: rgba(0, 0, 0, 0.8);
		backdrop-filter: blur(10px);
		transition: all 0.3s ease;
		transform: scale(1);
	}
	
	.play-button:hover {
		background: rgba(255, 255, 255, 0.95);
		border-color: rgba(255, 255, 255, 1);
		color: rgba(0, 0, 0, 1);
		transform: scale(1.05);
	}
	
	.play-button svg {
		margin-left: 2px; /* 视觉上居中播放三角形 */
		width: 20px;
		height: 20px;
	}

	.video-caption {
		margin-top: 1rem;
		text-align: center;
		padding: 1rem;
		border-radius: 8px;
	}

	.caption-text {
		font-size: 1.1rem;
		font-weight: 600;
		color: #1e293b;
		margin: 0 0 0.5rem 0;
	}

	.caption-subtitle {
		font-size: 0.9rem;
		color: #64748b;
		margin: 0;
		font-style: italic;
	}

	/* 深色模式适配 */
	:global(.dark) .caption-text {
		color: #f1f5f9;
	}
	
	:global(.dark) .caption-subtitle {
		color: #94a3b8;
	}

	/* 响应式设计 */
	@media (max-width: 768px) {
		.video-wrapper {
			margin: 1rem auto;
		}
		
		.caption-text {
			font-size: 1rem;
		}
		
		.caption-subtitle {
			font-size: 0.8rem;
		}
		
		.play-button {
			width: 48px;
			height: 48px;
		}
		
		.play-button svg {
			width: 16px;
			height: 16px;
		}
		
		.play-button-overlay {
			padding: 12px; /* 移动端减少padding */
		}
	}
</style>