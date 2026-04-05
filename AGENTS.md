# AGENTS.md

This file provides guidelines for agentic coding agents operating in this repository.

**Note:** This project uses [bun](https://bun.sh/) as the package manager, not npm/yarn.

## Project Overview

This is a Next.js 16 application with TypeScript, Tailwind CSS 4, and shadcn/ui. It's a lawyer/attorney website with document generation capabilities using AI (Google Gemini).

## Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Production build |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |

There are no dedicated test scripts in this project.

## Code Style Guidelines

### TypeScript

- Use explicit return types for utility functions and exported functions
- Use `type` for interfaces that don't extend other types, `interface` for extensible types
- Prefer `zod` for runtime validation (this project uses zod v4)
- Use strict null checks - never use `any` or `as` type assertions

### Imports

- Use path aliases: `@/` maps to `./src/`
- Order imports: external (react, next), then internal (@/ components, lib, state)
- Use named imports for React: `import * as React from "react"`
- Relative imports only when module is not in src/ (avoid `../`)

```typescript
// Good
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { someFunction } from "@/lib/some-module"

// Bad
import Button from "@/components/ui/button"  // named export exists
import "../components/something"  // use @/ instead
```

### Naming Conventions

- **Files**: kebab-case for pages/routes (`create-pozov/page.tsx`), PascalCase for components (`Button.tsx`)
- **Components**: PascalCase (e.g., `FileUpload`, `JsonPreview`)
- **Functions/variables**: camelCase
- **Constants**: SCREAMING_SNAKE_CASE for config values, camelCase otherwise
- **Types/Interfaces**: PascalCase, suffix with `Type` if needed (e.g., `ExtractData`)

### React Patterns

- Use functional components with hooks
- Use Jotai for state management (atoms in `src/state/`)
- Prefer composition over inheritance
- Use `React.ComponentProps<"element">` for polymorphic component prop types
- Always destructure props with defaults where appropriate
- Use early returns for cleaner conditionals

### UI Components (shadcn/ui)

- Use CVA (class-variance-authority) for component variants
- Follow the pattern in `src/components/ui/button.tsx` for new components
- Use `cn()` utility from `@/lib/utils` for conditional class merging
- Use hugeicons (from `@hugeicons/react`) for icons

### Error Handling

- Use try/catch with meaningful error messages
- Log errors appropriately (console.error for non-critical, throw for critical)
- Handle async operations with proper loading/error states
- Use Zod for form validation with descriptive error messages

### File Organization

```
src/
├── app/           # Next.js App Router pages
├── components/    # React components
│   └── ui/        # shadcn/ui components
├── lib/           # Utilities, configs, document generation
├── state/         # Jotai atoms
└── public/        # Static assets (moved back to root)
```

Note: `public/` remains at project root (not in src/) for Next.js static file serving.

### Tailwind CSS

- Use Tailwind 4 with CSS variables
- Follow the existing pattern in `src/app/globals.css` for theme
- Use `@apply` sparingly - prefer utility classes in JSX
- Use `cn()` for conditional classes

### Document Generation

- Document templates are in `src/lib/templates.ts`
- Use `docxtemplater` for .docx generation
- Use `docx` package for programmatic .docx creation
- Preview components in `src/components/docx-preview.tsx`

### API Routes

- Place in `src/app/api/` (Next.js App Router)
- Use Route Handlers with `NextResponse`
- Validate input with Zod schemas
- Keep business logic in `src/lib/`

### Git Practices

- Create feature branches for new features
- Commit messages should be descriptive but concise
- Run `bun run lint` before committing
- Don't commit secrets (use .env.local, not committed to repo)