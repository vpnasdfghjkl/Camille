import { writable } from 'svelte/store';

// 控制全局滚动行为的状态
export const isModalOpen = writable(false);
export const shouldPreventScroll = writable(false);

// 便捷函数
export function enableModalScrolling() {
    isModalOpen.set(true);
    shouldPreventScroll.set(true);
}

export function disableModalScrolling() {
    isModalOpen.set(false);
    shouldPreventScroll.set(false);
}