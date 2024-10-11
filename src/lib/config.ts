import { LinkedIn, X } from '$lib/components/site/icons';
import { FileText, Github, Mail } from 'lucide-svelte';

type routesType = {
	name: string;
	link: string;
};

type socialsType = {
	href: string;
	icon: typeof Github;
	display: string;
	class?: string;
};

// nav routes
export const routes: routesType[] = [
	{
		name: 'Blog',
		link: '/blog'
	},
	{
		name: 'Tags',
		link: '/tags'
	},
	{
		name: 'Projects',
		link: '/projects'
	},
	{
		name: 'About',
		link: '/about'
	}
];

// social icons with links
export const socials: socialsType[] = [
	{
		href: 'https://github.com/vpnasdfghjkl',
		icon: Github,
		display: 'GitHub'
	},
	// {
	// 	href: 'https://linkedin.com/in/PrabhuKiranKonda',
	// 	icon: LinkedIn,
	// 	display: 'LinkedIn'
	// },
	{
		href: 'https://x.com/PcP2LUckf2WAXKl',
		icon: X,
		display: 'Twitter',
		class: 'h-4 w-4'
	},
	{
		href: 'mailto:xiaohan20000811@gmail.com',
		icon: Mail,
		display: 'Mail',
		class: 'h-4 w-4'
	},
	{
		href: '/Prabhu Kiran Konda Resume.pdf',
		icon: FileText,
		display: 'Resume Example',
	}
];

export const getSocials = ({ exclude }: { exclude?: string } = {}): socialsType[] => {
	if (exclude) {
		return socials.filter((social) => social.display !== exclude);
	}
	return socials;
};

export const githubConfig = {
	username: 'vpnasdfghjkl',
	repo: 'Camille',
	branch: 'main'
};

export const author = {
	name: 'Camille X',
	tagline: '不自量力的还手，直至死方休',
	avatar: `https://github.com/${githubConfig.username}.png`,
	twt: 'prabhukirantwt'
};

export const whatsNew: string = `
Currently working on 100 Days of AI. A 100 day challenge to learn, teach and build AI
@ <a href='https://neuralchemie.com' class="underline hover:underline-offset-4">Neuralchemie</a>`;
