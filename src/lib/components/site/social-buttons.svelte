<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button';
	import { getSocials } from '$lib/config';
	import { cn } from '$lib/utils';
</script>

<div class="flex flex-wrap gap-2 mt-4">
	{#each getSocials({ exclude: 'Mail' }) as { display, href, icon }}
		<a
			{href}
			target="_blank"
			class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
		>
			<svelte:component this={icon} class="h-3.5 w-3.5" />
			<span>{display}</span>
		</a>
	{/each}
</div>
