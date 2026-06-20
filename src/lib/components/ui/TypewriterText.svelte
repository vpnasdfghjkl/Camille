<script lang="ts">
	import { onMount } from 'svelte';

	// Props
	export let texts: string[] = ['Hello World'];
	export let typeSpeed: number = 100;
	export let deleteSpeed: number = 50;
	export let delayBetween: number = 2000;
	export let className: string = '';
	export let cursorColor: string = 'text-slate-500';
	export let startDelay: number = 1000;
	export let loop: boolean = false;
	export let keepCursor: boolean = false;

	// State
	let displayText = '';
	let currentIndex = 0;
	let isDeleting = false;
	let showCursor = true;
	let currentTextIndex = 0;

	onMount(() => {
		const timeouts = new Set<ReturnType<typeof setTimeout>>();
		const schedule = (callback: () => void, delay: number) => {
			const timeout = setTimeout(() => {
				timeouts.delete(timeout);
				callback();
			}, delay);
			timeouts.add(timeout);
			return timeout;
		};

		// 打字机效果主逻辑
		const typeEffect = () => {
			const currentText = texts[currentTextIndex] || '';

			if (!isDeleting) {
				// 打字阶段
				if (currentIndex < currentText.length) {
					displayText = currentText.substring(0, currentIndex + 1);
					currentIndex++;
					schedule(typeEffect, typeSpeed + Math.random() * 50);
				} else {
					const hasNextText = texts.length > 1 && (loop || currentTextIndex < texts.length - 1);
					if (!hasNextText) {
						schedule(() => {
							showCursor = keepCursor;
						}, delayBetween);
						return;
					}

					// 打字完成，等待后开始删除并切换到下一个文案
					schedule(() => {
						isDeleting = true;
						typeEffect();
					}, delayBetween);
				}
			} else {
				// 删除阶段
				if (currentIndex > 0) {
					displayText = currentText.substring(0, currentIndex - 1);
					currentIndex--;
					schedule(typeEffect, deleteSpeed + Math.random() * 25);
				} else {
					// 删除完成，切换到下一个文本
					isDeleting = false;
					currentTextIndex = (currentTextIndex + 1) % texts.length;
					schedule(typeEffect, 500);
				}
			}
		};

		// 启动打字机效果
		schedule(typeEffect, startDelay);

		return () => {
			timeouts.forEach((timeout) => clearTimeout(timeout));
		};
	});
</script>

<span class={className}>
	{displayText}<span
		class={cursorColor}
		class:opacity-0={!showCursor}
		class:opacity-100={showCursor}>|</span
	>
</span>
