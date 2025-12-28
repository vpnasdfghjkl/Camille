<script lang="ts">
	import { Settings, Database, Play, Pause, Square, Activity, Terminal } from 'lucide-svelte';

	let trainingStatus = 'Idle';
	let currentEpoch = 0;
	let totalEpochs = 100;
	let loss = 0.5;
	let timer: any;

	function toggleTraining() {
		if (trainingStatus === 'Training') {
			clearInterval(timer);
			trainingStatus = 'Paused';
		} else {
			trainingStatus = 'Training';
			timer = setInterval(() => {
				currentEpoch += 1;
				loss = Math.max(0.01, loss * 0.95);
				if (currentEpoch >= totalEpochs) {
					clearInterval(timer);
					trainingStatus = 'Completed';
				}
			}, 100);
		}
	}
</script>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
	<!-- Config -->
	<div class="space-y-6">
		<div class="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
			<h3 class="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
				<Settings class="w-5 h-5 text-purple-400" /> Hyperparameters
			</h3>
			<div class="space-y-4">
				<div>
					<label class="text-xs text-slate-400 block mb-2">Model Architecture</label>
					<select class="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-purple-500/50 transition-colors">
						<option>ResNet-50 + LSTM</option>
						<option>Transformer (ViT)</option>
						<option>Diffusion Policy</option>
					</select>
				</div>
				
				<div class="space-y-2">
					<label class="text-xs text-slate-400 block">Fusion Strategy</label>
					<div class="grid grid-cols-2 gap-2">
						<label class="flex items-center gap-2 p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-purple-500/30 transition-colors">
							<input type="radio" name="fusion" class="text-purple-500 bg-slate-900 border-slate-700" checked />
							<span class="text-xs text-slate-300">Early Fusion</span>
						</label>
						<label class="flex items-center gap-2 p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-purple-500/30 transition-colors">
							<input type="radio" name="fusion" class="text-purple-500 bg-slate-900 border-slate-700" />
							<span class="text-xs text-slate-300">Late Fusion</span>
						</label>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="text-xs text-slate-400 block mb-2">Batch Size</label>
						<input type="number" value="64" class="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-purple-500/50 transition-colors" />
					</div>
					<div>
						<label class="text-xs text-slate-400 block mb-2">Learning Rate</label>
						<input type="text" value="1e-4" class="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-purple-500/50 transition-colors" />
					</div>
				</div>
				<div>
					<label class="text-xs text-slate-400 block mb-2">Dataset Version</label>
					<div class="flex items-center gap-2 p-2 bg-slate-950 border border-slate-800 rounded text-sm text-slate-300">
						<Database class="w-4 h-4 text-slate-500" />
						<span>pick_place_v2.hdf5</span>
						<span class="ml-auto text-xs text-slate-500">24GB</span>
					</div>
				</div>
			</div>
			<button 
				on:click={toggleTraining} 
				class={`mt-6 w-full py-2 rounded-md font-medium transition-all flex items-center justify-center gap-2 ${trainingStatus === 'Training' ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20' : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20'}`}
			>
				{#if trainingStatus === 'Training'}
					<Pause class="w-4 h-4" /> Pause Training
				{:else}
					<Play class="w-4 h-4" /> Start Training
				{/if}
			</button>
		</div>
		
		<!-- Model Registry Mini -->
		<div class="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
			<h3 class="text-sm font-semibold text-slate-200 mb-4">Model Registry</h3>
			<div class="space-y-2">
				<div class="flex items-center justify-between p-2 bg-slate-950/50 rounded border border-slate-800 text-xs">
					<span class="text-slate-300">v2.4.0-release</span>
					<span class="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">Best</span>
				</div>
				<div class="flex items-center justify-between p-2 bg-slate-950/50 rounded border border-slate-800 text-xs">
					<span class="text-slate-300">v2.3.5-exp</span>
					<span class="text-slate-500">Archived</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Visualization -->
	<div class="lg:col-span-2 space-y-6">
		<div class="bg-slate-900/50 border border-slate-800 rounded-xl p-6 h-full flex flex-col">
			<div class="flex items-center justify-between mb-6">
				<h3 class="text-lg font-semibold text-slate-200">Training Dashboard</h3>
				<div class="flex gap-4 text-sm font-mono">
					<span class="text-slate-400">Epoch: <span class="text-white">{currentEpoch}/{totalEpochs}</span></span>
					<span class="text-slate-400">Loss: <span class="text-purple-400">{loss.toFixed(4)}</span></span>
				</div>
			</div>
			
			<!-- Mock Graph Area -->
			<div class="flex-1 bg-slate-950/50 rounded-lg border border-slate-800 relative overflow-hidden flex items-end p-4 gap-1 min-h-[240px]">
				{#each Array(40) as _, i}
					<div 
						class="flex-1 bg-purple-500/20 rounded-t-sm transition-all duration-500 hover:bg-purple-500/40"
						style="height: {trainingStatus === 'Training' ? 20 + Math.random() * 60 : 10}%"
					></div>
				{/each}
				
				{#if trainingStatus === 'Idle'}
					<div class="absolute inset-0 flex items-center justify-center text-slate-600">
						Waiting to start...
					</div>
				{/if}
			</div>

			<!-- Resource Monitor -->
			<div class="mt-4 grid grid-cols-3 gap-4">
				<div class="bg-slate-950 border border-slate-800 p-3 rounded-lg">
					<div class="text-[10px] text-slate-500 uppercase mb-1">GPU Usage</div>
					<div class="text-sm font-mono text-slate-200 flex items-center gap-2">
						<div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> 84%
					</div>
				</div>
				<div class="bg-slate-950 border border-slate-800 p-3 rounded-lg">
					<div class="text-[10px] text-slate-500 uppercase mb-1">VRAM</div>
					<div class="text-sm font-mono text-slate-200">18.2 / 24 GB</div>
				</div>
				<div class="bg-slate-950 border border-slate-800 p-3 rounded-lg">
					<div class="text-[10px] text-slate-500 uppercase mb-1">Temp</div>
					<div class="text-sm font-mono text-slate-200">72°C</div>
				</div>
			</div>

			<!-- Terminal Output -->
			<div class="mt-4 h-32 bg-black rounded-lg border border-slate-800 p-3 font-mono text-xs text-slate-400 overflow-y-auto custom-scrollbar">
				<div class="text-slate-500"># System Ready</div>
				{#if trainingStatus !== 'Idle'}
					<div class="text-purple-400">> Initializing weights...</div>
					<div class="text-slate-300">> Epoch {currentEpoch}: loss={loss.toFixed(4)}</div>
					<div class="text-slate-500">> Saving checkpoint to /models/v2.4.1/ckpt_{currentEpoch}.pt</div>
				{/if}
				<div class="animate-pulse">_</div>
			</div>
		</div>
	</div>
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar { width: 6px; }
	.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
	.custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
</style>
