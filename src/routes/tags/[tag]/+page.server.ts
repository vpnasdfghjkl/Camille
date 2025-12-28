import { groupPostsByTag } from '$lib/posts';
import { tagToSlug } from '$lib/utils';

export const load = async ({ params }) => {
	const slug = tagToSlug(params.tag);
	const { tagsSlugMap, uniqueTagsArray, postsByTag } = await groupPostsByTag();
	const currentTag = tagsSlugMap[slug];
	return {
		currentTag,
		tags: uniqueTagsArray,
		postsByTag
	};
};
