<script lang="ts">
	import { Rocket, Cpu, Activity, Battery, Wifi, AlertTriangle, Eye, Mic } from 'lucide-svelte';
	import { fade } from 'svelte/transition';

	let deployStatus = 'Ready'; // Ready, Deploying, Running
	let inferenceLatency = 15; // ms
	let webrtcConnected = false;
	let emergencyStopActive = false;

	function deployModel() {
		deployStatus = 'Deploying';
		setTimeout(() => {
			deployStatus = 'Running';
		}, 2000);
	}

	function toggleWebRTC() {
		webrtcConnected = !webrtcConnected;
	}

	function triggerEmergencyStop() {
		emergencyStopActive = !emergencyStopActive;
	}
</script>

<div class="max-w-6xl mx-auto space-y-8">
	
	<!-- Top: Device Status & Emergency -->
	<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
		<div class="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
			<div class="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
				<Cpu class="w-6 h-6" />
			</div>
			<div>
				<div class="text-sm text-slate-400">Target Device</div>
				<div class="font-semibold text-slate-200">Jetson AGX Orin</div>
			</div>
		</div>
		<div class="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
			<div class="p-3 bg-blue-500/10 rounded-lg text-blue-400">
				<Activity class="w-6 h-6" />
			</div>
			<div>
				<div class="text-sm text-slate-400">Inference Latency</div>
				<div class="font-semibold text-slate-200">{inferenceLatency} ms</div>
			</div>
		</div>
		<div class="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
			<div class="p-3 bg-orange-500/10 rounded-lg text-orange-400">
				<Battery class="w-6 h-6" />
			</div>
			<div>
				<div class="text-sm text-slate-400">Power Mode</div>
				<div class="font-semibold text-slate-200">MAXN</div>
			</div>
		</div>
		<button 
			on:click={triggerEmergencyStop}
			class={`p-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${emergencyStopActive ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-red-500 border border-red-900/30 hover:bg-red-900/20'}`}
		>
			<AlertTriangle class="w-6 h-6" />
			{emergencyStopActive ? 'EMERGENCY STOPPED' : 'E-STOP'}
		</button>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Left: Telepresence & Digital Twin -->
		<div class="lg:col-span-2 space-y-6">
			<!-- WebRTC Stream -->
			<div class="bg-slate-900/50 border border-slate-800 rounded-xl p-1 overflow-hidden relative group">
				<div class="aspect-video bg-black rounded-lg relative overflow-hidden">
					{#if webrtcConnected}
						<div class="absolute inset-0 flex items-center justify-center text-slate-600 bg-slate-900">
							<!-- Placeholder for real video -->
							<div class="text-center">
								<Activity class="w-12 h-12 mx-auto mb-2 text-emerald-500 animate-pulse" />
								<span class="text-xs font-mono text-emerald-500">WEBRTC STREAM CONNECTED</span>
							</div>
						</div>
						<!-- Attention Map Overlay (Mock) -->
						<div class="absolute top-1/3 left-1/3 w-24 h-24 bg-red-500/20 blur-xl rounded-full animate-pulse pointer-events-none"></div>
					{:else}
						<div class="absolute inset-0 flex items-center justify-center text-slate-600">
							<span class="text-xs font-mono">STREAM DISCONNECTED</span>
						</div>
					{/if}
					
					<div class="absolute bottom-4 left-4 right-4 flex justify-between items-end">
						<div class="bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] text-white font-mono">
							LATENCY: <span class="text-emerald-400">24ms</span>
						</div>
						<button on:click={toggleWebRTC} class="bg-slate-800/80 hover:bg-slate-700 text-white px-3 py-1.5 rounded text-xs backdrop-blur transition-colors">
							{webrtcConnected ? 'Disconnect' : 'Connect Stream'}
						</button>
					</div>
				</div>
			</div>

			<!-- Digital Twin Canvas -->
			<div class="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
				<h3 class="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
					<Eye class="w-4 h-4 text-cyan-400" /> Digital Twin Visualization
				</h3>
				<div class="h-64 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center relative overflow-hidden">
					<div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(#475569 1px, transparent 1px); background-size: 20px 20px;"></div>
					<div class="text-slate-600 text-xs font-mono">Three.js / Babylon.js Canvas Placeholder</div>
					<!-- Mock 3D Object -->
					<div class="w-24 h-24 border-2 border-cyan-500/30 rounded-full absolute animate-spin-slow"></div>
					<div class="w-16 h-16 border-2 border-purple-500/30 rounded-full absolute animate-ping-slow"></div>
				</div>
			</div>
		</div>

		<!-- Right: Control & Tasking -->
		<div class="space-y-6">
			<!-- Model Deployment -->
			<div class="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center">
				<div class="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
					<Rocket class="w-6 h-6 text-emerald-400" />
				</div>
				<h2 class="text-lg font-bold text-white mb-2">Deploy Policy</h2>
				<p class="text-xs text-slate-400 mb-6">Push latest weights to robot controller.</p>
				
				<div class="flex flex-col gap-3">
					<button on:click={deployModel} class="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors shadow-lg shadow-emerald-500/20 text-sm">
						{deployStatus === 'Deploying' ? 'Uploading...' : 'Deploy v2.4.0'}
					</button>
					<button class="w-full py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors text-sm">
						Rollback to v2.3.5
					</button>
				</div>

				{#if deployStatus === 'Running'}
					<div in:fade class="mt-4 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400 text-xs">
						Active
					</div>
				{/if}
			</div>

			<!-- Natural Language Control -->
			<div class="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
				<h3 class="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
					<Mic class="w-4 h-4 text-blue-400" /> Natural Language Task
				</h3>
				<div class="space-y-3">
					<textarea 
						class="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50 resize-none h-24"
						placeholder="e.g., 'Pick up the red block and place it on the blue platform'"
					></textarea>
					<button class="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
						Send Instruction
					</button>
				</div>
			</div>
		</div>
	</div>
</div>
