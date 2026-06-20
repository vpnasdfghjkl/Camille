<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { ArrowRight, Terminal } from 'lucide-svelte';
	import type { Post } from '$lib/types';
	import Blogcard from './blogcard.svelte';
	export let data: {
		posts: Post[];
	};

	let post = data.posts?.[0];
</script>

<div class="relative w-full py-10">
	<!-- Decorative background blob -->
	<div
		class="absolute -top-20 -left-20 w-72 h-72 bg-slate-400/10 rounded-full blur-3xl pointer-events-none"
	/>

	<div class="md:container relative z-10">
		<div class="flex flex-col md:flex-row items-center gap-12 md:gap-20">
			<!-- Text Content -->
			<div class="flex-1 space-y-6">
				<div class="space-y-2">
					<div class="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-mono text-sm">
						<Terminal size={16} />
						<span>~/blog/latest</span>
					</div>
					<h2 class="text-3xl md:text-5xl font-bold tracking-tight text-primary">
						Fresh from the <br />
						<span
							class="text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-stone-500 dark:from-slate-100 dark:to-stone-400"
						>
							Knowledge Base
						</span>
					</h2>
				</div>
				<p class="text-muted-foreground text-lg leading-relaxed max-w-md">
					Explore my latest thoughts on technology, coding, and robotics. I document my learning
					journey and share insights.
				</p>
				<div class="pt-2">
					<Button
						href="/blog"
						variant="outline"
						class="group border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
					>
						Read all articles
						<ArrowRight class="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
					</Button>
				</div>
			</div>

			<!-- Card Content -->
			<div class="flex-1 w-full md:max-w-md relative group">
				<!-- Card decoration -->
				<div
					class="relative rounded-2xl overflow-hidden shadow-xl shadow-slate-900/5 ring-1 ring-slate-200 dark:ring-slate-800"
				>
					{#if post}
						<Blogcard {post} shallow={true} />
					{:else}
						<div class="p-6 text-sm text-muted-foreground">No posts yet.</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
