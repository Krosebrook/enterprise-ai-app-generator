import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  Book, 
  Rocket, 
  Shield, 
  FileText,
  CheckCircle2
} from 'lucide-react';
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';

const docSections = [
  { id: 'quickstart', name: 'Quickstart', icon: Rocket },
  { id: 'onboarding', name: 'Onboarding & AI Guide', icon: Rocket },
  { id: 'templates', name: 'Templates', icon: FileText },
  { id: 'editor', name: 'Code Editor & AI', icon: Shield },
  { id: 'ai_admin', name: 'AI Admin Center', icon: Shield },
  { id: 'standard', name: 'VibeCode Standard', icon: Shield },
  { id: 'changelog', name: 'Changelog', icon: FileText },
  { id: 'readme', name: 'README', icon: Book },
];

const quickstartContent = `
# Quickstart Guide

Welcome to the **VibeCode** - Enterprise Edition!

## Getting Started in 4 Easy Steps

### 1. Choose a Template
Browse 12 enterprise-ready templates across multiple categories:
- **SaaS** - Core SaaS foundation, TaskFlow, ProjectFlow Pro, HR Talent AI
- **AI** - AI BrandCraft, AI Content Pilot
- **E-Commerce** - E-Commerce Pro, ShopZen
- **Dashboard** - Analytics Hub, DataSphere
- **Mobile** - Mobile First, SecureMobile Wallet

### 2. Configure Features
Toggle the features you need:
- ✅ Authentication & Authorization
- ✅ Database & Storage
- ✅ Email Integration
- ✅ Payment Processing (Stripe)
- ✅ AI-Powered Features
- ✅ Real-time Collaboration
- ✅ Analytics & Reporting

### 3. Select AI Model
Choose the AI model for code generation:
- **GPT-4** - Most capable, best for complex logic
- **GPT-4 Turbo** - Faster responses, great balance
- **Claude 3** - Excellent reasoning and code quality
- **Gemini Pro** - Google's latest, cost-effective

### 4. Generate & Customize!
Click generate and watch your app come to life. Use the **Code Editor** with integrated AI Assistant for customization.

## Pro Features

### Save as Template
Turn your configured project into a reusable template:
1. Configure your project perfectly
2. Click "Save as Template" on any active project
3. Define template name, version, and category
4. Your template appears in the Templates library

### AI Code Assistant
Get intelligent help directly in the editor:
- **Refactor** - Improve code structure and performance
- **Debug** - Find and fix issues automatically
- **Explain** - Understand complex code snippets
- **Improve** - Get suggestions for enhancements

## Next Steps
- Use the **Code Editor** to customize components
- Run **Validation Scripts** to ensure quality
- Set up **CI/CD Pipelines** for automated deployment
- **Deploy** to production with one click
- Monitor performance and usage
`;

const standardContent = `
# VibeCode Standard

## Overview
The VibeCode Standard defines best practices for AI-generated applications.

## Core Principles

### 1. Security First
- Row Level Security (RLS) on all tables
- Secure API endpoints
- Input validation

### 2. Scalability
- Efficient database queries
- Caching strategies
- CDN integration

### 3. Maintainability
- Clean code architecture
- Comprehensive documentation
- Test coverage

## File Structure
\`\`\`
├── src/
│   ├── components/
│   ├── pages/
│   ├── api/
│   └── utils/
├── scripts/
│   ├── validate-rls.js
│   ├── template-router.js
│   └── validate-secrets.js
└── templates/
    └── saas-core-v1.2.0.md
\`\`\`

## Validation Scripts

### validate-rls.js
Ensures Row Level Security is properly configured on all database tables.

### validate-secrets.js
Checks that all required environment variables are set.

### template-router.js
Routes requests to the appropriate template configuration.
`;

const changelogContent = `
# Changelog

## [3.0.0] - 2026-03-03

### Added
- **AI-Driven Personalized Onboarding** — Multi-step flow with template-category and goal selection; AI generates a custom guide per user
- **Dynamic Task Recommendations** — DynamicTaskCard banner on Dashboard with session-cached AI task recommendations
- **AI Version Control** — Semantic versioning engine with AI-generated release notes (generateReleaseNotes function)
- **AI Role Suggestions** — Activity-based role recommendation for team members (suggestUserRole function)
- **UX Insights Panel** — Aggregate UX analytics analysis with friction detection and improvement recommendations (analyzeUXPatterns function)
- **AI Admin Center** — Unified tabbed interface for version control, role management, and UX insights
- **OnboardingProgress entity** — Persists per-user onboarding state, guide payload, completed steps, and skip status
- **UXAnalytics entity** — Stores per-session interaction data, navigation paths, and friction points
- **RoleSuggestion entity** — Records AI-generated role suggestions with confidence scores and metrics

### Changed
- Dashboard showTutorial logic now correctly re-evaluates after projects load (race condition fixed)
- OnboardingFlow restored to guide phase only when guide has valid recommended_steps content
- RoleSuggestionsPanel uses functional setState updates to prevent stale closure bugs
- AIAdmin page converted from static grid to dynamic tabbed interface with live template selector

### Fixed
- Onboarding re-opening guide phase on empty personalized_guide objects
- Dashboard tutorial banner showing for users who already skipped onboarding
- Stale loading/suggestions state in RoleSuggestionsPanel concurrent requests

---

## [2.0.0] - 2026-01-19

### Added
- **AI Code Assistant** integrated into Code Editor
  - Refactor code with AI suggestions
  - Debug issues automatically
  - Explain code snippets in plain language
  - Suggest improvements and optimizations
- **Save as Template** feature
  - Convert any active project into a reusable template
  - Define custom version numbers and categories
  - Templates available in Generate App workflow
- **6 New Enterprise Templates** (doubled template library to 12 total):
  - AI Content Pilot - AI-powered content management
  - ProjectFlow Pro - Advanced project management with AI insights
  - ShopZen - E-commerce with AI recommendations
  - DataSphere - Enterprise dashboard with predictive analytics
  - SecureMobile Wallet - Biometric mobile wallet
  - HR Talent AI - AI-driven HR and talent management
- Enhanced template categorization and filtering

### Changed
- Updated AppProject entity to support new templates
- Improved Code Editor UI with AI assistant toggle
- Enhanced template discovery and selection experience

### Fixed
- Template generation edge cases
- Editor performance with large projects

---

## [1.2.0] - 2024-01-15

### Added
- New AI models support (Claude 3, Gemini Pro)
- Enhanced template system
- Real-time generation progress

### Changed
- Improved dashboard UI
- Faster generation times

### Fixed
- Template validation issues
- Script execution errors

---

## [1.1.0] - 2024-01-01

### Added
- Payment integration
- Email templates
- Team collaboration

### Changed
- Updated dependencies
- Improved error handling

---

## [1.0.0] - 2023-12-15

### Initial Release
- Core template system
- Basic AI generation
- Dashboard interface
`;

const readmeContent = `
# VibeCode - Universal AI App Generator

> Enterprise Edition v2.0

## Overview
Generate production-ready enterprise applications with AI-powered code generation, intelligent code assistance, and customizable templates.

## Key Features
- 🚀 **Instant Generation** - Create full-stack apps in seconds
- 🎨 **12 Enterprise Templates** - Pre-designed for SaaS, AI, E-commerce, Dashboards & Mobile
- 🤖 **AI Code Assistant** - Built-in refactoring, debugging, and code explanation
- 💾 **Save as Template** - Turn projects into reusable templates
- 🔒 **Secure by Default** - Built-in security best practices (RLS, validation)
- ⚡ **High Performance** - Optimized for speed and scalability
- 🔄 **CI/CD Ready** - Integrated pipelines and deployment
- 📊 **Advanced Analytics** - Monitor and optimize your apps

## Installation

\`\`\`bash
npm install
npm run dev
\`\`\`

## Configuration

Create a \`.env\` file:
\`\`\`env
VITE_API_URL=your_api_url
VITE_AI_KEY=your_ai_key
DATABASE_URL=your_database_url
STRIPE_KEY=your_stripe_key (optional)
\`\`\`

## Usage

### Generate an App
1. Navigate to **Generate App**
2. Select from 12 enterprise templates
3. Configure features (auth, payments, AI, etc.)
4. Choose AI model (GPT-4, Claude 3, Gemini Pro)
5. Click **Generate** and watch the magic happen

### Customize with AI Assistant
1. Open **Code Editor**
2. Select any component or page
3. Click the **AI Assistant** button (sparkle icon)
4. Choose mode: Refactor, Debug, Explain, or Improve
5. Apply AI suggestions with one click

### Save as Template
1. Configure a project to perfection
2. Click **Save as Template** on the project card
3. Define name, version, category, and features
4. Your template is now available for future projects

## Architecture

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Serverless functions
- **Database**: PostgreSQL with Row Level Security
- **AI**: Multi-model support (OpenAI, Anthropic, Google)
- **Deployment**: Vercel, Netlify, AWS, Heroku

## Support
- 📧 Email: support@vibecode.dev
- 📚 Docs: https://docs.vibecode.dev
- 💬 Discord: https://discord.gg/vibecode
`;

export default function Documentation() {
  const [activeSection, setActiveSection] = useState('quickstart');

  const templatesContent = `
# Templates Guide

## Overview
VibeCode offers 12 enterprise-ready templates across 5 categories. Each template is production-ready with pre-configured features and best practices.

## Available Templates (12 Total)

### SaaS Category (4 templates)
#### 1. SaaS Core v1.2.0
- **Popularity**: ⭐⭐⭐⭐⭐ (156)
- **Features**: Authentication, Billing, Teams, Dashboard, API
- **Best For**: Multi-tenant SaaS applications
- **Includes**: User management, subscription billing, team collaboration

#### 2. TaskFlow v2.1.0
- **Popularity**: ⭐⭐⭐⭐ (124)
- **Features**: Projects, Tasks, Collaboration, Timeline, Reports
- **Best For**: Project management tools
- **Includes**: Kanban boards, Gantt charts, real-time updates

#### 3. ProjectFlow Pro v2.0.0
- **Popularity**: ⭐⭐⭐⭐ (103)
- **Features**: AI Insights, Resource Planning, Gantt Charts, Risk Analysis, Budget Tracking
- **Best For**: Enterprise project management with AI
- **Includes**: Predictive analytics, resource optimization

#### 4. HR Talent AI v1.0.0
- **Popularity**: ⭐⭐⭐ (78)
- **Features**: AI Recruitment, Onboarding, Performance Reviews, Skill Matching, Analytics
- **Best For**: HR and talent management platforms
- **Includes**: Candidate screening, automated onboarding flows

### AI Category (2 templates)
#### 5. AI BrandCraft v1.0.0
- **Popularity**: ⭐⭐⭐⭐ (89)
- **Features**: AI Generation, Logo Design, Color Palettes, Taglines
- **Best For**: Brand identity and design tools
- **Includes**: AI-powered logo generator, color theory engine

#### 6. AI Content Pilot v1.0.0
- **Popularity**: ⭐⭐⭐ (72)
- **Features**: AI Writing, SEO Tools, Content Calendar, Multi-platform Publishing, Analytics
- **Best For**: Content management and marketing
- **Includes**: SEO optimization, content scheduling, analytics

### E-Commerce Category (2 templates)
#### 7. E-Commerce Pro v1.5.0
- **Popularity**: ⭐⭐⭐⭐ (98)
- **Features**: Products, Cart, Checkout, Inventory, Analytics
- **Best For**: Full-featured online stores
- **Includes**: Payment gateway, shipping integration, inventory management

#### 8. ShopZen v1.0.0
- **Popularity**: ⭐⭐⭐⭐ (87)
- **Features**: AI Recommendations, Personalization, Inventory Management, Multi-currency, Abandoned Cart Recovery
- **Best For**: AI-enhanced e-commerce
- **Includes**: Smart product recommendations, customer personalization

### Dashboard Category (2 templates)
#### 9. Analytics Hub v1.0.0
- **Popularity**: ⭐⭐⭐ (67)
- **Features**: Charts, Reports, Exports, Real-time, Widgets
- **Best For**: Data visualization and reporting
- **Includes**: Interactive charts, custom dashboards

#### 10. DataSphere v1.0.0
- **Popularity**: ⭐⭐⭐⭐ (94)
- **Features**: Predictive Analytics, Custom Widgets, AI Forecasting, Data Connectors, Alerts
- **Best For**: Enterprise analytics with AI
- **Includes**: Predictive models, anomaly detection, automated alerts

### Mobile Category (2 templates)
#### 11. Mobile First v1.1.0
- **Popularity**: ⭐⭐ (45)
- **Features**: PWA, Offline, Push Notifications, Responsive
- **Best For**: Progressive web apps
- **Includes**: Service workers, offline mode, mobile-optimized UI

#### 12. SecureMobile Wallet v1.1.0
- **Popularity**: ⭐⭐⭐ (61)
- **Features**: Biometric Auth, Crypto Support, P2P Transfers, Transaction History, Security Alerts
- **Best For**: Financial and payment apps
- **Includes**: Biometric authentication, cryptocurrency support

## Creating Custom Templates

### Using Save as Template
1. Generate and configure an app perfectly
2. Customize code in the Code Editor
3. Click **Save as Template** on the project card
4. Fill in the template details:
   - **Name**: Descriptive template name
   - **Version**: Semantic version (e.g., 1.0.0)
   - **Category**: Choose from saas, ai, e-commerce, dashboard, mobile
   - **Description**: Clear description of use case
   - **Features**: List of included features

### Template Best Practices
- ✅ Use semantic versioning (MAJOR.MINOR.PATCH)
- ✅ Write clear, descriptive documentation
- ✅ Include all necessary features
- ✅ Test thoroughly before saving
- ✅ Add preview images when possible
- ✅ Tag features accurately for discoverability

## Template Selection Tips
- **For SaaS**: Start with SaaS Core for flexibility, TaskFlow for project management
- **For AI Apps**: Use AI BrandCraft for design tools, AI Content Pilot for content
- **For Online Stores**: E-Commerce Pro for traditional, ShopZen for AI-enhanced
- **For Dashboards**: Analytics Hub for basic, DataSphere for AI-powered analytics
- **For Mobile**: Mobile First for PWAs, SecureMobile Wallet for financial apps
`;

  const editorContent = `
# Code Editor & AI Assistant

## Overview
The integrated Code Editor provides a powerful environment for customizing generated applications with built-in AI assistance featuring context-aware explanations, architectural pattern recognition, and security analysis.

## Code Editor Features

### Component Management
- Browse pages, components, and styles in a tree structure
- Create, edit, and delete components
- Live preview of changes
- Syntax highlighting for React/JSX

### Visual Editing
- Edit component content directly
- Customize styles with color pickers
- Real-time preview mode
- Undo/redo support

### Project Management
- Switch between multiple projects
- Auto-save changes
- Version control integration

## AI Assistant (🌟 Enhanced Features)

### Overview
The AI Assistant uses advanced language models to help you write better code faster with context-aware analysis. Access it via the sparkle icon in the editor toolbar.

### Five Powerful Modes

#### 1. Refactor Mode
**Purpose**: Improve code structure and maintainability
**Use Cases**:
- Extract duplicate code into reusable functions
- Simplify complex logic
- Improve naming conventions
- Apply design patterns

#### 2. Debug Mode
**Purpose**: Find and fix issues automatically
**Use Cases**:
- Identify logic errors
- Fix React hooks dependencies
- Resolve state management issues
- Correct TypeScript errors

#### 3. Explain Mode (🆕 Enhanced)
**Purpose**: Deep, context-aware code understanding
**Includes**:
- What the code does and why
- Architectural patterns (MVC, MVVM, Observer, Singleton, etc.)
- Potential security vulnerabilities specific to React/Node stack
- Performance implications for your application
- Stack-specific considerations and best practices
- Integration points and dependencies

**Example**:
\`\`\`
AI provides comprehensive analysis including:
✓ Code purpose and flow
✓ Design patterns used
✓ Security risks identified
✓ Performance metrics
✓ React-specific optimizations
\`\`\`

#### 4. Improve Mode
**Purpose**: Get optimization suggestions
**Use Cases**:
- Performance optimization
- Accessibility improvements
- SEO enhancements
- Security hardening

### How to Use Enhanced AI Assistant

1. **Open the Editor**
   - Navigate to Editor page
   - Select your project

2. **Select Code**
   - Choose the component you want to work with
   - The current code will be loaded

3. **Activate AI Assistant**
   - Click the sparkle (✨) icon in the toolbar
   - The AI panel opens on the right

4. **Choose Mode**
   - Select from Refactor, Debug, Explain (Enhanced), or Improve
   - Explain mode now provides architectural and security analysis

5. **Customize Prompt (Optional)**
   - Add specific context or requirements
   - AI uses stack knowledge for better suggestions

6. **Generate Analysis**
   - Click the mode button
   - Wait for comprehensive analysis
   - Review architectural insights and security findings

7. **Apply Changes**
   - Review the AI-generated code and insights
   - Click "Apply Code" to integrate changes
   - Changes are auto-saved

### New: Context-Aware Analysis

The Enhanced Explain Mode now provides:

**Architectural Patterns**
- Identifies patterns: MVC, MVVM, Observer, Singleton, Factory, Strategy
- Explains pattern usage in your code
- Suggests pattern improvements

**Security Analysis**
- Detects SQL injection risks
- Identifies XSS vulnerabilities
- Finds authentication/authorization issues
- Suggests security best practices

**Performance Insights**
- Analyzes rendering performance
- Identifies N+1 query problems
- Suggests caching strategies
- Recommends bundle optimizations

## AI-Assisted Template Creation (🆕 New Feature)

When saving a project as a template, AI now:
- **Generates Professional Descriptions**: Context-aware, SEO-optimized descriptions
- **Suggests Tags & Categories**: Auto-populated from project analysis
- **Creates Preview Images**: AI-generated preview based on your UI
- **Drafts Feature Lists**: Comprehensive feature summaries

## Project Intelligence Dashboard (🆕 New Feature)

View comprehensive project insights:
- **Timeline Analysis**: Estimated duration, milestones, critical path
- **Completion Prediction**: Data-driven completion dates with confidence scores
- **Bottleneck Identification**: Ranked by impact with mitigation strategies
- **Resource Optimization**: Recommended team structure and allocation
- **Risk Assessment**: Project-specific risk analysis

## Best Practices

#### For Enhanced Explain Mode
- Use it to learn architectural patterns
- Identify security risks early
- Understand performance trade-offs
- Get stack-specific recommendations

#### Writing Effective Prompts
- **Be Specific**: Include context about your use case
- **Add Stack Info**: Mention frameworks/libraries used
- **Ask for Patterns**: "What patterns does this use?"
- **Security Focus**: "Are there security issues?"

#### Working with AI Suggestions
- ✅ Review architectural recommendations
- ✅ Act on security findings immediately
- ✅ Benchmark before/after performance
- ✅ Learn from pattern explanations
- ⚠️ Don't ignore security warnings
- ⚠️ Test performance optimizations

## Keyboard Shortcuts
- **Ctrl/Cmd + S**: Save changes
- **Ctrl/Cmd + Z**: Undo
- **Ctrl/Cmd + Shift + Z**: Redo
- **Ctrl/Cmd + /**: Toggle AI Assistant

## Integration Capabilities
The AI Assistant uses context from:
- Your chosen AI model (GPT-4, Claude 3, Gemini Pro)
- Project stack (React, Node.js, etc.)
- Selected features and dependencies
- Code patterns and conventions

## Advanced Features

### Context-Aware Suggestions
- AI learns from your project setup
- Understands your tech stack
- Provides stack-specific recommendations
- Considers your AI model choice

### Iterative Analysis
- Run multiple analysis passes
- Combine insights from different modes
- Build on previous recommendations
- Refine through iterations
`;

  const onboardingContent = `
# AI-Driven Personalized Onboarding

## Overview
VibeCode includes a fully AI-personalized onboarding flow that adapts to every new user's role, goals, and template choices. It is triggered automatically on first login and can be re-triggered from the dashboard.

## How It Works

### Step 1 — Welcome
Users are greeted with a role-aware welcome screen (Admin vs Developer). They choose to personalize their experience or skip directly to the dashboard.

### Step 2 — Intent (What to Build)
Users select the category of app they want to build:
- **SaaS App** — Subscription & recurring revenue products
- **AI Product** — LLM-powered tools & agents
- **E-Commerce** — Online storefronts & marketplaces
- **Analytics Dashboard** — Data visualization & reporting
- **Mobile App** — iOS & Android applications

This selection drives which templates, tips, and tutorials are surfaced.

### Step 3 — Goal (Primary Objective)
Users pick their primary goal:
- **Ship Something Fast** — Prioritizes Generator and Deploy steps
- **Learn the Platform** — Highlights Documentation and Examples
- **Explore AI Features** — Surfaces Intelligence and AI Code Tools
- **Deploy to Production** — Leads to CI/CD and Deploy pages

### Step 4 — AI Guide Generation
The platform calls the \`generatePersonalizedOnboarding\` backend function with:
- User role (admin/user)
- Selected template category
- Selected goal
- Previously completed steps

The AI returns a JSON payload with:
- Personalized welcome message referencing the user's specific goal
- 3–4 ordered, actionable recommended steps
- Template-specific pro tips

Progress is persisted in the **OnboardingProgress** entity linked to the user's email.

### Step 5 — Interactive Guide
The guide is displayed as a checklist of steps. Users can:
- Mark steps complete individually
- See high-priority items highlighted in orange
- Read pro tips specific to their template + goal combination

## Dynamic Task Recommendations

A compact **DynamicTaskCard** banner appears on the Dashboard for users with fewer than 2 projects. It:
- Calls \`recommendNextTask\` on mount (with session-level caching to avoid repeat AI calls)
- Displays a single action-oriented task with estimated time
- Provides a direct navigation link to the relevant page
- Is dismissible — dismissed state persists for the session

## Backend Functions

### \`generatePersonalizedOnboarding\`
- **Auth**: Requires authenticated user
- **Input**: \`{ userRole, selectedTemplate, userGoal, completedSteps, userActivities }\`
- **Output**: \`{ success, guide: { welcome_message, recommended_steps[], pro_tips[], estimated_completion_time } }\`

### \`recommendNextTask\`
- **Auth**: Requires authenticated user
- **Input**: \`{ currentPage, completedSteps, userRole, recentProjects }\`
- **Output**: \`{ success, recommendation: { task_title, task_description, page_to_visit, why_important, estimated_minutes } }\`

## Entity: OnboardingProgress
Stores per-user onboarding state. Key fields:
| Field | Type | Description |
|---|---|---|
| user_email | string | Linked user |
| completed_steps | string[] | Titles of completed guide steps |
| is_complete | boolean | Whether onboarding is fully done |
| skipped | boolean | Whether user skipped the flow |
| personalized_guide | object | Full AI-generated guide payload |
| role | string | admin or user |
`;

  const aiAdminContent = `
# AI Admin Center

## Overview
The AI Admin Center (\`/AIAdmin\`) consolidates three AI-powered administration capabilities into a single tabbed interface. It is accessible only to users with the **admin** role via the sidebar.

---

## Tab 1 — Version Control

### Purpose
AI-assisted semantic versioning and release note generation for templates.

### How to Use
1. Select a template from the dropdown (populated from the Templates entity)
2. Add one or more changes using the type selector + description field
3. Click **Generate Release Notes**

### Change Types
| Type | Triggers | Example |
|---|---|---|
| \`feature\` | Minor version bump | Added dark mode support |
| \`fix\` | Patch version bump | Fixed login redirect bug |
| \`breaking\` | Major version bump | Removed legacy API endpoint |
| \`docs\` | Patch version bump | Updated README |
| \`refactor\` | Patch version bump | Extracted shared utility |

### AI Output
- **Suggested next version** — Computed via semantic versioning rules (major/minor/patch)
- **Markdown release notes** — Professional, structured release notes generated by the LLM
- **Version strategy label** — "major", "minor", or "patch"

### Backend Function: \`generateReleaseNotes\`
- **Auth**: Requires authenticated user
- **Input**: \`{ templateName, currentVersion, changes[] }\`
- **Output**: \`{ success, suggested_version, release_notes (markdown), version_strategy }\`

---

## Tab 2 — Role Suggestions

### Purpose
Automatically analyze team members' platform activity and suggest appropriate roles (project_manager, lead_developer, contributor, reviewer, admin).

### How to Use
1. All registered users are listed automatically
2. Click **Analyze** next to any user
3. The AI reviews their activity metrics:
   - Projects created
   - Code reviews performed
   - Deployments triggered
   - Collaboration events
4. Receive a role suggestion with confidence score, reasoning, and permission set

### Backend Function: \`suggestUserRole\`
- **Auth**: Admin only (403 if non-admin)
- **Input**: \`{ userEmail }\`
- **Output**: \`{ success, suggestion: { suggested_role, confidence_score, reasoning, suggested_permissions, activity_metrics } }\`

---

## Tab 3 — UX Insights

### Purpose
Analyze aggregated user interaction data stored in the **UXAnalytics** entity to surface friction points and improvement recommendations.

### How to Use
1. Select a specific page or "All" to analyze the entire platform
2. Click **Analyze**
3. Review the output:
   - **Usability Score** (0–100) — Visual progress bar
   - **Friction Analysis** — AI narrative on where users struggle
   - **Recommendations** — Actionable improvement list
   - **Quick Wins** — Immediately implementable fixes

### Entity: UXAnalytics
Stores per-session interaction data. Key fields:
| Field | Description |
|---|---|
| page | Page name |
| user_email | Session user |
| session_duration | Seconds spent |
| navigation_path | Array of pages visited in order |
| friction_points | Array of \`{ location, issue, severity }\` objects |
| interactions | Array of \`{ element, action, timestamp }\` |

### Backend Function: \`analyzeUXPatterns\`
- **Auth**: Admin only (403 if non-admin)
- **Input**: \`{ page (optional), timeRange }\`
- **Output**: \`{ success, insights: { usability_score, friction_analysis, recommendations, quick_wins }, metrics }\`
`;

  const contentMap = {
    quickstart: quickstartContent,
    onboarding: onboardingContent,
    templates: templatesContent,
    editor: editorContent,
    ai_admin: aiAdminContent,
    standard: standardContent,
    changelog: changelogContent,
    readme: readmeContent,
  };

  return (
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Documentation</h1>
        <p className="text-slate-400">Learn how to use the Universal AI App Generator</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8 min-h-[70vh]">
        {/* Sidebar Navigation */}
        <div className="space-y-2">
          {docSections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all",
                activeSection === section.id
                  ? "bg-blue-500/10 border border-blue-500/30 text-blue-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              )}
            >
              <section.icon className="w-5 h-5" />
              <span className="font-medium">{section.name}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
            <CardContent className="p-8">
              <div className="prose prose-invert prose-slate max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-3xl font-bold text-white mb-6 pb-4 border-b border-slate-800">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xl font-semibold text-white mt-8 mb-4">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-medium text-slate-200 mt-6 mb-3">{children}</h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-slate-400 leading-relaxed mb-4">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="text-slate-400 space-y-2 mb-4 list-none">{children}</ul>
                    ),
                    li: ({ children }) => (
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>{children}</span>
                      </li>
                    ),
                    code: ({ inline, children }) => (
                      inline ? (
                        <code className="px-2 py-1 rounded bg-slate-800 text-cyan-400 text-sm">
                          {children}
                        </code>
                      ) : (
                        <pre className="bg-slate-950 rounded-xl p-4 overflow-auto my-4">
                          <code className="text-sm text-slate-300">{children}</code>
                        </pre>
                      )
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-blue-500 pl-4 my-4 text-slate-400 italic">
                        {children}
                      </blockquote>
                    ),
                    hr: () => <hr className="border-slate-800 my-8" />,
                    strong: ({ children }) => (
                      <strong className="text-white font-semibold">{children}</strong>
                    ),
                  }}
                >
                  {contentMap[activeSection]}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}