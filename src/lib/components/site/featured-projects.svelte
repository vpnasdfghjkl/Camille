<script lang="ts">
	import { projects } from '$lib/projects';
	import Masonry from './masonry.svelte';
	import ProjectCard from './project-card.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Code2, ArrowRight } from 'lucide-svelte';

	const featured = projects.filter((project) => {
		return project.featured;
	});
</script>

<div class="flex flex-col space-y-12">
	<!-- Header Section -->
	<div class="flex flex-col md:flex-row md:items-end justify-between gap-6 md:container">
		<div class="space-y-4">
			<div class="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-mono text-sm">
				<Code2 size={16} />
				<span>~/projects/featured</span>
			</div>
			<h2 class="text-3xl md:text-5xl font-bold tracking-tight text-primary">
				Selected <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">Works</span>
			</h2>
			<p class="text-muted-foreground text-lg max-w-xl">
				A collection of projects where I turn coffee into code and ideas into reality.
			</p>
		</div>
		
		<div class="hidden md:block">
			<Button href="/projects" variant="ghost" class="group text-base">
				View Archive
				<ArrowRight class="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
			</Button>
		</div>
	</div>

	<!-- Grid Section -->
	<div class="max-w-7xl mx-auto w-full px-4 md:px-6">
		<Masonry items={featured} reset gridGap={'1.5rem'}>
			{#each featured as project}
				<div class="mb-6 transform hover:-translate-y-1 transition-transform duration-300">
					<ProjectCard {project} />
				</div>
			{/each}
		</Masonry>
	</div>
	
	<div class="md:hidden px-6">
		<Button href="/projects" variant="outline" class="w-full">
			View Archive
		</Button>
	</div>
</div>
