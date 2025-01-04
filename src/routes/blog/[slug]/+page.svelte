<script lang="ts">
	import { dev } from '$app/environment';
	import { page } from '$app/stores';
	import { BlogMetatags, SVGDoodle, Stickybar } from '$lib/components/site';
	import Bloghero from '$lib/components/site/bloghero.svelte';
	import Comments from '$lib/components/site/gicsus_/comments.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { githubConfig } from '$lib/config.js';
	import { localToGithubURL } from '$lib/utils';
	import { Github } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import SeriesPostNavigation from '$lib/components/site/series-post-navigation.svelte';

	export let data: PageData;

	let { content, meta } = data;

	let isTocSticky = false;

	let theme_: string | undefined;
	let commentsSection: HTMLElement | null;
	let showScrollToTop = false;

	onMount(() => {
		theme_ = localStorage.getItem('mode')?.replace(/^"(.*)"$/, '$1');

		let lastScrollTop = 0;

		const scrollProgress = document.getElementById('scroll-progress') as HTMLDivElement;
		commentsSection = document.getElementById('comments') as HTMLDivElement;

		const handleScroll = () => {
			const scrollPosition = window.scrollY;
			isTocSticky = scrollPosition > 200;
			const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
			const height =
				document.documentElement.scrollHeight -
				document.documentElement.clientHeight -
				(commentsSection?.offsetHeight || 0);
			const scrolled = (winScroll / height) * 100;
			scrollProgress.style.width = `${scrolled}%`;

			const scrollTop = window.scrollY || document.documentElement.scrollTop;

			showScrollToTop = scrollTop < lastScrollTop;

			lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
		};

		window.addEventListener('scroll', handleScroll);

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});

	if (!dev) {
		if (typeof meta.image === 'string' && meta.image?.startsWith('/posts')) {
			meta.image = localToGithubURL({ src: meta.image });
		} else if (Array.isArray(meta.image)) {
			meta.image = meta.image.map((image: string) => {
				if (image.startsWith('/posts')) {
					return localToGithubURL({ src: image });
				}
				return image;
			});
		}
	}

	$: {
		content = data.content;
		meta = data.meta;
	}

	let githubUrl = `https://github.com/${githubConfig.username}/${githubConfig.repo}/blob/${githubConfig.branch}/posts/${$page.params.slug}/page.md`;

	let seriesGithubUrl = '';
	$: {
		if (data?.seriesPost?.subPosts) {
			let currentSlug = $page.params.slug;
			let splits = currentSlug.split(/-spn\d+-/);
			seriesGithubUrl = `https://github.com/${githubConfig.username}/${githubConfig.repo}/blob/${githubConfig.branch}/series/${splits[0]}/${splits[1]}.md`;
		}
	}
</script>

<BlogMetatags {meta} />

<div
	class="fixed top-0 md:top-[64px] z-[50] w-[0%] h-0.5 bg-muted-foreground"
	id="scroll-progress"
/>

<div class="pt-6 md:container md:pt-14 space-y-8">
	<Bloghero {data} />
	<Separator />
	<div class="relative w-full max-w-4xl mx-auto text-primary">
		<div class="mb-20 px-4 mdsvex" id="mdsvex">
			<svelte:component this={content} />
		</div>
		{#if data?.seriesPost?.subPosts}
			<div class="mb-20">
				<SeriesPostNavigation subPosts={data?.seriesPost?.subPosts} />
			</div>
		{/if}
		{#if isTocSticky}
			<Stickybar element={commentsSection} {showScrollToTop} />
		{/if}
		<div class="px-2">
			<Button
				variant="outline"
				target="_blank"
				class="h-8 px-2"
				href={data?.seriesPost?.subPosts ? seriesGithubUrl : githubUrl}
			>
				<Github class="w-4 h-4 mr-3" />
				<h1>View on GitHub</h1>
			</Button>
		</div>
	</div>
	<div class="flex items-center justify-center">
		<SVGDoodle />
	</div>
	<div class="px-3 pb-24 md:container" id="comments">
		<Comments {theme_} />
	</div>
</div>

<!-- <script lang="ts">
	import { dev } from '$app/environment';
	import { page } from '$app/stores';
	import { BlogMetatags, SVGDoodle, Stickybar } from '$lib/components/site';
	import Bloghero from '$lib/components/site/bloghero.svelte';
	import Comments from '$lib/components/site/gicsus_/comments.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { githubConfig } from '$lib/config.js';
	import { localToGithubURL } from '$lib/utils';
	import { Github } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import SeriesPostNavigation from '$lib/components/site/series-post-navigation.svelte';
	import CryptoJS from 'crypto-js'; // 引入加密解密库
	
	export let data: PageData;

	let { content, meta } = data;

	let isTocSticky = false;
	let theme_: string | undefined;
	let commentsSection: HTMLElement | null;
	let showScrollToTop = false;
	let password = ''; // 用户输入的密码
	let decryptedContent: string = ''; // 存储解密后的内容
	let isPasswordCorrect = false; // 密码是否正确
	let showPasswordInput = false; // 是否显示密码输入框
	let containsEncryptedContent = false; // 是否包含加密内容

	onMount(() => {
		theme_ = localStorage.getItem('mode')?.replace(/^"(.*)"$/, '$1');

		// 检查 content 是否包含加密标识符
		const encryptedStartTag = '-- encrypt:start --';
		const encryptedEndTag = '-- encrypt:end --';
		if (content.includes(encryptedStartTag) && content.includes(encryptedEndTag)) {
			containsEncryptedContent = true;
			showPasswordInput = true;
		}
		
		console.log("showPasswordInput:", showPasswordInput);  // 输出 showPasswordInput 的值
		console.log("containsEncryptedContent:", containsEncryptedContent);  // 输出 containsEncryptedContent 的值
		let lastScrollTop = 0;

		const scrollProgress = document.getElementById('scroll-progress') as HTMLDivElement;
		commentsSection = document.getElementById('comments') as HTMLDivElement;

		const handleScroll = () => {
			const scrollPosition = window.scrollY;
			isTocSticky = scrollPosition > 200;
			const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
			const height =
				document.documentElement.scrollHeight - document.documentElement.clientHeight - (commentsSection?.offsetHeight || 0);
			const scrolled = (winScroll / height) * 100;
			scrollProgress.style.width = `${scrolled}%`;

			const scrollTop = window.scrollY || document.documentElement.scrollTop;

			showScrollToTop = scrollTop < lastScrollTop;

			lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
		};

		window.addEventListener('scroll', handleScroll);

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});

	if (!dev) {
		if (typeof meta.image === 'string' && meta.image?.startsWith('/posts')) {
			meta.image = localToGithubURL({ src: meta.image });
		} else if (Array.isArray(meta.image)) {
			meta.image = meta.image.map((image: string) => {
				if (image.startsWith('/posts')) {
					return localToGithubURL({ src: image });
				}
				return image;
			});
		}
	}

	$: {
		content = data.content;
		meta = data.meta;
	}

	let githubUrl = `https://github.com/${githubConfig.username}/${githubConfig.repo}/blob/${githubConfig.branch}/posts/${$page.params.slug}/page.md`;

	let seriesGithubUrl = '';
	$: {
		if (data?.seriesPost?.subPosts) {
			let currentSlug = $page.params.slug;
			let splits = currentSlug.split(/-spn\d+-/);
			seriesGithubUrl = `https://github.com/${githubConfig.username}/${githubConfig.repo}/blob/${githubConfig.branch}/series/${splits[0]}/${splits[1]}.md`;
		}
	}

	// 解密函数
	function decryptContent(encryptedText: string, password: string): string {
		const [ivHex, encryptedDataHex] = encryptedText.split(':');
		const iv = CryptoJS.enc.Hex.parse(ivHex);
		const encryptedData = CryptoJS.enc.Hex.parse(encryptedDataHex);
		const key = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);

		const decrypted = CryptoJS.AES.decrypt(
			CryptoJS.lib.CipherParams.create({ ciphertext: encryptedData }),
			key,
			{ iv: iv }
		);

		return decrypted.toString(CryptoJS.enc.Utf8);
	}

	// 处理密码输入并解密内容
	function handlePasswordInput() {
		try {
			// 假设 encryptedContent 是加密的内容
			const encryptedContent = content.split('-- encrypt:start --')[1]?.split('-- encrypt:end --')[0];
			if (encryptedContent) {
				decryptedContent = decryptContent(encryptedContent, password);
				isPasswordCorrect = true;
				showPasswordInput = false;
			}
		} catch (error) {
			isPasswordCorrect = false;
		}
	}
</script>

<BlogMetatags {meta} />

<div
	class="fixed top-0 md:top-[64px] z-[50] w-[0%] h-0.5 bg-muted-foreground"
	id="scroll-progress"
/>

<div class="pt-6 md:container md:pt-14 space-y-8">
	<Bloghero {data} />
	<Separator />
	{#if showPasswordInput}
		<div class="text-center mb-8"> 
			<label for="password" class="text-xl">请输入密码查看内容</label>
			<input type="password" id="password" bind:value={password} class="mt-2 mb-4 p-2 border rounded" />
			<button on:click={handlePasswordInput} class="px-4 py-2 bg-blue-500 text-white rounded">解密</button>
			{#if !isPasswordCorrect}
				<div class="text-red-500 mt-2">密码错误，请重新输入。</div>
			{/if}
		</div>
	{:else}
		<div class="relative w-full max-w-4xl mx-auto text-primary">
			<div class="mb-20 px-4 mdsvex" id="mdsvex">
				<svelte:component this={containsEncryptedContent ? decryptedContent : content} />
				<svelte:component this={content} />
			</div>
			{#if data?.seriesPost?.subPosts}
				<div class="mb-20">
					<SeriesPostNavigation subPosts={data?.seriesPost?.subPosts} />
				</div>
			{/if}
			{#if isTocSticky}
				<Stickybar element={commentsSection} {showScrollToTop} />
			{/if}
			<div class="px-2">
				<Button
					variant="outline"
					target="_blank"
					class="h-8 px-2"
					href={data?.seriesPost?.subPosts ? seriesGithubUrl : githubUrl}
				>
					<Github class="w-4 h-4 mr-3" />
					<h1>View on GitHub</h1>
				</Button>
			</div>
		</div>
	{/if}
	<div class="flex items-center justify-center">
		<SVGDoodle />
	</div>
	<div class="px-3 pb-24 md:container" id="comments">
		<Comments {theme_} />
	</div>
</div>
 -->
