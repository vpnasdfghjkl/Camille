<script lang="ts">
	import { onMount } from 'svelte';
	
	let testResults: any[] = [];
	let isLoading = false;
	let currentTest = '';
	
	async function runDatabaseTests() {
		isLoading = true;
		testResults = [];
		
		const tests = [
			{
				name: '🔗 数据库连接测试',
				url: '/api/test-database',
				method: 'POST'
			},
			{
				name: '📊 快速统计 API 测试',
				url: '/api/stats?days=30',
				method: 'GET'
			},
			{
				name: '💾 Supabase 打卡 API 测试',
				url: '/api/checkin',
				method: 'GET'
			}
		];
		
		for (const test of tests) {
			currentTest = test.name;
			const startTime = Date.now();
			
			try {
				const response = await fetch(test.url, { method: test.method });
				const result = await response.json();
				const duration = Date.now() - startTime;
				
				testResults = [...testResults, {
					...test,
					status: response.ok ? '✅ 成功' : '❌ 失败',
					duration: `${duration}ms`,
					success: response.ok && result.success !== false,
					data: result,
					error: result.error || null
				}];
			} catch (error) {
				const duration = Date.now() - startTime;
				testResults = [...testResults, {
					...test,
					status: '❌ 错误',
					duration: `${duration}ms`,
					success: false,
					data: null,
					error: error instanceof Error ? error.message : '未知错误'
				}];
			}
		}
		
		isLoading = false;
		currentTest = '';
	}
	
	async function testSpecificCheckin() {
		const today = new Date().toISOString().split('T')[0];
		
		// 测试保存一条新的打卡记录
		const testData = {
			id: `test_ui_${Date.now()}`,
			date: today,
			workPlan: '🧪 UI 测试 - 验证数据保存和颜色更新',
			focusTasks: [
				{ id: 'focus_work', name: '专注工作', icon: '💼', description: '', isCompleted: true },
				{ id: 'deep_learning', name: '深度学习', icon: '🧠', description: '', isCompleted: true },
				{ id: 'exercise', name: '运动健身', icon: '🏃‍♂️', description: '', isCompleted: false }
			],
			focusTasksCompleted: 2,
			notes: '这是 UI 测试记录，测试贡献图颜色更新'
		};
		
		try {
			const response = await fetch('/api/checkin', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(testData)
			});
			
			const result = await response.json();
			
			testResults = [...testResults, {
				name: '📝 创建测试打卡记录',
				status: result.success ? '✅ 成功' : '❌ 失败',
				duration: 'N/A',
				success: result.success,
				data: result,
				error: result.error || null
			}];
		} catch (error) {
			testResults = [...testResults, {
				name: '📝 创建测试打卡记录',
				status: '❌ 错误',
				duration: 'N/A',
				success: false,
				data: null,
				error: error instanceof Error ? error.message : '未知错误'
			}];
		}
	}
	
	onMount(() => {
		// 页面加载时自动运行测试
		runDatabaseTests();
	});
</script>

<svelte:head>
	<title>数据库连接测试 - Camille</title>
</svelte:head>

<main class="container mx-auto px-4 py-8 max-w-4xl">
	<div class="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
		<h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">
			🧪 Supabase 数据库测试控制台
		</h1>
		
		<div class="space-y-4 mb-8">
			<button
				on:click={runDatabaseTests}
				disabled={isLoading}
				class="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
			>
				{isLoading ? '🔄 测试中...' : '🚀 运行所有测试'}
			</button>
			
			<button
				on:click={testSpecificCheckin}
				disabled={isLoading}
				class="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors ml-4"
			>
				📝 创建测试打卡
			</button>
		</div>
		
		{#if isLoading && currentTest}
			<div class="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 mb-6">
				<div class="flex items-center">
					<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-3"></div>
					<span class="text-blue-700 dark:text-blue-300">{currentTest}</span>
				</div>
			</div>
		{/if}
		
		<div class="space-y-4">
			{#each testResults as result}
				<div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 {result.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}">
					<div class="flex justify-between items-start mb-2">
						<h3 class="font-semibold text-gray-900 dark:text-white">{result.name}</h3>
						<div class="flex gap-2 text-sm">
							<span class="font-mono {result.success ? 'text-green-600' : 'text-red-600'}">{result.status}</span>
							<span class="text-gray-500">{result.duration}</span>
						</div>
					</div>
					
					{#if result.error}
						<div class="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded p-2 mb-2">
							<span class="text-red-700 dark:text-red-300 text-sm font-mono">{result.error}</span>
						</div>
					{/if}
					
					{#if result.data}
						<details class="mt-2">
							<summary class="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
								查看响应数据
							</summary>
							<pre class="mt-2 bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-auto max-h-40">{JSON.stringify(result.data, null, 2)}</pre>
						</details>
					{/if}
				</div>
			{/each}
		</div>
		
		{#if testResults.length > 0}
			<div class="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
				<h3 class="font-semibold text-gray-900 dark:text-white mb-2">📊 测试总结</h3>
				<div class="grid grid-cols-2 gap-4 text-sm">
					<div>
						<span class="text-gray-600 dark:text-gray-400">总测试数:</span>
						<span class="font-mono ml-2">{testResults.length}</span>
					</div>
					<div>
						<span class="text-gray-600 dark:text-gray-400">成功:</span>
						<span class="font-mono ml-2 text-green-600">{testResults.filter(r => r.success).length}</span>
					</div>
					<div>
						<span class="text-gray-600 dark:text-gray-400">失败:</span>
						<span class="font-mono ml-2 text-red-600">{testResults.filter(r => !r.success).length}</span>
					</div>
					<div>
						<span class="text-gray-600 dark:text-gray-400">通过率:</span>
						<span class="font-mono ml-2">{Math.round((testResults.filter(r => r.success).length / testResults.length) * 100)}%</span>
					</div>
				</div>
			</div>
		{/if}
		
		<div class="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
			<h3 class="font-semibold text-blue-900 dark:text-blue-100 mb-2">💡 使用说明</h3>
			<ul class="text-sm text-blue-800 dark:text-blue-200 space-y-1">
				<li>• 运行所有测试：验证数据库连接、API 响应和数据完整性</li>
				<li>• 创建测试打卡：创建一条测试记录，验证数据保存和贡献图更新</li>
				<li>• 查看 <a href="/" class="underline">主页贡献图</a> 验证颜色是否正确更新</li>
				<li>• 在 <a href="https://supabase.com/dashboard" target="_blank" class="underline">Supabase Dashboard</a> 中查看原始数据</li>
			</ul>
		</div>
	</div>
</main>