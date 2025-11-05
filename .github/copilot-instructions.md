# Copilot Instructions for Camille Personal Website

## Architecture Overview

This is a SvelteKit-based personal website with an integrated markdown blog system. The core architecture features:

- **Content-first design**: Blog posts live in `/posts/*` and `/series/*` as markdown files with frontmatter
- **MDsveX preprocessing**: Custom markdown processing with KaTeX math support, syntax highlighting, and Svelte component integration
- **File-based routing**: SvelteKit's convention with API routes in `/src/routes/api/`
- **AI chat integration**: Custom "Jarvis" assistant using Groq/LangChain for personalized responses

## Content Management System

### Blog Structure
- **Single posts**: `/posts/{slug}/page.md` - standalone articles
- **Series posts**: `/series/{series-name}/*.md` with `/series/{series-name}/page.md` as cover page
- **Series logic**: Posts in series get special slug format `{coverFolder}-spn{order}-{filename}` for navigation

### Key Files for Content Processing
- `src/lib/posts.ts` - Main content aggregation logic with GitHub URL conversion
- `mdsvex.config.js` - Complex markdown preprocessing with custom rehype/remark plugins
- `src/lib/types.ts` - TypeScript interfaces for Post, Series, and SeriesPost

### Content Conventions
- Frontmatter required: `title`, `description`, `date`, `tags`, `image`, `draft`
- Series posts need additional `order` field for sequencing
- Images auto-convert to GitHub raw URLs in production via `localToGithubURL()`

## AI Chat System (Jarvis)

The site includes a custom AI assistant accessible via floating button:

- **Backend**: `/src/routes/api/chat/+server.ts` using ChatGroq with streaming responses
- **Frontend**: `/src/lib/components/site/jarvis.svelte` with chat UI using `ai/svelte`
- **Context**: Hardcoded personal information about the site owner in chat server
- **Behavior**: Only responds to questions about the site owner, refuses other topics

## Development Workflow

### Build Commands
```bash
npm run dev        # Development with hot reload
npm run build      # Production build
npm run preview    # Preview production build
npm run check      # Svelte type checking
```

### Environment Dependencies
- `.env` file existence affects blog file discovery (must exist even if empty)
- GitHub config in `src/lib/config.ts` for raw URL generation

## Component Architecture

### UI Components
- **Shadcn-Svelte integration**: Components in `/src/lib/components/ui/`
- **Site components**: Navigation, footer, AI chat in `/src/lib/components/site/`
- **Markdown components**: Custom heading, blockquote, code blocks in `/src/lib/components/markdown/`

### Styling Patterns
- **Tailwind CSS**: Utility-first with custom configuration
- **Dark mode**: Uses `mode-watcher` package with system/manual toggle
- **Component styling**: Tailwind variants with `clsx` utility in `src/lib/utils.ts`

## Critical Integrations

### Syntax Highlighting
- **Shiki + rehype-pretty-code**: Build-time syntax highlighting
- **Dual themes**: Light (`min-light`) and dark (`moonlight-2`) with theme switching
- **Language support**: Limited to specific languages in `mdsvex.config.js`

### Math Rendering
- **KaTeX integration**: Both inline (`$$equation$$`) and block (`\```math`) support
- **Custom processing**: Multiple remark plugins for different math syntax patterns

### GitHub Integration
- **Image hosting**: Local images auto-convert to GitHub raw URLs in production
- **Config**: `githubConfig` object in `src/lib/config.ts` defines repo details

## Navigation Patterns

### Route Structure
- `/blog` - Main blog listing with masonry layout
- `/blog/[slug]` - Individual post/series navigation
- `/tags` - Tag-based filtering system
- `/projects` - Static project showcase
- `/about` - Personal information page

### Data Loading
- **Server-side**: `+page.server.ts` files use API routes for data fetching
- **API design**: RESTful endpoints with query parameters (`?series=true`, `?tags=true`)
- **Type safety**: Consistent TypeScript interfaces across API boundaries

When working with this codebase, prioritize understanding the content processing pipeline in `posts.ts` and the MDsveX configuration, as these are central to the site's functionality.