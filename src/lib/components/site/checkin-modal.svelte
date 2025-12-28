<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { browser } from '$app/environment';
	import type { DailyCheckin } from '$lib/types/checkin';
	import type { FocusTaskConfig } from '$lib/config/focus-tasks';
	import { enableModalScrolling, disableModalScrolling } from '$lib/stores/scroll';
	import { X, Trash2, Plus, Calendar, Clock, CheckCircle2, Circle, AlertCircle, Quote, Target } from 'lucide-svelte';
	import { fade, fly, slide } from 'svelte/transition';
	
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
	// Plan Items for Checklist
	type PlanItem = { 
        id: string; 
        text: string; 
        completed: boolean; 
        startTime?: string; 
        duration?: number;
        isEditingTime?: boolean; // UI state
    };
	let planItems: PlanItem[] = [];
	let newPlanText = '';
	let newPlanStartTime = '';
	let newPlanDuration = 30; // Default duration
	
	let focusTasksCompleted = 0;
	let notes = '';

	// 表单状态
	let isLoading = false;
	let errorMessage = '';
	let activeTab: 'plan' | 'note' = 'plan'; // For mobile or focusing

	// Focus任务选项
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

	function generateId() {
		return Math.random().toString(36).substr(2, 9);
	}

	function convertToFocusTasks(tasks: FocusTaskConfig[]): typeof focusTasks {
		return tasks.map(task => ({
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
		return plan.split('\n').filter(line => line.trim()).map(line => {
			const completed = line.startsWith('- [x] ');
			let content = line.replace(/^- \[[ x]\] /, '').trim();
			
			// Extract time and duration [HH:MM] [XXm]
			let startTime = '';
			let duration = 0;
			
			// Regex for [HH:MM] [XXm] or just [HH:MM]
			const timeMatch = content.match(/^\[(\d{1,2}:\d{2})\]\s*(?:\[(\d+)m\])?\s*(.*)/);
			if (timeMatch) {
				startTime = timeMatch[1];
				duration = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
				content = timeMatch[3] || '';
			}

			return { id: generateId(), text: content || line, completed, startTime, duration, isEditingTime: false };
		});
	}

	// Serialize PlanItems to Markdown-like string
	function serializeWorkPlan(items: PlanItem[]): string {
		return items.map(item => {
			const timeStr = item.startTime ? `[${item.startTime}] ` : '';
			const durationStr = item.duration ? `[${item.duration}m] ` : '';
			return `- [${item.completed ? 'x' : ' '}] ${timeStr}${durationStr}${item.text}`;
		}).join('\n');
	}

	// ----------------------------------------------------------------
	// Reactive Statements
	// ----------------------------------------------------------------

	$: if (focusTasksConfig.length > 0) {
		if (focusTasks.length === 0) {
			focusTasks = convertToFocusTasks(focusTasksConfig);
		} else {
			const newTasks = convertToFocusTasks(focusTasksConfig);
			focusTasks = newTasks.map(newTask => {
				const existingTask = focusTasks.find(t => t.id === newTask.id);
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
		wakeUpTime = checkin.wakeUpTime || '';
		workStartTime = checkin.workStartTime || '';
		planItems = parseWorkPlan(checkin.workPlan || '');
		
		if (checkin.focusTasks && checkin.focusTasks.length > 0) {
			focusTasks = focusTasks.map(task => {
				const savedTask = checkin.focusTasks.find(t => t.id === task.id);
				return { ...task, isCompleted: savedTask?.isCompleted || false };
			});
		}
		
		focusTasksCompleted = checkin.focusTasksCompleted || 0;
		notes = checkin.notes || '';
        
        updateNextStartTime();
	}

	function resetForm() {
		wakeUpTime = '';
		workStartTime = '';
		planItems = [];
		newPlanText = '';
		newPlanStartTime = '';
		newPlanDuration = 30;
		focusTasks = focusTasks.map(task => ({ ...task, isCompleted: false }));
		focusTasksCompleted = 0;
		notes = '';
		errorMessage = '';
		activeTab = 'plan';
	}

	function getCurrentTime(): string {
		const now = new Date();
		const hours = now.getHours().toString().padStart(2, '0');
		const minutes = now.getMinutes().toString().padStart(2, '0');
		return `${hours}:${minutes}`;
	}

	function setCurrentTime(field: 'wake' | 'work') {
		const currentTime = getCurrentTime();
		if (field === 'wake') wakeUpTime = currentTime;
		else workStartTime = currentTime;
	}

	// Time Calculation Helper
	function addMinutesToTime(time: string, minutes: number): string {
		if (!time) return '';
		const [h, m] = time.split(':').map(Number);
		const date = new Date();
		date.setHours(h, m + minutes);
		return date.toTimeString().slice(0, 5);
	}

    function getEndTime(start: string, duration: number) {
        if (!start || !duration) return '';
        return addMinutesToTime(start, duration);
    }

	// Auto-set next start time helper
    function updateNextStartTime() {
		// Find last item with time
		const sortedItems = [...planItems].filter(i => i.startTime).sort((a, b) => a.startTime!.localeCompare(b.startTime!));
		
		if (sortedItems.length > 0) {
			const lastItem = sortedItems[sortedItems.length - 1];
			if (lastItem.startTime) {
				const duration = lastItem.duration || 0;
				// +10 min buffer
				newPlanStartTime = addMinutesToTime(lastItem.startTime, duration + 10);
			}
		} else if (workStartTime) {
			newPlanStartTime = workStartTime;
		}
    }

    // Initialize start time when workStartTime changes (only if empty)
    $: if (workStartTime && planItems.length === 0 && !newPlanStartTime) {
        newPlanStartTime = workStartTime;
    }

	// Plan Item Management
    // Smart time parsing
    $: if (newPlanText) {
        const timeRegex = /^(\d{1,2}[:：]\d{2})\s/;
        const match = newPlanText.match(timeRegex);
        if (match) {
            const parsedTime = match[1].replace('：', ':').padStart(5, '0'); // Normalize
            newPlanText = newPlanText.replace(timeRegex, '');
            // Update the bound startTime as well if smart parsed
            newPlanStartTime = parsedTime;
        }
    }

	function addPlanItem() {
		if (!newPlanText.trim()) return;
		planItems = [...planItems, { 
			id: generateId(), 
			text: newPlanText.trim(), 
			completed: false,
			startTime: newPlanStartTime,
			duration: newPlanDuration,
            isEditingTime: false
		}];
		
		// Smart sort by start time
		planItems.sort((a, b) => {
            if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
            if (a.startTime) return -1;
            if (b.startTime) return 1;
            return 0; 
		});
		
		newPlanText = '';
        updateNextStartTime();
	}

	function removePlanItem(id: string) {
		planItems = planItems.filter(item => item.id !== id);
	}

	function togglePlanItem(id: string) {
		planItems = planItems.map(item => 
			item.id === id ? { ...item, completed: !item.completed } : item
		);
	}

    function editTime(id: string) {
        planItems = planItems.map(i => i.id === id ? { ...i, isEditingTime: true } : i);
    }

    function saveTime(id: string) {
        planItems = planItems.map(i => i.id === id ? { ...i, isEditingTime: false } : i);
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
				wakeUpTime: wakeUpTime || undefined,
				workStartTime: workStartTime || undefined,
				workPlan: serializeWorkPlan(planItems),
				focusTasks: focusTasks,
				focusTasksCompleted: focusTasks.filter(task => task.isCompleted).length,
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
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
		<!-- Backdrop -->
		<div 
			class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
			on:click={closeModal} 
			transition:fade={{ duration: 200 }}
		></div>

		<!-- Modal Container -->
		<div 
			class="relative w-full max-w-5xl h-[85vh] bg-white dark:bg-slate-950 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
			transition:fly={{ y: 20, duration: 300 }}
		>
			<!-- Header -->
			<div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm z-10">
				<div class="flex items-center gap-3">
					<div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
						<Calendar size={20} />
					</div>
					<div>
						<h2 class="text-lg font-bold text-slate-900 dark:text-white leading-tight">
							{existingCheckin ? 'Update Entry' : 'New Entry'}
						</h2>
						<p class="text-sm text-slate-500 dark:text-slate-400">
							{selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : ''}
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
			<div class="flex-1 overflow-hidden flex flex-col lg:flex-row">
				
				<!-- Left Sidebar / Top Section (Time & Focus) -->
				<div class="w-full lg:w-80 bg-slate-50/50 dark:bg-slate-900/30 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 flex flex-col overflow-y-auto">
					<div class="p-6 space-y-8">
						<!-- Time Settings -->
						<div class="space-y-4">
							<h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
								<Clock size={12} /> Time Log
							</h3>
							<div class="grid grid-cols-2 lg:grid-cols-1 gap-4">
								<div class="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
									<label class="text-xs text-slate-500 mb-1.5 block">Wake Up</label>
									<div class="flex gap-2">
										<input 
											type="time" 
											bind:value={wakeUpTime}
											class="flex-1 bg-transparent text-sm font-medium text-slate-900 dark:text-white outline-none"
										/>
										<button on:click={() => setCurrentTime('wake')} class="text-blue-500 hover:text-blue-600 text-xs font-bold px-1">NOW</button>
									</div>
								</div>
								<div class="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
									<label class="text-xs text-slate-500 mb-1.5 block">Work Start</label>
									<div class="flex gap-2">
										<input 
											type="time" 
											bind:value={workStartTime}
											class="flex-1 bg-transparent text-sm font-medium text-slate-900 dark:text-white outline-none"
										/>
										<button on:click={() => setCurrentTime('work')} class="text-blue-500 hover:text-blue-600 text-xs font-bold px-1">NOW</button>
									</div>
								</div>
							</div>
						</div>

						<!-- Focus Tasks -->
						<div class="space-y-4">
							<div class="flex items-center justify-between">
								<h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
									<Target size={12} /> Focus Areas
								</h3>
								<span class="text-[10px] font-bold px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
									{focusTasks.filter(t => t.isCompleted).length}/{focusTasks.length}
								</span>
							</div>
							<div class="space-y-2">
								{#each focusTasks as task}
									<label class="flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group
										{task.isCompleted 
											? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' 
											: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}"
									>
										<div class="relative flex items-center justify-center">
											<input type="checkbox" bind:checked={task.isCompleted} class="peer sr-only" />
											<div class="w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all flex items-center justify-center text-white">
												<CheckCircle2 size={12} class="opacity-0 peer-checked:opacity-100" />
											</div>
										</div>
										<div class="flex-1 min-w-0">
											<div class="flex items-center gap-2">
												<span class="text-base">{task.icon}</span>
												<span class="text-sm font-medium text-slate-700 dark:text-slate-200 {task.isCompleted ? 'text-blue-700 dark:text-blue-300' : ''}">
													{task.name}
												</span>
											</div>
										</div>
									</label>
								{/each}
							</div>
						</div>
					</div>
				</div>

				<!-- Right Main Content -->
				<div class="flex-1 flex flex-col h-full bg-white dark:bg-slate-950">
					<!-- Tabs (Mobile only mostly, but good for structure) -->
					<div class="flex border-b border-slate-100 dark:border-slate-800 lg:hidden">
						<button 
							class="flex-1 py-3 text-sm font-medium border-b-2 transition-colors {activeTab === 'plan' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500'}"
							on:click={() => activeTab = 'plan'}
						>
							Plan & Todo
						</button>
						<button 
							class="flex-1 py-3 text-sm font-medium border-b-2 transition-colors {activeTab === 'note' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500'}"
							on:click={() => activeTab = 'note'}
						>
							Daily Note
						</button>
					</div>

					<!-- Content Area -->
					<div class="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8">
						
						<!-- Plan Section -->
						<div class="{activeTab === 'plan' ? 'block' : 'hidden lg:block'} space-y-4">
							<div class="flex items-center justify-between">
								<h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
									<span class="text-blue-500">#</span> Daily Plan
								</h3>
								<span class="text-xs text-slate-400">{planItems.filter(i => i.completed).length}/{planItems.length} Done</span>
							</div>
							
							<div class="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
								<!-- Input -->
								<div class="p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 gap-3">
									<div class="flex items-center gap-2 mb-2">
										<div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1">
											<Clock size={14} class="text-slate-400" />
											<input 
												type="time" 
												bind:value={newPlanStartTime}
												class="bg-transparent border-none outline-none text-xs font-mono text-slate-600 dark:text-slate-300 w-20"
											/>
										</div>
										<div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1">
											<span class="text-xs text-slate-400 font-mono">Duration:</span>
											<input 
												type="number" 
												bind:value={newPlanDuration}
												min="5"
												step="5"
												class="bg-transparent border-none outline-none text-xs font-mono text-slate-600 dark:text-slate-300 w-12 text-center"
											/>
											<span class="text-xs text-slate-400">m</span>
										</div>
									</div>
									
									<div class="flex items-center gap-2">
										<Plus size={20} class="text-slate-400" />
										<input 
											type="text" 
											bind:value={newPlanText}
											placeholder="Add a new task..." 
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
								</div>

								<!-- List -->
								<div class="max-h-[300px] overflow-y-auto p-2 space-y-1">
									{#if planItems.length === 0}
										<div class="p-8 text-center text-slate-400 text-sm italic">
											No tasks yet. Start planning your day!
										</div>
									{/if}
									{#each planItems as item, index (item.id)}
										<div 
											class="group flex items-start gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors animate-in slide-in-from-top-1 duration-200"
										>
											<button 
												class="mt-0.5 min-w-[1.25rem] h-5 rounded border-2 flex items-center justify-center transition-all
												{item.completed 
													? 'bg-blue-500 border-blue-500 text-white' 
													: 'border-slate-300 dark:border-slate-600 hover:border-blue-400'}"
												on:click={() => togglePlanItem(item.id)}
											>
												{#if item.completed} <CheckCircle2 size={12} /> {/if}
											</button>
											
											<div class="flex-1 min-w-0 flex flex-col gap-0.5">
												<div class="flex items-center gap-2 h-6">
                                                    {#if item.isEditingTime}
                                                        <div class="flex items-center gap-2 bg-white dark:bg-slate-900 rounded p-0.5 border border-blue-200 dark:border-blue-800 shadow-sm z-10">
                                                            <input 
                                                                type="time" 
                                                                bind:value={planItems[index].startTime}
                                                                class="text-[10px] font-mono bg-transparent border-none outline-none text-slate-900 dark:text-white"
                                                                on:blur={() => saveTime(item.id)}
                                                                on:keydown={(e) => e.key === 'Enter' && saveTime(item.id)}
                                                                use:focus
                                                            />
                                                            <div class="h-3 w-[1px] bg-slate-200 dark:bg-slate-700"></div>
                                                            <div class="flex items-center gap-0.5">
                                                                <input 
                                                                    type="number" 
                                                                    bind:value={planItems[index].duration}
                                                                    class="text-[10px] font-mono bg-transparent border-none outline-none w-8 text-center text-slate-900 dark:text-white"
                                                                    min="5"
                                                                    step="5"
                                                                    on:blur={() => saveTime(item.id)}
                                                                    on:keydown={(e) => e.key === 'Enter' && saveTime(item.id)}
                                                                />
                                                                <span class="text-[10px] text-slate-400">m</span>
                                                            </div>
                                                        </div>
                                                    {:else}
														<button 
                                                            class="flex items-center gap-1.5 group/time-badge hover:bg-slate-100 dark:hover:bg-slate-800 rounded px-1 -ml-1 transition-colors cursor-pointer"
                                                            on:click={() => editTime(item.id)}
                                                            title="Click to edit time"
                                                        >
                                                            {#if item.startTime}
                                                                <span class="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">
                                                                    {item.startTime} - {getEndTime(item.startTime, item.duration || 0)}
                                                                </span>
                                                                {#if item.duration}
                                                                    <span class="text-[10px] text-slate-400 font-mono">
                                                                        ({item.duration}m)
                                                                    </span>
                                                                {/if}
                                                            {:else}
                                                                <span class="text-[10px] text-slate-300 dark:text-slate-600 hover:text-blue-500 transition-colors flex items-center gap-1">
                                                                    <Clock size={12} /> Add time
                                                                </span>
                                                            {/if}
                                                        </button>
													{/if}
												</div>
												<input 
													type="text" 
													bind:value={planItems[index].text}
													class="bg-transparent outline-none text-sm text-slate-700 dark:text-slate-300 w-full {item.completed ? 'line-through text-slate-400' : ''}"
												/>
											</div>

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
						</div>

						<!-- Note Section -->
						<div class="{activeTab === 'note' ? 'block' : 'hidden lg:block'} space-y-4 flex flex-col">
							<h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
								<Quote size={18} class="text-purple-500 fill-purple-500/20" /> Daily Note
							</h3>
							
							<div class="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-yellow-50/50 dark:bg-slate-900/30 min-h-[300px]">
								<!-- Notebook Lines Background (Repeat) -->
								<div class="absolute inset-0 pointer-events-none opacity-10 dark:opacity-5 bg-[linear-gradient(transparent_23px,#000_24px)] bg-[size:100%_24px] rounded-2xl"></div>
								
								<textarea 
									bind:value={notes}
									placeholder="Write your thoughts, reflections, or anything you learned today..."
									class="w-full min-h-[300px] p-6 bg-transparent resize-none outline-none text-slate-700 dark:text-slate-300 leading-[24px] font-serif placeholder:text-slate-400/50 block rounded-2xl"
                                    use:autoresize
								></textarea>
							</div>
						</div>

					</div>
				</div>
			</div>

			<!-- Footer -->
			<div class="border-t border-slate-100 dark:border-slate-800 p-4 lg:p-6 bg-white dark:bg-slate-950 flex items-center justify-between z-10">
				{#if existingCheckin}
					<button 
						on:click={handleDelete}
						class="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
					>
						<Trash2 size={16} /> Delete
					</button>
				{:else}
					<div></div>
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
						class="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none transition-all transform active:scale-95 flex items-center gap-2"
					>
						{#if isLoading}
							<div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
						{/if}
						Save Entry
					</button>
				</div>
			</div>

			<!-- Error Toast (Floating) -->
			{#if errorMessage}
				<div class="absolute bottom-20 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-full shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-2">
					<AlertCircle size={16} /> {errorMessage}
				</div>
			{/if}
		</div>
	</div>
{/if}
