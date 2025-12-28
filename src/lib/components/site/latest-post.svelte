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
	<div class="absolute -top-20 -left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
	
	<div class="md:container relative z-10">
		<div class="flex flex-col md:flex-row items-center gap-12 md:gap-20">
			<!-- Text Content -->
			<div class="flex-1 space-y-6">
				<div class="space-y-2">
					<div class="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-mono text-sm">
						<Terminal size={16} />
						<span>~/blog/latest</span>
					</div>
					<h2 class="text-3xl md:text-5xl font-bold tracking-tight text-primary">
						Fresh from the <br />
						<span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
							Knowledge Base
						</span>
					</h2>
				</div>
				<p class="text-muted-foreground text-lg leading-relaxed max-w-md">
					Explore my latest thoughts on technology, coding, and robotics. 
					I document my learning journey and share insights.
				</p>
				<div class="pt-2">
					<Button href="/blog" variant="outline" class="group border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20">
						Read all articles
						<ArrowRight class="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
					</Button>
				</div>
			</div>
			
			<!-- Card Content -->
			<div class="flex-1 w-full md:max-w-md relative group">
				<!-- Card decoration -->
				<div class="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
				<div class="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-gray-900/5">
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
