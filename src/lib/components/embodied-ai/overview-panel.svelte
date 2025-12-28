<script lang="ts">
	import { Activity, Database } from 'lucide-svelte';

	// Mock data for the architecture diagram
	const modules = [
		{ id: 'data', title: 'Data Management', desc: 'Upstream: Collection & Sync', color: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400', image: '/embodied-ai/data.png' },
		{ id: 'train', title: 'Algorithm & Training', desc: 'Midstream: Config & Learn', color: 'border-purple-500/50 bg-purple-500/10 text-purple-400', image: '/embodied-ai/training.png' },
		{ id: 'infer', title: 'Inference & Control', desc: 'Downstream: Execute & Twin', color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400', image: '/embodied-ai/deploy.png' },
		{ id: 'eval', title: 'Evaluation & Analysis', desc: 'Feedback: Metrics & Charts', color: 'border-amber-500/50 bg-amber-500/10 text-amber-400', image: '/embodied-ai/eval.png' }
	];
</script>

<div class="space-y-8">
	<!-- Hero Section -->
	<div class="bg-slate-900/40 border border-slate-800 rounded-xl p-8 relative overflow-hidden">
		<!-- Background Image -->
		<div class="absolute inset-0 opacity-40">
			<img 
				src="/embodied-ai/waic_deploy.jpg" 
				alt="System Architecture" 
				class="w-full h-full object-cover scale-x-[-1]" 
			/>
		</div>
		<!-- Gradient Overlay: Stronger on left for text readability, transparent on right for image visibility -->
		<div class="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/80 to-transparent"></div>

		<div class="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
		
		<div class="relative z-10">
			<h2 class="text-2xl font-bold text-white mb-2">System Architecture Overview</h2>
			<p class="text-slate-400 max-w-3xl leading-relaxed">
				A comprehensive end-to-end platform for Embodied AI research. The system facilitates the complete lifecycle from multi-modal data acquisition to real-world robot deployment and evaluation.
			</p>
		</div>

		<!-- Interactive Architecture Diagram -->
		<div class="mt-10 relative">
			<!-- Connecting Lines (SVG) -->
			<svg class="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-30" style="min-height: 200px;">
				<defs>
					<marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
						<polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
					</marker>
				</defs>
				<!-- Simple straight lines for desktop layout -->
				<line x1="20%" y1="50%" x2="30%" y2="50%" stroke="#64748b" stroke-width="2" marker-end="url(#arrowhead)" />
				<line x1="45%" y1="50%" x2="55%" y2="50%" stroke="#64748b" stroke-width="2" marker-end="url(#arrowhead)" />
				<line x1="70%" y1="50%" x2="80%" y2="50%" stroke="#64748b" stroke-width="2" marker-end="url(#arrowhead)" />
				<!-- Feedback loop line -->
				<path d="M 85% 80% Q 50% 120% 15% 80%" fill="none" stroke="#64748b" stroke-width="1" stroke-dasharray="5,5" opacity="0.5" />
			</svg>

			<div class="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
				{#each modules as mod}
					<div class="group relative bg-slate-950/80 backdrop-blur border border-slate-800 rounded-xl p-5 hover:border-slate-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden">
						<!-- Background Image -->
						<div class="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity duration-500">
							<img src={mod.image} alt={mod.title} class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
						</div>
						<div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent opacity-80"></div>

						<div class="relative z-10">
							<div class={`absolute top-0 left-0 w-full h-1 rounded-t-xl ${mod.color.split(' ')[0].replace('border', 'bg')}`}></div>
							<div class="flex items-start justify-between mb-3">
								<div class={`p-2 rounded-lg ${mod.color}`}>
									<Activity class="w-5 h-5" />
								</div>
								<span class="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Module</span>
							</div>
							<h3 class="font-bold text-slate-200 mb-1">{mod.title}</h3>
							<p class="text-xs text-slate-500">{mod.desc}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Quick Stats / System Health -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
		<div class="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
			<div class="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
				<div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
			</div>
			<div>
				<div class="text-sm text-slate-400">System Status</div>
				<div class="font-semibold text-slate-200">All Systems Nominal</div>
			</div>
		</div>
		<div class="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
			<div class="p-3 bg-blue-500/10 rounded-lg text-blue-400">
				<Database class="w-5 h-5" />
			</div>
			<div>
				<div class="text-sm text-slate-400">Total Episodes</div>
				<div class="font-semibold text-slate-200">1,248 Samples</div>
			</div>
		</div>
		<div class="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
			<div class="p-3 bg-purple-500/10 rounded-lg text-purple-400">
				<Activity class="w-5 h-5" />
			</div>
			<div>
				<div class="text-sm text-slate-400">Active Model</div>
				<div class="font-semibold text-slate-200">Diffusion-v2.4</div>
			</div>
		</div>
	</div>
</div>
