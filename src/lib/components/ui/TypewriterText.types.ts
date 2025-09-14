// TypewriterText 组件的 TypeScript 类型定义
export interface TypewriterTextProps {
	texts: string[];
	typeSpeed?: number;
	deleteSpeed?: number;
	delayBetween?: number;
	className?: string;
	cursorColor?: string;
	startDelay?: number;
}

// 使用示例和配置预设
export const typewriterPresets = {
	fast: {
		typeSpeed: 50,
		deleteSpeed: 25,
		delayBetween: 1000
	},
	normal: {
		typeSpeed: 100,
		deleteSpeed: 50,
		delayBetween: 2000
	},
	slow: {
		typeSpeed: 200,
		deleteSpeed: 75,
		delayBetween: 3000
	},
	dramatic: {
		typeSpeed: 150,
		deleteSpeed: 30,
		delayBetween: 4000
	}
};