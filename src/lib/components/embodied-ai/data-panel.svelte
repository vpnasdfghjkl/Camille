<script lang="ts">
	import { Camera, Scissors, RefreshCw, Save, Trash2, Play, Pause, Square } from 'lucide-svelte';
	import { fade } from 'svelte/transition';

	// State
	let isRecording = false;
	let isStreaming = false;
	let frameCount = 0;
	let recordingTimer: any;
	let activeCamera = 'CAM_01 (RGB-D)';
	
	// Mock Telemetry
	let jointAngles = [0.0, -45.2, 90.5, -10.0, 0.0, 0.0];
	let gripperState = 'Open';

	function toggleRecording() {
		isRecording = !isRecording;
		if (isRecording) {
			frameCount = 0;
			recordingTimer = setInterval(() => {
				frameCount += 30;
				jointAngles = jointAngles.map(a => a + (Math.random() - 0.5) * 2);
			}, 1000);
		} else {
			clearInterval(recordingTimer);
		}
	}

	function toggleStream() {
		isStreaming = !isStreaming;
	}
</script>

<div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
	
	<!-- Left: Camera Feed & Controls -->
	<div class="lg:col-span-8 space-y-6">
		<!-- Main Viewport -->
		<div class="relative aspect-video bg-slate-900 rounded-xl border border-slate-800 overflow-hidden group shadow-2xl shadow-black/50">
			<!-- Placeholder Grid -->
			<div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(#475569 1px, transparent 1px); background-size: 20px 20px;"></div>
			
			<!-- Overlay UI -->
			<div class="absolute top-4 left-4 flex gap-2">
				<span class="bg-black/60 backdrop-blur text-xs px-2 py-1 rounded border border-white/10 flex items-center gap-2">
					<Camera class="w-3 h-3 text-red-500" /> {activeCamera}
				</span>
				<span class="bg-black/60 backdrop-blur text-xs px-2 py-1 rounded border border-white/10">
					1920x1080 @ 60FPS
				</span>
			</div>

			{#if isRecording}
				<div class="absolute top-4 right-4 flex items-center gap-2">
					<div class="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
					<span class="text-red-500 font-mono font-bold tracking-widest">REC</span>
				</div>
			{/if}

			<!-- Center Placeholder -->
			<div class="absolute inset-0 flex items-center justify-center pointer-events-none">
				{#if isStreaming}
					<div class="text-emerald-500/50 font-mono text-sm tracking-widest animate-pulse">LIVE FEED ACTIVE (MOCK)</div>
				{:else}
					<div class="text-slate-700 flex flex-col items-center gap-4">
						<Camera class="w-16 h-16 opacity-50" />
						<span class="font-mono text-sm tracking-widest opacity-50">NO SIGNAL INPUT</span>
					</div>
				{/if}
			</div>
		</div>

		<!-- Timeline / Scrubber (Mock) -->
		<div class="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3">
			<div class="flex items-center justify-between text-xs text-slate-400 mb-2">
				<span>Playback Control</span>
				<span>00:15 / 01:30</span>
			</div>
			<div class="h-12 bg-slate-950/50 border border-slate-800 rounded-lg flex items-center px-4 gap-4">
				<button class="text-slate-400 hover:text-white"><Play class="w-4 h-4" /></button>
				<div class="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden relative group cursor-pointer">
					<div class="h-full bg-cyan-500/50 w-1/3"></div>
					<div class="absolute top-0 left-1/3 w-1 h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
				</div>
				<div class="flex gap-2">
					<button class="p-1.5 hover:bg-slate-800 rounded text-slate-400" title="Trim Segment"><Scissors class="w-3 h-3" /></button>
					<button class="p-1.5 hover:bg-slate-800 rounded text-slate-400" title="Delete"><Trash2 class="w-3 h-3" /></button>
				</div>
			</div>
		</div>
	</div>

	<!-- Right: Telemetry & Actions -->
	<div class="lg:col-span-4 space-y-6">
		
		<!-- Action Panel -->
		<div class="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
			<div class="mb-4">
				<label class="text-xs text-slate-500 block mb-1.5">Task Description</label>
				<input type="text" value="Pick and Place - Cube" class="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50 transition-colors" />
			</div>
			
			<div class="grid grid-cols-2 gap-4 mb-6">
				<button on:click={toggleStream} class={`p-3 rounded border text-center transition-all ${isStreaming ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'}`}>
					<div class="text-xs uppercase font-bold mb-1">Teleop Stream</div>
					<div class="text-[10px]">{isStreaming ? 'ON' : 'OFF'}</div>
				</button>
				<div class="text-center p-3 bg-slate-950 rounded border border-slate-800">
					<div class="text-xl font-mono text-white">{frameCount}</div>
					<div class="text-[10px] text-slate-500 uppercase">Frames</div>
				</div>
			</div>

			<button 
				on:click={toggleRecording}
				class="w-full py-4 rounded-lg font-bold tracking-wide transition-all transform active:scale-[0.98] flex items-center justify-center gap-3
				{isRecording ? 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20' : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20'}"
			>
				{#if isRecording}
					<Square class="w-5 h-5 fill-current" /> STOP RECORDING
				{:else}
					<div class="w-4 h-4 bg-slate-950 rounded-full"></div> START RECORDING
				{/if}
			</button>
		</div>

		<!-- Data Sync Status -->
		<div class="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
			<h3 class="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
				<RefreshCw class="w-4 h-4 text-cyan-400" /> Data Synchronization
			</h3>
			<div class="space-y-3">
				<div class="flex items-center justify-between text-xs">
					<span class="text-slate-400">RGB Camera</span>
					<span class="text-emerald-400">Synced (0ms)</span>
				</div>
				<div class="flex items-center justify-between text-xs">
					<span class="text-slate-400">Depth Sensor</span>
					<span class="text-emerald-400">Synced (1ms)</span>
				</div>
				<div class="flex items-center justify-between text-xs">
					<span class="text-slate-400">Proprioception</span>
					<span class="text-emerald-400">Synced (0ms)</span>
				</div>
				<div class="mt-4 pt-3 border-t border-slate-800">
					<button class="w-full py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors">
						Run Alignment Check
					</button>
				</div>
			</div>
		</div>

		<!-- Data Augmentation -->
		<div class="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
			<h3 class="text-sm font-semibold text-slate-300 mb-3">Augmentation Config</h3>
			<div class="space-y-2">
				<label class="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-slate-200">
					<input type="checkbox" class="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/20" checked />
					<span>Random Rotation (±15°)</span>
				</label>
				<label class="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-slate-200">
					<input type="checkbox" class="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/20" />
					<span>Color Jitter</span>
				</label>
				<label class="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-slate-200">
					<input type="checkbox" class="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/20" checked />
					<span>Gaussian Noise</span>
				</label>
			</div>
		</div>

	</div>
</div>
