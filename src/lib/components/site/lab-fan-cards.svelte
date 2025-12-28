<script lang="ts">
	import { onMount } from 'svelte';
	import { History, Heart, FlaskConical, Lock, ArrowRight, Database, Bot } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { goto } from '$app/navigation';

	type LabProject = {
		id: number;
		title: string;
		description: string;
		icon: any;
		color: string;
		textColor: string;
		status: string;
		link?: string;
	};

	const projects: LabProject[] = [
		{
			id: 1,
			title: 'History Behavior',
			description: 'Analyzing past activity data to discover behavioral patterns and insights.',
			icon: History,
			color: 'bg-blue-500',
			textColor: 'text-blue-300',
			status: 'Analysis'
		},
		{
			id: 2,
			title: 'Real-time Heart Rate',
			description: 'Live heart rate monitoring integration. Waiting for Apple Watch purchase.',
			icon: Heart,
			color: 'bg-rose-500',
			textColor: 'text-rose-300',
			status: 'Planned'
		},
		{
			id: 3,
			title: 'Test Playground',
			description: 'A safe environment for testing new features and breaking things.',
			icon: FlaskConical,
			color: 'bg-amber-500',
			textColor: 'text-amber-300',
			status: 'Testing'
		},
		{
			id: 4,
			title: 'Log Encryption',
			description: 'End-to-end encryption for activity check-in details to ensure privacy.',
			icon: Lock,
			color: 'bg-emerald-500',
			textColor: 'text-emerald-300',
			status: 'Security'
		},
		{
			id: 5,
			title: 'Supabase Lab',
			description: 'Interactive tutorial for database operations: CRUD, Realtime, and Auth.',
			icon: Database,
			color: 'bg-green-500',
			textColor: 'text-green-300',
			status: 'Tutorial',
			link: '/lab/supabase-demo'
		},
		{
			id: 6,
			title: 'Embodied AI Studio',
			description: 'Robot learning platform for data collection, training, and deployment.',
			icon: Bot,
			color: 'bg-cyan-500',
			textColor: 'text-cyan-300',
			status: 'Platform',
			link: '/lab/embodied-ai'
		}
	];

	// Duplicate projects 4 times to ensure seamless scrolling on wide screens
	const displayProjects = [...projects, ...projects, ...projects, ...projects];
	
	let track: HTMLDivElement;
	let animationId: number;
	let position = 0;
	let isDragging = false;
	let startX = 0;
	let lastX = 0;
	let velocity = 0.5; // Auto scroll speed
	let lastPageX = 0;
	let lastDragTime = 0;
	let dragVelocity = 0;
	
	// Card dimensions: w-72 (288px) + gap-6 (24px) = 312px
	// We use dynamic calculation in onMount to be safe against root font size changes
	let setWidth = 0;

	onMount(() => {
		// Calculate the exact width of one set of items (including gaps)
		if (track && track.children.length > 1) {
			const firstCard = track.children[0] as HTMLElement;
			const secondCard = track.children[1] as HTMLElement;
			// The distance between the start of two consecutive items is the item width + gap
			const itemWidth = secondCard.offsetLeft - firstCard.offsetLeft;
			setWidth = itemWidth * projects.length;
		}

		const animate = () => {
			if (!isDragging && setWidth > 0) {
				position += velocity;
				
				// Friction / Decay logic
				// Gradually return to base speed (0.5 or -0.5)
				const baseSpeed = 0.5;
				const targetVelocity = velocity > 0 ? baseSpeed : -baseSpeed;
				
				// If velocity is very high, decay it
				if (Math.abs(velocity) > baseSpeed) {
					velocity = velocity * 0.95;
					// Snap to base speed if close enough
					if (Math.abs(velocity - targetVelocity) < 0.01) {
						velocity = targetVelocity;
					}
				} 
				// If velocity is too low (stopped), boost it back up
				else if (Math.abs(velocity) < baseSpeed) {
					velocity = velocity + (velocity > 0 ? 0.01 : -0.01);
				}
			}
			
			// Seamless loop logic
			if (position >= setWidth) {
				position -= setWidth;
			} else if (position < 0) {
				position += setWidth;
			}
			
			if (track) {
				track.style.transform = `translateX(-${position}px)`;
			}
			
			animationId = requestAnimationFrame(animate);
		};
		
		animationId = requestAnimationFrame(animate);
		
		return () => cancelAnimationFrame(animationId);
	});

	function handleMouseDown(e: MouseEvent) {
		isDragging = true;
		startX = e.pageX;
		lastPageX = e.pageX;
		lastX = position;
		lastDragTime = performance.now();
		dragVelocity = 0;
		if (track) track.style.cursor = 'grabbing';
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isDragging) return;
		e.preventDefault();
		
		const now = performance.now();
		const currentX = e.pageX;
		const deltaX = currentX - startX;
		
		// Update position directly
		position = lastX - deltaX;
		
		// Calculate instantaneous velocity (pixels per frame approx)
		const dt = now - lastDragTime;
		const dx = currentX - lastPageX;
		
		if (dt > 0) {
			// Convert px/ms to px/frame (approx 16ms)
			// Negative because dragging left (negative dx) should increase position (positive velocity)
			dragVelocity = -(dx / dt) * 16;
		}

		lastPageX = currentX;
		lastDragTime = now;
	}

	function handleMouseUp() {
		isDragging = false;
		if (track) track.style.cursor = 'grab';
		
		// Apply momentum if significant
		if (Math.abs(dragVelocity) > 0.1) {
			velocity = dragVelocity;
		}
	}
	
	function handleMouseLeave() {
		isDragging = false;
		if (track) track.style.cursor = 'grab';
	}
</script>

<div class="w-full relative group">
	<!-- Gradient Masks for Fade Effect -->
	<div class="absolute left-0 top-0 bottom-0 w-24 z-20 pointer-events-none bg-gradient-to-r from-background to-transparent"></div>
	<div class="absolute right-0 top-0 bottom-0 w-24 z-20 pointer-events-none bg-gradient-to-l from-background to-transparent"></div>

	<div 
		class="overflow-hidden w-full py-12 cursor-grab active:cursor-grabbing select-none"
		on:mousedown={handleMouseDown}
		on:mousemove={handleMouseMove}
		on:mouseup={handleMouseUp}
		on:mouseleave={handleMouseLeave}
		role="presentation"
	>
		<div 
			bind:this={track}
			class="flex gap-6 w-max px-6 will-change-transform"
		>
			{#each displayProjects as project, i}
				<button
					class={cn(
						"relative w-72 h-96 rounded-2xl p-6 text-left transition-all duration-300 border border-white/20 shadow-xl backdrop-blur-md flex-shrink-0",
						"hover:scale-105 hover:shadow-2xl hover:border-white/40",
						"bg-gradient-to-br from-slate-800/90 to-slate-900/90 dark:from-slate-900/90 dark:to-black/90 text-white"
					)}
					on:click={() => {
						if (project.link) {
							goto(project.link);
						} else {
							console.log('Clicked', project.title);
						}
					}}
				>
					<!-- Card Content -->
					<div class="h-full flex flex-col justify-between relative overflow-hidden">
						<!-- Background Decoration -->
						<div class={cn("absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20", project.color)}></div>
						
						<div>
							<div class={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg", project.color)}>
								<svelte:component this={project.icon} size={24} class="text-white" />
							</div>
							
							<h3 class="text-xl font-bold mb-2 leading-tight">{project.title}</h3>
							<p class="text-sm text-slate-300 leading-relaxed opacity-90">
								{project.description}
							</p>
						</div>

						<div class="mt-4">
							<div class="flex items-center justify-between">
								<span class={cn("text-xs font-mono px-2 py-1 rounded-full bg-white/10 border border-white/10", project.textColor)}>
									{project.status}
								</span>
								<div class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
									<ArrowRight size={14} />
								</div>
							</div>
						</div>
					</div>
				</button>
			{/each}
		</div>
	</div>
</div>

<style>
	/* Fallback for browsers that don't support mask-image if needed, 
	   but the div overlays above handle the fade effect visually. 
	   Using mask-image is cleaner for transparency but requires knowing the background.
	   Since we used div overlays with from-background, it assumes the parent has a solid background.
	   If the parent is a gradient or image, mask-image is better.
	*/
	.group {
		mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
		-webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
	}
</style>
