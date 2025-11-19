<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { browser } from '$app/environment';
	import type { DailyCheckin } from '$lib/types/checkin';
	import type { FocusTaskConfig } from '$lib/config/focus-tasks';
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

	// 将焦点任务配置转换为打卡模态框格式
	function convertToFocusTasks(tasks: FocusTaskConfig[]): Array<{
		id: string;
		name: string;
		icon: string;
		description: string;
		isCompleted: boolean;
	}> {
		return tasks.map(task => ({
			id: task.id,
			name: task.name,
			icon: task.icon,
			description: task.description,
			isCompleted: false
		}));
	}

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

			console.log('提交打卡数据:', checkinData);

			const response = await fetch('/api/checkin', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(checkinData)
			});

			console.log('响应状态:', response.status, response.statusText);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const result = await response.json();
			console.log('API 响应:', result);

			if (result.success && result.data) {
				console.log('保存成功，关闭模态框');
				dispatch('save', result.data);
				closeModal();
			} else {
				errorMessage = result.error || '保存失败，请重试';
				console.error('API 返回错误:', result.error);
			}
		} catch (error) {
			console.error('保存打卡记录失败:', error);
			errorMessage = `网络错误: ${error instanceof Error ? error.message : '请检查连接'}`;
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
		class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 animate-in fade-in duration-200 border-0 p-0 cursor-default"
		on:click={closeModal}
		aria-label="关闭对话框"
		tabindex="-1"
	></button>

	<!-- 模态框 -->
	<div class="fixed inset-0 flex items-start justify-center pt-16 pb-4 px-4 z-50 overflow-y-auto">
		<div 
			class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl max-h-[calc(100vh-8rem)] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col my-8 ring-1 ring-slate-900/5"
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
			on:wheel|stopPropagation
			on:touchmove|stopPropagation
		>
			<!-- 头部 -->
			<div class="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 flex-shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
				<div>
					<h2 id="modal-title" class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
						<span class="w-2 h-2 rounded-full bg-blue-500"></span>
						{existingCheckin ? 'Edit Check-in' : 'New Check-in'}
					</h2>
					<p class="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
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
					class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
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
							<label for="wake-time" class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
								Wake Up Time
							</label>
							<div class="flex gap-2">
								<input
									id="wake-time"
									type="time"
									bind:value={wakeUpTime}
									class="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white transition-all"
								/>
								<button
									type="button"
									on:click={() => setCurrentTime('wake')}
									class="px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
									title="设为当前时间"
								>
									Now
								</button>
							</div>
						</div>

						<div>
							<label for="work-time" class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
								Work Start
							</label>
							<div class="flex gap-2">
								<input
									id="work-time"
									type="time"
									bind:value={workStartTime}
									class="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white transition-all"
								/>
								<button
									type="button"
									on:click={() => setCurrentTime('work')}
									class="px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
									title="设为当前时间"
								>
									Now
								</button>
							</div>
						</div>
					</div>

					<!-- 工作计划 -->
					<div>
						<label for="work-plan" class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
							Daily Plan <span class="text-blue-500">*</span>
						</label>
						<textarea
							id="work-plan"
							bind:value={workPlan}
							placeholder="What are your main goals for today?"
							rows="3"
							required
							class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none dark:text-white placeholder-slate-400 transition-all"
						></textarea>
					</div>

					<!-- Focus任务选择 -->
					<fieldset>
						<legend class="flex items-center justify-between w-full mb-3">
							<span class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Focus Tasks</span>
							<span class="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300">
								{focusTasks.filter(task => task.isCompleted).length}/{focusTasks.length} Completed
							</span>
						</legend>
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
							{#each focusTasks as task, index}
								<label class="relative flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-all duration-200 group
									{task.isCompleted 
										? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' 
										: 'bg-white dark:bg-slate-800/30 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
									}">
									<div class="flex items-center h-5 mt-0.5">
										<input
											type="checkbox"
											bind:checked={task.isCompleted}
											on:change={() => {
												console.log(`Task ${task.name} toggled to:`, task.isCompleted);
												focusTasksCompleted = focusTasks.filter(t => t.isCompleted).length;
											}}
											class="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 focus:ring-2 dark:bg-slate-700 dark:border-slate-600 transition-colors"
										/>
									</div>
									<div class="flex-1 min-w-0">
										<div class="flex items-center gap-2 mb-0.5">
											<span class="text-lg group-hover:scale-110 transition-transform duration-200">{task.icon}</span>
											<span class="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
												{task.name}
											</span>
										</div>
										<p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
											{task.description}
										</p>
									</div>
								</label>
							{/each}
						</div>
					</fieldset>

					<!-- 备注 -->
					<div>
						<label for="notes" class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
							Notes
						</label>
						<textarea
							id="notes"
							bind:value={notes}
							placeholder="Any thoughts, feelings, or extra details..."
							rows="2"
							class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none dark:text-white placeholder-slate-400 transition-all"
						></textarea>
					</div>

					<!-- 错误信息 -->
					{#if errorMessage}
						<div class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
							<svg class="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<p class="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
						</div>
					{/if}
				</form>
			</div>
			
			<!-- 操作按钮 - 固定在底部 -->
			<div class="flex-shrink-0 border-t border-slate-100 dark:border-slate-800 p-6 bg-slate-50/50 dark:bg-slate-900/50">
				<div class="flex gap-3">
					{#if existingCheckin}
						<button
							type="button"
							on:click={handleDelete}
							disabled={isLoading}
							class="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
						>
							Delete
						</button>
					{/if}
					
					<div class="flex-1"></div>
					
					<button
						type="button"
						on:click={closeModal}
						disabled={isLoading}
						class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
					>
						Cancel
					</button>
					
					<button
						type="submit"
						form="checkin-form"
						disabled={isLoading || !workPlan.trim()}
						class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-sm font-medium rounded-lg shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/30 disabled:shadow-none disabled:opacity-50 flex items-center gap-2"
					>
						{#if isLoading}
							<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
						{/if}
						{existingCheckin ? 'Update' : 'Save'}
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