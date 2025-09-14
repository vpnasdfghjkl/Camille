<script lang="ts">
	import { onMount } from 'svelte';
	
	// Props
	export let sections: string[] = [];
	export let currentSection: number = 0;
	export let onSectionChange: (index: number) => void = () => {};
	export let isScrolling: boolean = false;
	
	let scrollTimeout: ReturnType<typeof setTimeout>;
	let touchStartY = 0;
	let touchEndY = 0;
	
	const handleWheel = (e: WheelEvent) => {
		e.preventDefault();
		
		if (isScrolling) return;
		
		const delta = e.deltaY;
		const absDelta = Math.abs(delta);
		
		// 只有滚动幅度足够大才触发，避免误触
		if (absDelta < 10) return;
		
		// 清除之前的滚动超时
		clearTimeout(scrollTimeout);
		
		// 大幅减少延迟，几乎立即响应
		scrollTimeout = setTimeout(() => {
			if (delta > 0 && currentSection < sections.length - 1) {
				// 向下滚动
				onSectionChange(currentSection + 1);
			} else if (delta < 0 && currentSection > 0) {
				// 向上滚动
				onSectionChange(currentSection - 1);
			}
		}, 5); // 从20ms大幅减少到5ms
	};
	
	// 触摸事件处理 - 优化移动端体验
	const handleTouchStart = (e: TouchEvent) => {
		touchStartY = e.touches[0].clientY;
	};
	
	const handleTouchMove = (e: TouchEvent) => {
		e.preventDefault(); // 防止页面滚动
	};
	
	const handleTouchEnd = (e: TouchEvent) => {
		if (isScrolling) return;
		
		touchEndY = e.changedTouches[0].clientY;
		const deltaY = touchStartY - touchEndY;
		const absDelta = Math.abs(deltaY);
		
		// 滑动距离必须足够大才触发
		if (absDelta < 50) return;
		
		if (deltaY > 0 && currentSection < sections.length - 1) {
			// 向上滑动 - 下一页
			onSectionChange(currentSection + 1);
		} else if (deltaY < 0 && currentSection > 0) {
			// 向下滑动 - 上一页
			onSectionChange(currentSection - 1);
		}
	};
	
	// 键盘导航支持
	const handleKeyDown = (e: KeyboardEvent) => {
		if (isScrolling) return;
		
		if (e.key === 'ArrowDown' || e.key === 'PageDown') {
			e.preventDefault();
			if (currentSection < sections.length - 1) {
				onSectionChange(currentSection + 1);
			}
		} else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
			e.preventDefault();
			if (currentSection > 0) {
				onSectionChange(currentSection - 1);
			}
		} else if (e.key === 'Home') {
			e.preventDefault();
			onSectionChange(0);
		} else if (e.key === 'End') {
			e.preventDefault();
			onSectionChange(sections.length - 1);
		}
	};
	
	onMount(() => {
		// 监听滚轮事件
		window.addEventListener('wheel', handleWheel, { passive: false });
		window.addEventListener('keydown', handleKeyDown);
		
		// 监听触摸事件 - 移动端支持
		window.addEventListener('touchstart', handleTouchStart, { passive: true });
		window.addEventListener('touchmove', handleTouchMove, { passive: false });
		window.addEventListener('touchend', handleTouchEnd, { passive: true });
		
		return () => {
			window.removeEventListener('wheel', handleWheel);
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('touchstart', handleTouchStart);
			window.removeEventListener('touchmove', handleTouchMove);
			window.removeEventListener('touchend', handleTouchEnd);
			clearTimeout(scrollTimeout);
		};
	});
</script>

<!-- 全屏滚动控制器 - 不可见组件 -->
<div class="hidden"></div>