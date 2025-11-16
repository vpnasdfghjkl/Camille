import { writable, type Writable } from 'svelte/store';

type theme = 'light' | 'dark' | 'system';

export const openMobileMenu: Writable<boolean> = writable(false);
export const theme: Writable<theme> = writable<theme>();
export const searchOpen: Writable<boolean> = writable(false);
export const currentHeadingId: Writable<string> = writable('');

// 重新导出滚动控制状态
export { isModalOpen, shouldPreventScroll, enableModalScrolling, disableModalScrolling } from './stores/scroll';