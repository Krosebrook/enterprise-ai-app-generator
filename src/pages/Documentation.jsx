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
  { id: 'standard', name: 'VibeCode Standard', icon: Shield },
  { id: 'changelog', name: 'Changelog', icon: FileText },
  { id: 'readme', name: 'README', icon: Book },
];

const quickstartContent = `
# Quickstart Guide

Welcome to the **Universal AI App Generator** - Enterprise Edition!

## Getting Started

### 1. Choose a Template
Select from our pre-built templates:
- **SaaS Core v1.2.0** - Full-featured SaaS starter
- **AI BrandCraft** - AI-powered branding tools
- **TaskFlow** - Project management solution

### 2. Configure Features
Toggle the features you need:
- ✅ Authentication
- ✅ Database
- ✅ Email Integration
- ✅ Payment Processing
- ✅ AI Features

### 3. Select AI Model
Choose the AI model for code generation:
- **GPT-4** - Most capable
- **GPT-4 Turbo** - Faster responses
- **Claude 3** - Excellent reasoning
- **Gemini Pro** - Google's latest

### 4. Generate!
Click the generate button and watch your app come to life.

## Next Steps
- Run validation scripts
- Deploy to production
- Monitor your app
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
# Universal AI App Generator

> Enterprise Edition

## Overview
Generate production-ready applications with AI-powered code generation.

## Features
- 🚀 **Instant Generation** - Create apps in seconds
- 🎨 **Beautiful Templates** - Pre-designed UI components
- 🔒 **Secure by Default** - Built-in security best practices
- ⚡ **High Performance** - Optimized for speed

## Installation

\`\`\`bash
npm install
npm run dev
\`\`\`

## Configuration

Create a \`.env\` file:
\`\`\`
VITE_API_URL=your_api_url
VITE_AI_KEY=your_ai_key
\`\`\`

## Usage

1. Select a template
2. Configure options
3. Generate your app
4. Deploy to production

## Support
Contact us at support@vibecode.dev
`;

export default function Documentation() {
  const [activeSection, setActiveSection] = useState('quickstart');

  const contentMap = {
    quickstart: quickstartContent,
    standard: standardContent,
    changelog: changelogContent,
    readme: readmeContent,
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Documentation</h1>
        <p className="text-slate-400">Learn how to use the Universal AI App Generator</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
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