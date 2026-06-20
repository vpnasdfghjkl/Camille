<script lang="ts">
	import { cn } from '$lib/utils';
	import { Badge } from '../ui/badge';
	import * as Dialog from '$lib/components/ui/dialog';
	import { page } from '$app/stores';
	import TagsPage from '../../../routes/tags/[tag]/+page.svelte';
	import { goto, preloadData, pushState } from '$app/navigation';

	export let tag: string;
	export let count: number = 0;
	export let href: string = '';

	let hover = false;
	let className: string | undefined | null = undefined;
	export { className as class };

	export let shallow: boolean = false;

	let showModal__: boolean = false;

	async function showModal(e: MouseEvent) {
		if (!shallow) return;
		if (e.metaKey || e.ctrlKey || innerWidth < 800) return;

		e.preventDefault();
		const { href } = e.currentTarget as HTMLAnchorElement;
		const result = await preloadData(href);
		if (result.type === 'loaded' && result.status === 200) {
			pushState(href, {
				tagsData: result.data
			});
			showModal__ = true;
		} else {
			goto(href);
		}

		// for some reason, going back doesn't close the dialog. so have to include this
		window.addEventListener('popstate', () => {
			showModal__ = false;
		});
	}
</script>

{#if count > 0}
	<a
		{href}
		class="border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 rounded-md flex bg-slate-50/80 dark:bg-zinc-900/80 transition-colors"
		on:mouseenter={() => (hover = true)}
		on:mouseleave={() => (hover = false)}
	>
		<h1 class="px-2 text-base font-medium text-slate-600 dark:text-slate-300">
			{tag}
		</h1>
		<p
			class={cn(
				'bg-slate-200/80 dark:bg-zinc-800 rounded-r-[5px] px-2 border-l border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 transition-colors',
				hover && 'border-slate-400 dark:border-slate-500'
			)}
		>
			{count}
		</p>
	</a>
	<!-- {:else if shallow}
	<Badge class={cn('rounded', className)} {href} on:click={showModal}>{tag}</Badge> -->
{:else}
	<Badge
		on:click={showModal}
		class={cn(
			'rounded border-slate-300 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700',
			className
		)}
		{href}>{tag}</Badge
	>
{/if}

<Dialog.Root
	open={showModal__}
	onOpenChange={() => {
		history.back();
		showModal__ = false;
	}}
>
	<Dialog.Content class="max-w-5xl h-[80vh] overflow-scroll">
		<div class="w-full h-full">
			{#if $page.state.tagsData}
				<TagsPage data={$page.state.tagsData} />
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>
