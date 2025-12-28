<script lang="ts">
	import { createClient } from '@supabase/supabase-js';
	import { Database, RefreshCw, Code, Key, Link as LinkIcon, Loader2, Copy } from 'lucide-svelte';
	import { fade, slide } from 'svelte/transition';
	import { cn } from '$lib/utils';

	// --- State ---
	let supabaseUrl = '';
	let supabaseKey = '';
	let tableName = 'test_notes';
	let dateColumn = 'created_at';
	let client: any = null;
	let loading = false;
	let error = '';
	let success = '';

	// Data
	let queryResult: any[] | null = null;
	let selectedDate = new Date().toISOString().split('T')[0]; // Default today YYYY-MM-DD

	// Code Display
	let currentCodeTitle = 'Initialize Client';
	let currentCode = `import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xyzcompany.supabase.co'
const supabaseKey = 'public-anon-key'
const supabase = createClient(supabaseUrl, supabaseKey)`;

	// --- Actions ---

	function initClient() {
		if (!supabaseUrl || !supabaseKey) {
			error = 'Please provide both URL and Key';
			return;
		}
		try {
			client = createClient(supabaseUrl, supabaseKey);
			error = '';
			success = 'Client initialized successfully!';

			currentCodeTitle = 'Initialize Client';
			currentCode = `import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
	'${supabaseUrl}',
	'${supabaseKey.substring(0, 10)}...'
)`;
		} catch (e: any) {
			error = e.message;
		}
	}

	async function fetchData() {
		if (!client) return;
		loading = true;
		queryResult = null;

		// Construct date range for the entire day (UTC-aware assumption)
		const startDate = `${selectedDate}T00:00:00`;
		const endDate = `${selectedDate}T23:59:59`;

		currentCodeTitle = 'Query Data by Date';
		currentCode = `const { data, error } = await supabase
	.from('${tableName}')
	.select('*')
	.gte('${dateColumn}', '${startDate}')
	.lte('${dateColumn}', '${endDate}')
	.order('${dateColumn}', { ascending: false })`;

		const { data, error: err } = await client
			.from(tableName)
			.select('*')
			.gte(dateColumn, startDate)
			.lte(dateColumn, endDate)
			.order(dateColumn, { ascending: false });

		loading = false;
		if (err) {
			error = err.message;
		} else {
			const results = data ?? [];
			queryResult = results;
			if (results.length === 0) {
				success = 'Query successful, but no data found for this date.';
			} else {
				success = `Found ${results.length} records!`;
			}
			setTimeout(() => (success = ''), 3000);
		}
	}

	function copyToClipboard(text: string) {
		if (!text) return;
		navigator.clipboard?.writeText(text).then(() => {
			success = 'Copied to clipboard';
			setTimeout(() => (success = ''), 2000);
		});
	}

</script>

<div class="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-200 p-8 font-sans">
	<div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

		<!-- Left: Controls -->
		<div class="lg:col-span-1 space-y-6">
			<div class="px-6 py-5 bg-slate-900/60 border border-slate-800 rounded-xl shadow">
				<div class="flex items-center gap-3">
					<div class="p-2 rounded-md bg-green-600/10 text-green-400">
						<Database class="w-5 h-5" />
					</div>
					<div>
						<h3 class="text-lg font-semibold">Supabase Inspector</h3>
						<p class="text-xs text-slate-400 mt-1">Quickly query a table by date. Use Anon key for demo only.</p>
					</div>
				</div>
			</div>

			<div class="px-6 py-5 bg-slate-900/50 border border-slate-800 rounded-xl shadow space-y-3">
				<label for="supabaseUrlInput" class="text-xs text-slate-400">Project URL</label>
				<div class="relative">
					<LinkIcon class="absolute left-3 top-3 w-4 h-4 text-slate-500" />
					<input id="supabaseUrlInput" type="text" bind:value={supabaseUrl} placeholder="https://xyz.supabase.co" class="w-full bg-transparent border border-slate-800 rounded-md py-2 pl-10 pr-3 focus:outline-none focus:ring-1 focus:ring-green-500" />
				</div>

				<label for="supabaseKeyInput" class="text-xs text-slate-400">Anon/Public Key</label>
				<div class="relative">
					<Key class="absolute left-3 top-3 w-4 h-4 text-slate-500" />
					<input id="supabaseKeyInput" type="password" bind:value={supabaseKey} placeholder="public-anon-key" class="w-full bg-transparent border border-slate-800 rounded-md py-2 pl-10 pr-3 focus:outline-none focus:ring-1 focus:ring-green-500" />
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="tableNameInput" class="text-xs text-slate-400">Table</label>
						<input id="tableNameInput" type="text" bind:value={tableName} class="w-full bg-transparent border border-slate-800 rounded-md py-2 px-3 focus:outline-none" />
					</div>
					<div>
						<label for="dateColumnInput" class="text-xs text-slate-400">Date column</label>
						<input id="dateColumnInput" type="text" bind:value={dateColumn} class="w-full bg-transparent border border-slate-800 rounded-md py-2 px-3 focus:outline-none" />
					</div>
				</div>

				<button on:click={initClient} class="w-full mt-2 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 px-4 py-2 rounded-md text-slate-900 font-semibold hover:opacity-95">Connect</button>

				{#if error}
					<div class="mt-3 text-sm text-red-400">{error}</div>
				{/if}
				{#if success}
					<div class="mt-3 text-sm text-green-300">{success}</div>
				{/if}
			</div>

			{#if client}
				<div class="px-6 py-4 bg-slate-900/40 border border-slate-800 rounded-xl shadow space-y-3">
					<div class="flex items-center justify-between">
							<div>
								<label for="selectedDateInput" class="text-xs text-slate-400">Select Date</label>
								<div class="mt-1">
									<input id="selectedDateInput" type="date" bind:value={selectedDate} class="bg-transparent border border-slate-800 rounded-md py-2 px-3 text-slate-200 w-full" />
								</div>
							</div>
						<div class="flex flex-col items-end">
							<button on:click={fetchData} disabled={loading} class="inline-flex items-center gap-2 bg-blue-600 px-3 py-2 rounded-md text-white hover:opacity-95 disabled:opacity-50">
								{#if loading}
									<Loader2 class="w-4 h-4 animate-spin" />
								{:else}
									<RefreshCw class="w-4 h-4" />
								{/if}
								Fetch
							</button>
							<div class="text-xs text-slate-500 mt-2">Range: {selectedDate} 00:00 — 23:59</div>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Middle: Results -->
		<div class="lg:col-span-2 space-y-6">
			<div class="px-6 py-5 bg-slate-900/40 border border-slate-800 rounded-xl shadow">
				<div class="flex items-center justify-between mb-3">
					<h3 class="text-lg font-semibold">Results</h3>
					<div class="text-sm text-slate-400">Table: <span class="font-mono text-slate-300">{tableName}</span></div>
				</div>

				<div class="min-h-[120px] max-h-[460px] overflow-auto custom-scrollbar space-y-3">
					{#if queryResult === null}
						<div class="h-40 flex items-center justify-center text-slate-500 italic">No query yet — choose a date and press Fetch</div>
					{:else if queryResult.length === 0}
						<div class="h-40 flex items-center justify-center text-slate-500 italic">No records found for {selectedDate}</div>
					{:else}
						<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
							{#each queryResult as item, i}
								<div class="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
									<div class="flex items-start justify-between gap-3">
										<div>
											<div class="text-xs text-slate-400">Record #{i + 1}</div>
											<pre class="text-xs font-mono text-slate-300 mt-2 whitespace-pre-wrap">{JSON.stringify(item, null, 2)}</pre>
										</div>
										<div class="flex flex-col items-end gap-2">
											<button on:click={() => copyToClipboard(JSON.stringify(item, null, 2))} class="p-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300">
												<Copy class="w-4 h-4" />
											</button>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			<!-- Code viewer -->
			<div class="px-6 py-4 bg-slate-950/20 border border-slate-800 rounded-xl shadow">
				<div class="flex items-center justify-between mb-3">
					<div class="flex items-center gap-2 text-sm font-medium text-slate-300">
						<Code class="w-4 h-4 text-blue-400" />
						{currentCodeTitle}
					</div>
					<div class="flex items-center gap-2">
						<button on:click={() => copyToClipboard(currentCode)} class="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300">
							<Copy class="w-4 h-4" /> Copy
						</button>
					</div>
				</div>
				<div class="bg-slate-900/60 border border-slate-800 rounded-md p-3 overflow-x-auto">
					<pre class="font-mono text-sm text-blue-300 leading-relaxed"><code>{currentCode}</code></pre>
				</div>
			</div>

			<!-- How to setup (collapsed short) -->
			<div class="px-6 py-4 bg-slate-900/30 border border-slate-800 rounded-xl text-sm text-slate-400">
				<div class="font-semibold text-slate-200 mb-2">Quick Setup</div>
				<ol class="list-decimal list-inside space-y-2">
					<li>In Supabase, create the table with <span class="font-mono">test_notes(id, created_at, content)</span>.</li>
					<li>Go to <strong>Project Settings (Cog icon)</strong> → <strong>API</strong>. Copy the <code class="bg-slate-800 px-1 rounded">anon</code> <code class="bg-slate-800 px-1 rounded">public</code> key.</li>
					<li>Paste them above and click <span class="font-semibold">Connect</span>. For public demos, use anon key only.</li>
				</ol>
			</div>
		</div>
	</div>
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar { width: 8px; }
	.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
	.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #334155; border-radius: 20px; }
</style>