<script lang="ts">
	import { 
		LayoutDashboard, 
		Database, 
		BrainCircuit, 
		Bot, 
		LineChart,
		ChevronRight
	} from 'lucide-svelte';
	
	import OverviewPanel from '$lib/components/embodied-ai/overview-panel.svelte';
	import DataPanel from '$lib/components/embodied-ai/data-panel.svelte';
	import TrainingPanel from '$lib/components/embodied-ai/training-panel.svelte';
	import InferencePanel from '$lib/components/embodied-ai/inference-panel.svelte';
	import EvaluationPanel from '$lib/components/embodied-ai/evaluation-panel.svelte';

	let activeTab = 'overview';

	const tabs = [
		{ id: 'overview', label: 'System Overview', icon: LayoutDashboard },
		{ id: 'data', label: 'Data Management', icon: Database },
		{ id: 'training', label: 'Algorithm Training', icon: BrainCircuit },
		{ id: 'inference', label: 'Inference & Control', icon: Bot },
		{ id: 'evaluation', label: 'Evaluation', icon: LineChart }
	];
</script>

<div class="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 relative z-10 pt-4 md:pt-8">
	<!-- Top Navigation Bar -->
	<header class="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
			<div class="flex items-center gap-4">
				<a href="/" class="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors" title="Back to Home">
					<span class="font-bold text-lg">←</span>
				</a>
				<div class="flex items-center gap-2">
					<div class="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
						<Bot class="w-5 h-5 text-white" />
					</div>
					<span class="font-bold text-lg tracking-tight text-white">Embodied<span class="text-cyan-400">AI</span> Studio</span>
				</div>
			</div>
			
			<nav class="hidden md:flex items-center gap-1 bg-slate-900/50 p-1 rounded-lg border border-slate-800/50">
				{#each tabs as tab}
					<button 
						on:click={() => activeTab = tab.id}
						class={`
							px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2
							${activeTab === tab.id 
								? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700' 
								: 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}
						`}
					>
						<svelte:component this={tab.icon} class="w-4 h-4" />
						{tab.label}
					</button>
				{/each}
			</nav>

			<div class="flex items-center gap-4">
				<div class="flex items-center gap-2 text-xs font-mono text-slate-500">
					<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
					SYSTEM ONLINE
				</div>
			</div>
		</div>
	</header>

	<!-- Main Content Area -->
	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<!-- Breadcrumb / Header -->
		<div class="mb-8 flex items-center gap-2 text-sm text-slate-500">
			<span>Lab</span>
			<ChevronRight class="w-4 h-4" />
			<span class="text-slate-300">Embodied AI</span>
			<ChevronRight class="w-4 h-4" />
			<span class="text-cyan-400 font-medium capitalize">{tabs.find(t => t.id === activeTab)?.label}</span>
		</div>

		<!-- Dynamic Component Rendering -->
		<div class="min-h-[600px]">
			{#if activeTab === 'overview'}
				<OverviewPanel />
			{:else if activeTab === 'data'}
				<DataPanel />
			{:else if activeTab === 'training'}
				<TrainingPanel />
			{:else if activeTab === 'inference'}
				<InferencePanel />
			{:else if activeTab === 'evaluation'}
				<EvaluationPanel />
			{/if}
		</div>
	</main>
</div>

<style>
	:global(body) {
		background-color: #020617; /* slate-950 */
	}
</style>
