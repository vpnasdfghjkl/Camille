<script lang="ts">
	import { onMount } from 'svelte';
	
	// Props
	export let texts: string[] = ['Hello World'];
	export let typeSpeed: number = 100;
	export let deleteSpeed: number = 50;
	export let delayBetween: number = 2000;
	export let className: string = '';
	export let cursorColor: string = 'text-orange-500';
	export let startDelay: number = 1000;
	
	// State
	let displayText = '';
	let currentIndex = 0;
	let isDeleting = false;
	let showCursor = true;
	let currentTextIndex = 0;
	
	onMount(() => {
		// 光标闪烁效果
		const cursorInterval = setInterval(() => {
			showCursor = !showCursor;
		}, 530);
		
		// 打字机效果主逻辑
		const typeEffect = () => {
			const currentText = texts[currentTextIndex];
			
			if (!isDeleting) {
				// 打字阶段
				if (currentIndex < currentText.length) {
					displayText = currentText.substring(0, currentIndex + 1);
					currentIndex++;
					setTimeout(typeEffect, typeSpeed + Math.random() * 50);
				} else {
					// 打字完成，等待后开始删除
					setTimeout(() => {
						isDeleting = true;
						typeEffect();
					}, delayBetween);
				}
			} else {
				// 删除阶段
				if (currentIndex > 0) {
					displayText = currentText.substring(0, currentIndex - 1);
					currentIndex--;
					setTimeout(typeEffect, deleteSpeed + Math.random() * 25);
				} else {
					// 删除完成，切换到下一个文本
					isDeleting = false;
					currentTextIndex = (currentTextIndex + 1) % texts.length;
					setTimeout(typeEffect, 500);
				}
			}
		};
		
		// 启动打字机效果
		setTimeout(typeEffect, startDelay);
		
		return () => {
			clearInterval(cursorInterval);
		};
	});
</script>

<span class={className}>
	{displayText}<span class="{cursorColor} transition-opacity duration-100" class:opacity-0={!showCursor} class:opacity-100={showCursor}>|</span>
</span>