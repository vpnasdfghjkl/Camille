<script lang="ts">
	import { Trophy, Target, BarChart3, Download, Play } from 'lucide-svelte';

	let running = false;
	let runs = 0;
	let successRate = 0;

	function runTests() {
		running = true;
		let progress = 0;
		const interval = setInterval(() => {
			progress += 5;
			if (progress >= 100) {
				clearInterval(interval);
				running = false;
				runs += 100;
				successRate = 85 + Math.random() * 10;
			}
		}, 50);
	}
</script>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
	<!-- Left: Test Runner -->
	<div class="lg:col-span-2 space-y-6">
		<div class="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
			<div class="flex items-center justify-between mb-6">
				<h3 class="text-lg font-semibold text-slate-200 flex items-center gap-2">
					<Target class="w-5 h-5 text-cyan-400" /> Automated Evaluation
				</h3>
				<div class="flex gap-3">
					<button class="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors flex items-center gap-2">
						<Download class="w-3 h-3" /> Export CSV
					</button>
				</div>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
				<div class="bg-slate-950 border border-slate-800 rounded-lg p-4">
					<div class="text-xs text-slate-500 uppercase mb-1">Total Trials</div>
					<div class="text-2xl font-mono text-white">{runs}</div>
				</div>
				<div class="bg-slate-950 border border-slate-800 rounded-lg p-4">
					<div class="text-xs text-slate-500 uppercase mb-1">Success Rate</div>
					<div class={`text-2xl font-mono ${successRate > 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
						{successRate > 0 ? successRate.toFixed(1) + '%' : '--'}
					</div>
				</div>
			</div>

			<div class="relative h-2 bg-slate-800 rounded-full overflow-hidden mb-6">
				{#if running}
					<div class="absolute inset-0 bg-cyan-500 animate-progress-indeterminate"></div>
				{/if}
			</div>

			<button 
				on:click={runTests} 
				disabled={running}
				class="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
			>
				{#if running}
					Running Simulation...
				{:else}
					<Play class="w-4 h-4" /> Run 100 Evaluation Trials (Isaac Sim)
				{/if}
			</button>
		</div>

		<!-- Trajectory Comparison -->
		<div class="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
			<h3 class="text-sm font-semibold text-slate-200 mb-4">Trajectory Analysis</h3>
			<div class="h-64 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center relative overflow-hidden">
				<div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(#475569 1px, transparent 1px); background-size: 20px 20px;"></div>
				
				<!-- Mock Trajectories -->
				<svg class="absolute inset-0 w-full h-full pointer-events-none">
					<!-- Expert Trajectory (Green) -->
					<path d="M 100 200 Q 250 50 400 200 T 700 200" fill="none" stroke="#10b981" stroke-width="2" stroke-dasharray="5,5" opacity="0.6" />
					<!-- Model Trajectory (Blue) -->
					<path d="M 100 200 Q 260 60 410 190 T 700 210" fill="none" stroke="#3b82f6" stroke-width="2" />
				</svg>

				<div class="absolute bottom-4 right-4 flex flex-col gap-2 text-[10px]">
					<div class="flex items-center gap-2">
						<div class="w-3 h-0.5 bg-emerald-500 border-t border-dashed"></div>
						<span class="text-slate-400">Expert Demo</span>
					</div>
					<div class="flex items-center gap-2">
						<div class="w-3 h-0.5 bg-blue-500"></div>
						<span class="text-slate-400">Model Policy</span>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Right: Detailed Metrics -->
	<div class="space-y-6">
		<div class="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
			<h3 class="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
				<BarChart3 class="w-4 h-4 text-amber-400" /> Failure Analysis
			</h3>
			<div class="space-y-4">
				<div>
					<div class="flex justify-between text-xs mb-1">
						<span class="text-slate-400">Grasp Failure</span>
						<span class="text-slate-200">45%</span>
					</div>
					<div class="h-1.5 bg-slate-800 rounded-full overflow-hidden">
						<div class="h-full bg-rose-500 w-[45%]"></div>
					</div>
				</div>
				<div>
					<div class="flex justify-between text-xs mb-1">
						<span class="text-slate-400">Motion Planning Timeout</span>
						<span class="text-slate-200">30%</span>
					</div>
					<div class="h-1.5 bg-slate-800 rounded-full overflow-hidden">
						<div class="h-full bg-amber-500 w-[30%]"></div>
					</div>
				</div>
				<div>
					<div class="flex justify-between text-xs mb-1">
						<span class="text-slate-400">Collision</span>
						<span class="text-slate-200">15%</span>
					</div>
					<div class="h-1.5 bg-slate-800 rounded-full overflow-hidden">
						<div class="h-full bg-orange-500 w-[15%]"></div>
					</div>
				</div>
			</div>
		</div>

		<div class="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
			<h3 class="text-sm font-semibold text-slate-200 mb-4">Performance Stats</h3>
			<div class="space-y-3 text-xs">
				<div class="flex justify-between py-2 border-b border-slate-800">
					<span class="text-slate-400">Avg. Episode Length</span>
					<span class="font-mono text-slate-200">142 steps</span>
				</div>
				<div class="flex justify-between py-2 border-b border-slate-800">
					<span class="text-slate-400">Reward Mean</span>
					<span class="font-mono text-slate-200">0.842</span>
				</div>
				<div class="flex justify-between py-2 border-b border-slate-800">
					<span class="text-slate-400">Reward Std</span>
					<span class="font-mono text-slate-200">0.12</span>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	@keyframes progress-indeterminate {
		0% { left: -100%; width: 50%; }
		50% { left: 25%; width: 50%; }
		100% { left: 100%; width: 50%; }
	}
	.animate-progress-indeterminate {
		animation: progress-indeterminate 1.5s infinite linear;
	}
</style>
