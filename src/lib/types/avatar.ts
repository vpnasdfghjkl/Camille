/**
 * 头像组件相关类型定义
 */

/** 头像尺寸选项 */
export type AvatarSize = 'small' | 'medium' | 'large';

/** 头像组件配置选项 */
export interface AvatarOptions {
	/** 主要头像图片路径 */
	profileImage: string;
	/** 悬停时显示的头像图片路径 */
	hoverImage?: string;
	/** 图片替代文本 */
	alt?: string;
	/** 头像尺寸 */
	size?: AvatarSize;
	/** 是否启用悬停效果 */
	enableHover?: boolean;
	/** 是否启用动画效果 */
	enableAnimations?: boolean;
}

/** 头像尺寸样式配置 */
export interface AvatarSizeConfig {
	/** 容器尺寸类名 */
	container: string;
	/** 内部背景尺寸类名 */
	innerBg: string;
	/** 头像图片尺寸类名 */
	avatar: string;
	/** 边框尺寸类名 */
	border: string;
}