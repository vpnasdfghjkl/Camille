<script>
	import ProfilePicture from '$lib/assets/SongJia.png';
	import { SocialButtons } from '$lib/components/site';
	import { whatsNew } from '$lib/config';
	import { Mailbox } from 'lucide-svelte';

	// const ProfilePicture = new URL('../../assets/profile_picture.jpg', import.meta.url).href
</script>

<div class="md:container">
	<div class="items-center justify-between mt-5 md:mt-12 md:flex md:flex-row">
		<!-- Image for mobile devices -->
		<img
			src={ProfilePicture}
			alt="Prabhu Kiran Konda"
			class="block mx-auto rounded-full w-52 h-52 md:hidden"
		/>

		<div class="space-y-3 md:w-1/2 md:mr-4">
			<div
				class="flex flex-col gap-4 border border-border p-2 bg-slate-100 dark:bg-zinc-900 rounded-xl mt-6 md:mt-0 text-primary"
			>
				<div class="flex items-center gap-4">
					<Mailbox />
					<h1 class="font-semibold">What's New?</h1>
				</div>

				<div>
					{@html whatsNew}
				</div>
			</div>

			<h1 class="font-bold md:text-xl">Hi, I'm</h1>
			<h1 class="text-2xl font-bold md:text-5xl bg-gradient-to-r from-orange-500 to-purple-500 text-transparent bg-clip-text">
				PROGRAM CAMILLE
			</h1>
			<p>
				a postgraduate student from China. I specialize in Robotics Learning. I want to be a full-stack
				developer. I’m currently seeking software developer roles to further my career. In my free time, I
				enjoy writing technical blogs and sharing my journey with others. If you'd like to get in touch, feel
				free to reach out to me.
			</p>
			<SocialButtons />
		</div>

		<img
			src={ProfilePicture}
			alt="Prabhu Kiran Konda"
			class="hidden rounded-full md:block h-28 w-28 md:h-64 md:w-64 md:self-center"
		/>
	</div>
</div>
