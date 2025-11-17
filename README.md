# Camille - Personal Website

A modern personal website built with SvelteKit, featuring an integrated blog system, interactive contribution tracking, and AI chat assistant.

## 🎯 Features

### 📝 Content Management
- **Markdown Blog System** - Write posts in `/posts/` and organize series in `/series/`
- **MDsveX Integration** - Support for Svelte components in markdown
- **Syntax Highlighting** - Powered by Shiki with dual theme support
- **Math Rendering** - KaTeX integration for mathematical expressions
- **Auto Image Processing** - Local images convert to GitHub raw URLs in production

### 📊 Contribution Tracking
- **Interactive Contribution Graph** - Visual daily work tracking inspired by GitHub
- **Daily Check-ins** - Track work plans, focus tasks, and notes
- **Focus Areas Analysis** - Categorized task completion statistics
- **Persistent Storage** - Supabase PostgreSQL backend for reliable data storage

### 🤖 AI Assistant (Jarvis)
- **Personalized Chat** - Custom AI assistant using Groq/LangChain
- **Contextual Responses** - Answers questions about the site owner and content
- **Streaming Interface** - Real-time conversation with smooth UX

### 🎨 Modern UI/UX
- **Dark/Light Mode** - System preference detection with manual toggle
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Component Library** - Shadcn-Svelte integration for consistent UI
- **Performance Optimized** - Fast loading with caching strategies

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm/pnpm
- Supabase account (for data persistence)

### Setup
1. **Clone and Install**
   ```bash
   git clone https://github.com/your-username/Camille.git
   cd Camille
   npm install
   ```

2. **Configure Environment**
   ```bash
   # Create .env file with your settings
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   GROQ_API_KEY=your_groq_api_key
   ```

3. **Setup Database**
   ```bash
   # Run the SQL script in your Supabase dashboard
   # File: simple-create-table.sql
   ```

4. **Start Development**
   ```bash
   npm run dev
   # Open http://localhost:5175
   ```

## 🏗️ Architecture

### Core Stack
- **Framework**: SvelteKit (full-stack web framework)
- **Database**: Supabase PostgreSQL (cloud-hosted)
- **Styling**: Tailwind CSS + Shadcn components
- **Content**: MDsveX (markdown with Svelte components)
- **AI**: Groq API with streaming responses

### API Endpoints
```
/api/checkin      # Daily check-in CRUD operations
/api/stats        # Contribution graph data (cached)
/api/focus-tasks  # Task configuration management
/api/chat         # AI assistant conversations
/api/posts        # Blog content and metadata
```

### File Structure
```
src/
├── lib/
│   ├── components/    # Reusable Svelte components
│   ├── config/        # App configuration
│   ├── server/        # Server-side utilities
│   └── types/         # TypeScript definitions
├── routes/
│   ├── api/          # API endpoints
│   ├── blog/         # Blog pages
│   └── +layout.svelte # Global layout
posts/              # Blog post content
series/             # Blog series content
static/             # Static assets
```

## 🛠️ Development

### Available Commands
```bash
npm run dev         # Start development server
npm run build       # Production build
npm run preview     # Preview production build
npm run check       # TypeScript checking
```

### Adding Content
- **Blog Posts**: Create `.md` files in `/posts/{slug}/page.md`
- **Series**: Organize related posts in `/series/{series-name}/`
- **Focus Tasks**: Configure in `/src/lib/config/focus-tasks.ts`

### Database Testing
Visit `/test-db` for a comprehensive database testing interface that validates:
- Connection status and latency
- CRUD operations
- Data persistence
- API performance

## 📦 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Environment Variables
```bash
# Required
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional
GROQ_API_KEY=your_groq_api_key
PUBLIC_GITHUB_USERNAME=your_github_username
PUBLIC_GITHUB_REPO=your_repo_name
```

## 🔧 Configuration

### Customization Points
- **Focus Tasks**: Edit `/src/lib/config/focus-tasks.ts`
- **Site Metadata**: Update `/src/lib/config.ts`
- **Styling**: Modify Tailwind config and component styles
- **AI Personality**: Customize chat context in `/src/routes/api/chat/+server.ts`

### Content Guidelines
- Use frontmatter for post metadata (title, date, tags, etc.)
- Images in `/static/` auto-convert to GitHub URLs in production
- Series posts require `order` field for proper sequencing

## 📋 Built With

- **SvelteKit** - Full-stack web framework
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn-Svelte** - Accessible component library
- **MDsveX** - Markdown preprocessor for Svelte
- **Shiki** - Syntax highlighter
- **KaTeX** - Math rendering
- **Groq** - AI language model API

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

This is a personal website template. Feel free to fork and adapt for your own use!

---

Built with ❤️ using SvelteKit and modern web technologies.