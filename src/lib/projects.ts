import type { TechStack } from './icons';

export type ProjectType = {
	title: string;
	featured?: boolean;
	href: string;
	source?: string;
	image: string;
	description: string;
	techstack: TechStack[];
};

export const projects: ProjectType[] = [
	{
		title: 'Personal Portfolio with Markdown Blog',
		description:
			'This website, camille-gamma.vercel.app is my personal website with a markdown blog written in SvelteKit and deployed using Vercel. Styled using Taiwind CSS and Shadcn-UI and completely written in TypeScript. fork from https://github.com/PrabhuKiran8790/prabhukirankonda.vercel.app', 
		href: 'https://camille-gamma.vercel.app/',
		source: 'https://github.com/vpnasdfghjkl/Camille',
		image: '/camille.png',
		techstack: ['SvelteKit', 'Tailwind', 'TypeScript'],
		featured: true
	},
	{
		title: 'Robotics: embodied AI for robotic manipulation - kuavo-il-opensource',
		description:
			'kuavo-il-opensource is an open-source project aimed at advancing embodied AI for robotic manipulation tasks. It provides a comprehensive framework for training and deploying AI models in robotic systems.',
		href: 'https://gitee.com/leju-robot/kuavo-il-opensource',
		source: 'https://gitee.com/leju-robot/kuavo-il-opensource',
		image: '/waic4.jpg',
		techstack: ['ROS', 'Docker', 'Python', "PyTorch",],
		featured: true
	},
	// {
	// 	title: 'Dall-E Clone: AI Image Generation',
	// 	description:
	// 		'Created a Dall-E Clone using SvelteKit, OpenAI API, TailwindCSS, TypeScript, Dirzzle ORM and MySQL Database. Converted it into fully working SaaS which inludes Stripe Payment Integration, User Authentication (Github & Google), and User Friendly Interface. The app is deployed with Vercel for easy setup and scalability.',
	// 	href: 'https://dall-e-sveltekit.vercel.app/',
	// 	source: 'https://github.com/PrabhuKiran8790/dall-e-clone',
	// 	image: '/dall-e-svelte-min.png',
	// 	techstack: ['SvelteKit', 'TypeScript', 'MySQL', 'Drizzle'],
	// 	featured: true
	// },
	// {
	// 	title: 'GFPGAN Streamlit App: Face Restoration',
	// 	description: `Created a Streamlit app for the GFPGAN model to restore faces in images. It has a user-friendly interface, and easy Docker deployment.`,
	// 	image: '/GFPGAN-min.png',
	// 	source: 'https://huggingface.co/spaces/PrabhuKiranKonda/Streamlit-GFPGAN/tree/main',
	// 	href: 'https://huggingface.co/spaces/PrabhuKiranKonda/Streamlit-GFPGAN',
	// 	techstack: ['Python', 'Streamlit', 'Docker']
	// },
	// {
	// 	title: 'AI-SaaS App: MultiGPT',
	// 	description:
	// 		'Created an AI-SaaS app using NextJS, React. It features a subscription based payment system using Stripe, user authentication, and a user-friendly interface. The app is deployed with Vercel for easy setup and scalability. It has several features like Chatbot, Code Generation, Image Generation, Audio Generation and Video Generation.',
	// 	image: '/multigpt.png',
	// 	href: 'https://multigpt-pk.vercel.app/',
	// 	source: 'https://github.com/PrabhuKiran8790/ai-saas',
	// 	techstack: ['NextJS', 'React', 'JavaScript']
	// },
	// {
	// 	title: 'Full Stack Todo App',
	// 	description: `Created a Todo application using SvelteKit, FastAPI, and PostgreSQL. It features JWT-based authentication for security and includes task categorization into sections like current todos, upcoming, overdue, and completed. Users can easily update, delete, and mark tasks as complete.`,
	// 	image: '/svelte-todo.png',
	// 	href: 'https://sveltekit-todo-prabhu.vercel.app/',
	// 	techstack: ['SvelteKit', 'JavaScript', 'Python', 'FastAPI', 'PostgreSQL']
	// },
	// {
	// 	title: 'PDF Assistant: AI Powered Q&A for PDFs',
	// 	description: `Built a PDF Assistant tool using OpenAI's LLM to answer questions from uploaded PDF files. It has a user-friendly web interface with StreamLit, Firebase authentication for security, real-time updates via Firebase, a guest mode for no authentication, and easy Docker deployment.`,
	// 	image: '/PDF_Assistant.png',
	// 	href: 'https://huggingface.co/spaces/PrabhuKiranKonda/Streamlit-PDF-Assistant-Docker',
	// 	source:
	// 		'https://huggingface.co/spaces/PrabhuKiranKonda/Streamlit-PDF-Assistant-Docker/tree/main',
	// 	techstack: ['Python', 'Streamlit', 'Docker']
	// },
	// {
	// 	title: 'REST API: FastAPI with MongoDB',
	// 	description: `Developed a high-performance API using FastAPI and MongoDB Cloud Database for CRUD Operation. The API is deployed with Docker for easy setup and scalability.`,
	// 	image: '/FastAPI_MongDB.png',
	// 	href: 'https://huggingface.co/spaces/PrabhuKiranKonda/fastapi_mongoDB',
	// 	source: 'https://huggingface.co/spaces/PrabhuKiranKonda/fastapi_mongoDB/tree/main',
	// 	techstack: ['Python', 'FastAPI', 'MongoDB', 'Docker']
	// }
];
