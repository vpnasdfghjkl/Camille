<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { browser } from '$app/environment';
	import type { DailyCheckin } from '$lib/types/checkin';
	import type { FocusTaskConfig } from '$lib/config/focus-tasks';
	import { convertToFocusTasks } from '$lib/config/focus-tasks';
	import { enableModalScrolling, disableModalScrolling } from '$lib/stores/scroll';
	
	// Props
	export let isOpen = false;
	export let selectedDate: string | null = null;
	export let existingCheckin: DailyCheckin | null = null;
	export let focusTasksConfig: FocusTaskConfig[] = [];

	// 派发事件
	const dispatch = createEventDispatcher<{
		close: void;
		save: DailyCheckin;
		delete: string;
	}>();

	// 表单数据
	let wakeUpTime = '';
	let workStartTime = '';
	let workPlan = '';
	let focusTasksCompleted = 0;
	let notes = '';

	// 表单状态
	let isLoading = false;
	let errorMessage = '';

	// Focus任务选项 - 只在配置初始化时创建，避免丢失用户选择状态
	let focusTasks: Array<{
		id: string;
		name: string;
		icon: string;
		description: string;
		isCompleted: boolean;
	}> = [];

	// 监听配置变化，智能更新任务列表
	$: if (focusTasksConfig.length > 0) {
		updateFocusTasksFromConfig();
	}

	function updateFocusTasksFromConfig() {
		if (focusTasks.length === 0) {
			// 初始化
			focusTasks = convertToFocusTasks(focusTasksConfig);
		} else {
			// 更新现有任务，保持用户选择状态
			const newTasks = convertToFocusTasks(focusTasksConfig);
			focusTasks = newTasks.map(newTask => {
				const existingTask = focusTasks.find(t => t.id === newTask.id);
				return existingTask ? { ...newTask, isCompleted: existingTask.isCompleted } : newTask;
			});
		}
	}

	// 监听props变化，更新表单数据
	$: if (isOpen && existingCheckin) {
		loadCheckinData(existingCheckin);
	}

	// 监听selectedDate变化，清空表单
	$: if (isOpen && !existingCheckin) {
		resetForm();
	}

	function loadCheckinData(checkin: DailyCheckin) {
		wakeUpTime = checkin.wakeUpTime || '';
		workStartTime = checkin.workStartTime || '';
		workPlan = checkin.workPlan || '';
		
		// 恢复focus任务状态
		if (checkin.focusTasks && checkin.focusTasks.length > 0) {
			focusTasks = focusTasks.map(task => {
				const savedTask = checkin.focusTasks.find(t => t.id === task.id);
				return {
					...task,
					isCompleted: savedTask?.isCompleted || false
				};
			});
		}
		
		focusTasksCompleted = checkin.focusTasksCompleted || 0;
		notes = checkin.notes || '';
	}

	function resetForm() {
		wakeUpTime = '';
		workStartTime = '';
		workPlan = '';
		
		// 重置所有任务状态
		focusTasks = focusTasks.map(task => ({ ...task, isCompleted: false }));
		focusTasksCompleted = 0;
		
		notes = '';
		errorMessage = '';
	}

	function getCurrentTime(): string {
		const now = new Date();
		const hours = now.getHours().toString().padStart(2, '0');
		const minutes = now.getMinutes().toString().padStart(2, '0');
		return `${hours}:${minutes}`;
	}

	function closeModal() {
		isOpen = false;
		resetForm();
		// 恢复背景滚动
		if (browser) {
			document.body.style.overflow = '';
			document.body.style.paddingRight = '';
			disableModalScrolling(); // 确保禁用模态框滚动模式
		}
		dispatch('close');
	}

	async function handleSubmit() {
		if (!selectedDate || !workPlan.trim()) {
			errorMessage = '请填写工作计划';
			return;
		}

		isLoading = true;
		errorMessage = '';

		try {
			const checkinData = {
				date: selectedDate,
				wakeUpTime: wakeUpTime || undefined,
				workStartTime: workStartTime || undefined,
				workPlan: workPlan.trim(),
				focusTasks: focusTasks,
				focusTasksCompleted: focusTasks.filter(task => task.isCompleted).length,
				notes: notes.trim() || undefined
			};

			const response = await fetch('/api/checkin', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(checkinData)
			});

			const result = await response.json();

			if (result.success && result.data) {
				dispatch('save', result.data);
				closeModal();
			} else {
				errorMessage = result.error || '保存失败，请重试';
			}
		} catch (error) {
			console.error('保存打卡记录失败:', error);
			errorMessage = '网络错误，请检查连接';
		} finally {
			isLoading = false;
		}
	}

	async function handleDelete() {
		if (!selectedDate || !existingCheckin) return;

		if (!confirm('确定要删除这条打卡记录吗？')) return;

		isLoading = true;
		errorMessage = '';

		try {
			const response = await fetch(`/api/checkin?date=${selectedDate}`, {
				method: 'DELETE'
			});

			const result = await response.json();

			if (result.success) {
				dispatch('delete', selectedDate);
				closeModal();
			} else {
				errorMessage = result.error || '删除失败，请重试';
			}
		} catch (error) {
			console.error('删除打卡记录失败:', error);
			errorMessage = '网络错误，请检查连接';
		} finally {
			isLoading = false;
		}
	}

	// 快捷时间按钮
	function setCurrentTime(field: 'wake' | 'work') {
		const currentTime = getCurrentTime();
		if (field === 'wake') {
			wakeUpTime = currentTime;
		} else {
			workStartTime = currentTime;
		}
	}

	// 键盘快捷键和滚动控制
	function handleKeydown(event: KeyboardEvent) {
		if (!isOpen) return;
		
		if (event.key === 'Escape') {
			closeModal();
		} else if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
			handleSubmit();
		}
	}

	// 防止背景滚动
	function preventBackgroundScroll() {
		if (!browser) return; // 只在浏览器环境中运行
		
		if (isOpen) {
			document.body.style.overflow = 'hidden';
			document.body.style.paddingRight = '0px'; // 防止滚动条闪烁
			enableModalScrolling(); // 启用模态框滚动模式
		} else {
			document.body.style.overflow = '';
			document.body.style.paddingRight = '';
			disableModalScrolling(); // 禁用模态框滚动模式
		}
	}

	// 监听isOpen变化，控制背景滚动
	$: if (browser) {
		preventBackgroundScroll();
	}

	onMount(() => {
		if (!browser) return;
		
		document.addEventListener('keydown', handleKeydown);
		return () => {
			document.removeEventListener('keydown', handleKeydown);
			// 确保组件卸载时恢复滚动
			document.body.style.overflow = '';
			document.body.style.paddingRight = '';
			disableModalScrolling(); // 确保清理状态
		};
	});
</script>

{#if isOpen}
	<!-- 遮罩层 -->
	<button
		class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-200 border-0 p-0 cursor-default"
		on:click={closeModal}
		aria-label="关闭对话框"
		tabindex="-1"
	></button>

	<!-- 模态框 -->
	<div class="fixed inset-0 flex items-start justify-center pt-16 pb-4 px-4 z-50 overflow-y-auto">
		<div 
			class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-xl max-h-[calc(100vh-8rem)] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col my-8"
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
			on:wheel|stopPropagation
			on:touchmove|stopPropagation
		>
			<!-- 头部 -->
			<div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
				<div>
					<h2 id="modal-title" class="text-xl font-semibold text-gray-900 dark:text-white">
						{existingCheckin ? '编辑' : '新增'}打卡记录
					</h2>
					<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
						{selectedDate ? new Date(selectedDate).toLocaleDateString('zh-CN', { 
							year: 'numeric', 
							month: 'long', 
							day: 'numeric',
							weekday: 'long'
						}) : ''}
					</p>
				</div>
				<button
					on:click={closeModal}
					class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
					aria-label="关闭"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<!-- 内容 -->
			<div class="flex-1 overflow-y-auto overscroll-y-contain" 
				 on:wheel|stopPropagation 
				 on:touchmove|stopPropagation>
				<form id="checkin-form" on:submit|preventDefault={handleSubmit} class="p-6 space-y-6 min-h-full">
					<!-- 时间设置 -->
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="wake-time" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								起床时间
							</label>
							<div class="flex gap-2">
								<input
									id="wake-time"
									type="time"
									bind:value={wakeUpTime}
									class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
								/>
								<button
									type="button"
									on:click={() => setCurrentTime('wake')}
									class="px-3 py-2 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
									title="设为当前时间"
								>
									现在
								</button>
							</div>
						</div>

						<div>
							<label for="work-time" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								工作开始时间
							</label>
							<div class="flex gap-2">
								<input
									id="work-time"
									type="time"
									bind:value={workStartTime}
									class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
								/>
								<button
									type="button"
									on:click={() => setCurrentTime('work')}
									class="px-3 py-2 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
									title="设为当前时间"
								>
									现在
								</button>
							</div>
						</div>
					</div>

					<!-- 工作计划 -->
					<div>
						<label for="work-plan" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							今日工作计划 <span class="text-red-500">*</span>
						</label>
						<textarea
							id="work-plan"
							bind:value={workPlan}
							placeholder="描述你今天的主要工作内容和目标..."
							rows="3"
							required
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none dark:bg-gray-800 dark:text-white placeholder-gray-400"
						></textarea>
					</div>

					<!-- Focus任务选择 -->
					<fieldset>
						<legend class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
							Focus任务完成情况 ({focusTasks.filter(task => task.isCompleted).length}/{focusTasks.length})
						</legend>
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
							{#each focusTasks as task, index}
								<label class="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer transition-all {
									task.isCompleted 
										? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600' 
										: 'hover:bg-gray-50 dark:hover:bg-gray-800'
								}">
									<input
										type="checkbox"
										bind:checked={task.isCompleted}
										on:change={() => {
											console.log(`Task ${task.name} toggled to:`, task.isCompleted);
											focusTasksCompleted = focusTasks.filter(t => t.isCompleted).length;
											console.log('Total completed tasks:', focusTasksCompleted);
										}}
										class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
									/>
									<div class="flex items-center gap-2 flex-1">
										<span class="text-lg">{task.icon}</span>
										<div class="flex-1">
											<div class="font-medium text-gray-900 dark:text-gray-100 text-sm">
												{task.name}
											</div>
											<div class="text-xs text-gray-500 dark:text-gray-400">
												{task.description}
											</div>
										</div>
									</div>
								</label>
							{/each}
						</div>
					</fieldset>

					<!-- 备注 -->
					<div>
						<label for="notes" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							备注
						</label>
						<textarea
							id="notes"
							bind:value={notes}
							placeholder="记录今天的心情、想法或其他信息..."
							rows="2"
							class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none dark:bg-gray-800 dark:text-white placeholder-gray-400"
						></textarea>
					</div>

					<!-- 错误信息 -->
					{#if errorMessage}
						<div class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
							<p class="text-sm text-red-700 dark:text-red-400">{errorMessage}</p>
						</div>
					{/if}
				</form>
			</div>
			
			<!-- 操作按钮 - 固定在底部 -->
			<div class="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-6">
				<div class="flex gap-3">
					{#if existingCheckin}
						<button
							type="button"
							on:click={handleDelete}
							disabled={isLoading}
							class="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
						>
							删除记录
						</button>
					{/if}
					
					<div class="flex-1"></div>
					
					<button
						type="button"
						on:click={closeModal}
						disabled={isLoading}
						class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
					>
						取消
					</button>
					
					<button
						type="submit"
						form="checkin-form"
						disabled={isLoading || !workPlan.trim()}
						class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
					>
						{#if isLoading}
							<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
						{/if}
						{existingCheckin ? '更新' : '保存'}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	/* 动画效果 */
	.animate-in {
		animation-fill-mode: both;
	}

	.fade-in {
		animation: fadeIn 0.2s ease-out;
	}

	.zoom-in-95 {
		animation: zoomIn95 0.2s ease-out;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes zoomIn95 {
		from { 
			opacity: 0; 
			transform: scale(0.95); 
		}
		to { 
			opacity: 1; 
			transform: scale(1); 
		}
	}
</style>