<script lang="ts">
	import LabFanCards from '$lib/components/site/lab-fan-cards.svelte';
</script>

<svelte:head>
	<title>Lab - Camille</title>
	<meta name="description" content="Experimental projects and ideas" />
</svelte:head>

<div class="container mx-auto px-4 py-12 min-h-screen flex flex-col items-center justify-center overflow-hidden">
	<div class="text-center mb-12">
		<h1 class="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
			Camille's Laboratory
		</h1>
		<p class="text-muted-foreground max-w-lg mx-auto">
			Welcome to my experimental space. Here lies the ideas that are brewing, in progress, or just for fun.
		</p>
	</div>

	<div class="w-full max-w-4xl h-[500px] flex items-center justify-center relative">
		<LabFanCards />
	</div>
</div>
