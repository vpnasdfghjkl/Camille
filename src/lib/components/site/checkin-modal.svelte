<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { browser } from '$app/environment';
	import type { DailyCheckin } from '$lib/types/checkin';
	import type { FocusTaskConfig } from '$lib/config/focus-tasks';
	import { enableModalScrolling, disableModalScrolling } from '$lib/stores/scroll';
	import {
		X,
		Trash2,
		Plus,
		Calendar,
		CheckCircle2,
		AlertCircle,
		Quote,
		Target
	} from 'lucide-svelte';
	import { fade, fly } from 'svelte/transition';

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
	// Plan Items for Checklist
	type PlanItem = {
		id: string;
		text: string;
		completed: boolean;
	};
	let planItems: PlanItem[] = [];
	let newPlanText = '';

	let focusTasksCompleted = 0;
	let notes = '';

	// 表单状态
	let isLoading = false;
	let errorMessage = '';
	let showNote = false;

	// Direction tag options
	let focusTasks: Array<{
		id: string;
		name: string;
		icon: string;
		description: string;
		isCompleted: boolean;
	}> = [];

	// ----------------------------------------------------------------
	// Helper Functions
	// ----------------------------------------------------------------

	const LEGACY_FOCUS_TASK_ALIASES: Record<string, string> = {
		'graduation-project': 'familiar-domain',
		'Graduation Project': 'familiar-domain',
		'coding-logical': 'familiar-domain',
		'Coding/Logical': 'familiar-domain',
		paper: 'familiar-domain',
		Paper: 'familiar-domain',
		'work-project': 'familiar-domain',
		'work project': 'familiar-domain',
		'Work Project': 'familiar-domain',
		'familiar domain': 'familiar-domain',
		'familiar-domain': 'familiar-domain',
		'new exploration': 'new-exploration',
		'new-exploration': 'new-exploration',
		running: 'running',
		Running: 'running',
		'reading-learning': 'reading',
		'Reading/Learning': 'reading',
		communication: 'communication',
		Communication: 'communication'
	};

	function generateId() {
		return Math.random().toString(36).substr(2, 9);
	}

	function convertToFocusTasks(tasks: FocusTaskConfig[]): typeof focusTasks {
		return tasks.map((task) => ({
			id: task.id,
			name: task.name,
			icon: task.icon,
			description: task.description,
			isCompleted: false
		}));
	}

	// Parse Markdown-like checklist to PlanItems
	function parseWorkPlan(plan: string): PlanItem[] {
		if (!plan) return [];
		return plan
			.split('\n')
			.filter((line) => line.trim())
			.map((line) => {
				const completed = line.startsWith('- [x] ');
				let content = line.replace(/^- \[[ x]\] /, '').trim();

				// Strip legacy [HH:MM] [XXm] prefixes, but no longer expose them in the UI.
				const timeMatch = content.match(/^\[(\d{1,2}:\d{2})\]\s*(?:\[(\d+)m\])?\s*(.*)/);
				if (timeMatch) {
					content = timeMatch[3] || '';
				}

				return {
					id: generateId(),
					text: content || line,
					completed
				};
			});
	}

	// Serialize PlanItems to Markdown-like string
	function serializeWorkPlan(items: PlanItem[]): string {
		return items
			.map((item) => {
				return `- [${item.completed ? 'x' : ' '}] ${item.text}`;
			})
			.join('\n');
	}

	// ----------------------------------------------------------------
	// Reactive Statements
	// ----------------------------------------------------------------

	$: if (focusTasksConfig.length > 0) {
		if (focusTasks.length === 0) {
			focusTasks = convertToFocusTasks(focusTasksConfig);
		} else {
			const newTasks = convertToFocusTasks(focusTasksConfig);
			focusTasks = newTasks.map((newTask) => {
				const existingTask = focusTasks.find((t) => t.id === newTask.id);
				return existingTask ? { ...newTask, isCompleted: existingTask.isCompleted } : newTask;
			});
		}
	}

	$: if (isOpen && existingCheckin) {
		loadCheckinData(existingCheckin);
	}

	$: if (isOpen && !existingCheckin) {
		resetForm();
	}

	// Monitor browser scroll
	$: if (browser) {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
			enableModalScrolling();
		} else {
			document.body.style.overflow = '';
			disableModalScrolling();
		}
	}

	// ----------------------------------------------------------------
	// Logic
	// ----------------------------------------------------------------

	function loadCheckinData(checkin: DailyCheckin) {
		planItems = parseWorkPlan(checkin.workPlan || '');

		if (checkin.focusTasks && checkin.focusTasks.length > 0) {
			focusTasks = focusTasks.map((task) => {
				const savedTask = checkin.focusTasks.find((t) => {
					const canonicalId =
						LEGACY_FOCUS_TASK_ALIASES[t.id] || LEGACY_FOCUS_TASK_ALIASES[t.name] || t.id;
					return canonicalId === task.id;
				});
				return { ...task, isCompleted: savedTask?.isCompleted || false };
			});
		}

		focusTasksCompleted = checkin.focusTasksCompleted || 0;
		notes = checkin.notes || '';
		showNote = Boolean(notes);
	}

	function resetForm() {
		planItems = [];
		newPlanText = '';
		focusTasks = focusTasks.map((task) => ({ ...task, isCompleted: false }));
		focusTasksCompleted = 0;
		notes = '';
		errorMessage = '';
		showNote = false;
	}

	// Plan Item Management
	// Smart time parsing
	$: if (newPlanText) {
		const timeRegex = /^(\d{1,2}[:：]\d{2})\s/;
		const match = newPlanText.match(timeRegex);
		if (match) {
			newPlanText = newPlanText.replace(timeRegex, '');
		}
	}

	function addPlanItem() {
		if (!newPlanText.trim()) return;
		planItems = [
			...planItems,
			{
				id: generateId(),
				text: newPlanText.trim(),
				completed: false
			}
		];

		newPlanText = '';
	}

	function removePlanItem(id: string) {
		planItems = planItems.filter((item) => item.id !== id);
	}

	function togglePlanItem(id: string) {
		planItems = planItems.map((item) =>
			item.id === id ? { ...item, completed: !item.completed } : item
		);
	}

	// Auto-resize action for textarea
	function autoresize(node: HTMLTextAreaElement) {
		function resize() {
			node.style.height = 'auto';
			node.style.height = node.scrollHeight + 'px';
		}
		node.addEventListener('input', resize);

		// Initial resize needs a tick or slight delay
		setTimeout(resize, 0);

		return {
			destroy() {
				node.removeEventListener('input', resize);
			}
		};
	}

	// Focus action for inputs
	function focus(element: HTMLElement) {
		element.focus();
	}

	function handlePlanKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			addPlanItem();
		}
	}

	// Submission
	function closeModal() {
		isOpen = false;
		dispatch('close');
	}

	async function handleSubmit() {
		if (!selectedDate) return;

		// If plan list is empty but user typed something in input, add it
		if (planItems.length === 0 && newPlanText.trim()) {
			addPlanItem();
		}

		if (planItems.length === 0) {
			errorMessage = 'Please add at least one item to your plan.';
			return;
		}

		isLoading = true;
		errorMessage = '';

		try {
			const checkinData = {
				date: selectedDate,
				workPlan: serializeWorkPlan(planItems),
				focusTasks: focusTasks,
				focusTasksCompleted: focusTasks.filter((task) => task.isCompleted).length,
				notes: notes.trim() || undefined
			};

			const response = await fetch('/api/checkin', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(checkinData)
			});

			const result = await response.json();

			if (result.success && result.data) {
				dispatch('save', result.data);
				closeModal();
			} else {
				errorMessage = result.error || 'Failed to save.';
			}
		} catch (error) {
			errorMessage = `Network error: ${error instanceof Error ? error.message : 'Unknown'}`;
		} finally {
			isLoading = false;
		}
	}

	async function handleDelete() {
		if (!selectedDate || !existingCheckin || !confirm('Delete this check-in?')) return;
		isLoading = true;
		try {
			const response = await fetch(`/api/checkin?date=${selectedDate}`, { method: 'DELETE' });
			const result = await response.json();
			if (result.success) {
				dispatch('delete', selectedDate);
				closeModal();
			} else {
				errorMessage = result.error || 'Failed to delete.';
			}
		} catch (error) {
			errorMessage = 'Network error.';
		} finally {
			isLoading = false;
		}
	}

	// Keyboard Shortcuts
	function handleKeydown(event: KeyboardEvent) {
		if (!isOpen) return;
		if (event.key === 'Escape') closeModal();
		if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) handleSubmit();
	}

	onMount(() => {
		if (browser) {
			document.addEventListener('keydown', handleKeydown);
			return () => document.removeEventListener('keydown', handleKeydown);
		}
	});
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
		role="dialog"
		aria-modal="true"
	>
		<!-- Backdrop -->
		<button
			type="button"
			aria-label="Close modal"
			class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
			on:click={closeModal}
			transition:fade={{ duration: 200 }}
		/>

		<!-- Modal Container -->
		<div
			class="relative w-full max-w-3xl h-[85vh] bg-white dark:bg-slate-950 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
			transition:fly={{ y: 20, duration: 300 }}
		>
			<!-- Header -->
			<div
				class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm z-10"
			>
				<div class="flex items-center gap-3">
					<div
						class="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300"
					>
						<Calendar size={20} />
					</div>
					<div>
						<h2 class="text-lg font-bold text-slate-900 dark:text-white leading-tight">
							{existingCheckin ? 'Update Entry' : 'New Entry'}
						</h2>
						<p class="text-sm text-slate-500 dark:text-slate-400">
							{selectedDate
								? new Date(selectedDate).toLocaleDateString('en-US', {
										weekday: 'long',
										month: 'long',
										day: 'numeric'
								  })
								: ''}
						</p>
					</div>
				</div>
				<button
					on:click={closeModal}
					class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
				>
					<X size={20} />
				</button>
			</div>

			<!-- Main Content -->
			<div class="flex-1 overflow-y-auto bg-white dark:bg-slate-950">
				<div class="p-5 sm:p-6 lg:p-8 space-y-6">
					<section class="space-y-3">
						<div class="flex items-center justify-between">
							<h3
								class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"
							>
								<Target size={12} /> Direction
							</h3>
							<span
								class="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full"
							>
								{focusTasks.filter((t) => t.isCompleted).length}/{focusTasks.length}
							</span>
						</div>
						<div class="flex flex-wrap gap-2">
							{#each focusTasks as task}
								<label
									class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors
									{task.isCompleted
										? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100'
										: 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600'}"
								>
									<input type="checkbox" bind:checked={task.isCompleted} class="sr-only" />
									<span class="text-sm">{task.icon}</span>
									<span class="text-sm font-medium">{task.name}</span>
								</label>
							{/each}
						</div>
					</section>

					<section class="space-y-3">
						<div class="flex items-center justify-between">
							<h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
								<span class="text-slate-400">#</span> Tasks
							</h3>
							<span class="text-xs text-slate-400">
								{planItems.filter((i) => i.completed).length}/{planItems.length} Done
							</span>
						</div>

						<div
							class="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
						>
							<div
								class="p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
							>
								<Plus size={18} class="text-slate-400" />
								<input
									type="text"
									bind:value={newPlanText}
									placeholder="Add a task..."
									class="flex-1 p-1 bg-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400"
									on:keydown={handlePlanKeydown}
								/>
								<button
									on:click={() => addPlanItem()}
									disabled={!newPlanText.trim()}
									class="px-3 py-1.5 text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
								>
									ADD
								</button>
							</div>

							<div class="max-h-[360px] overflow-y-auto p-2 space-y-1">
								{#if planItems.length === 0}
									<div class="p-8 text-center text-slate-400 text-sm italic">No tasks yet.</div>
								{/if}
								{#each planItems as item, index (item.id)}
									<div
										class="group flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
									>
										<button
											class="min-w-[1.25rem] h-5 rounded border-2 flex items-center justify-center transition-all
											{item.completed
												? 'bg-slate-800 border-slate-800 text-white dark:bg-slate-200 dark:border-slate-200 dark:text-slate-900'
												: 'border-slate-300 dark:border-slate-600 hover:border-slate-500'}"
											on:click={() => togglePlanItem(item.id)}
										>
											{#if item.completed} <CheckCircle2 size={12} /> {/if}
										</button>

										<input
											type="text"
											bind:value={planItems[index].text}
											class="flex-1 min-w-0 bg-transparent outline-none text-sm text-slate-700 dark:text-slate-300 {item.completed
												? 'line-through text-slate-400'
												: ''}"
										/>

										<button
											on:click={() => removePlanItem(item.id)}
											class="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
										>
											<Trash2 size={16} />
										</button>
									</div>
								{/each}
							</div>
						</div>
					</section>

					<section class="space-y-3">
						<button
							on:click={() => (showNote = !showNote)}
							class="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
						>
							<Quote size={16} class="text-slate-400" />
							{showNote ? 'Hide daily note' : 'Add daily note'}
						</button>

						{#if showNote}
							<div
								class="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/30"
							>
								<textarea
									bind:value={notes}
									placeholder="Optional note..."
									class="w-full min-h-[140px] p-4 bg-transparent resize-none outline-none text-slate-700 dark:text-slate-300 leading-6 placeholder:text-slate-400/60 block rounded-2xl"
									use:autoresize
								/>
							</div>
						{/if}
					</section>
				</div>
			</div>

			<!-- Footer -->
			<div
				class="border-t border-slate-100 dark:border-slate-800 p-4 lg:p-6 bg-white dark:bg-slate-950 flex items-center justify-between z-10"
			>
				{#if existingCheckin}
					<button
						on:click={handleDelete}
						class="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
					>
						<Trash2 size={16} /> Delete
					</button>
				{:else}
					<div />
				{/if}

				<div class="flex gap-3">
					<button
						on:click={closeModal}
						class="px-6 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
					>
						Cancel
					</button>
					<button
						on:click={handleSubmit}
						disabled={isLoading || planItems.length === 0}
						class="px-8 py-2.5 bg-slate-800 hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-300 text-white text-sm font-bold rounded-xl shadow-lg shadow-slate-900/10 disabled:opacity-50 disabled:shadow-none transition-all transform active:scale-95 flex items-center gap-2"
					>
						{#if isLoading}
							<div
								class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
							/>
						{/if}
						Save Entry
					</button>
				</div>
			</div>

			<!-- Error Toast (Floating) -->
			{#if errorMessage}
				<div
					class="absolute bottom-20 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-full shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-2"
				>
					<AlertCircle size={16} />
					{errorMessage}
				</div>
			{/if}
		</div>
	</div>
{/if}
