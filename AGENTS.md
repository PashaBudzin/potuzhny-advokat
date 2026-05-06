<!-- intent-skills:start -->

## Skill Loading

Before substantial work:

- Skill check: run `bunx @tanstack/intent@latest list`, or use skills already listed in context.
- Skill guidance: if one local skill clearly matches the task, run `bunx @tanstack/intent@latest load <package>#<skill>` and follow the returned `SKILL.md`.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
    <!-- intent-skills:end -->

# AGENTS.md

This file provides guidelines for agentic coding agents operating in this repository.

**Note:** This project uses [bun](https://bun.sh/) as the package manager, not npm/yarn.

## Project Overview

This is a Next.js 16 application with TypeScript, Tailwind CSS 4, and shadcn/ui. It's a lawyer/attorney website with document generation capabilities using AI (Google Gemini).

## Commands

| Command         | Description              |
| --------------- | ------------------------ |
| `bun run dev`   | Start development server |
| `bun run build` | Production build         |
| `bun run start` | Start production server  |
| `bun run lint`  | Run ESLint               |

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
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { someFunction } from "@/lib/some-module";

// Bad
import Button from "@/components/ui/button"; // named export exists
import "../components/something"; // use @/ instead
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

### tRPC Usage

This project uses tRPC with TanStack Query for type-safe API calls. The setup is in `apps/web/src/trpc/`.

#### Architecture

- **Server side** (`@/trpc/server`): Use in React Server Components (RSC) for prefetching
- **Client side** (`@/trpc/client`): Use in Client Components with `useTRPC()` hook

#### Files

- `apps/web/src/trpc/server.tsx` - Server-side utilities (prefetch, HydrateClient, trpc proxy)
- `apps/web/src/trpc/client.tsx` - Client-side provider and hooks (TRPCReactProvider, useTRPC)
- `apps/web/src/trpc/query-client.ts` - Query client configuration with SuperJSON
- `apps/web/src/app/api/[trpc]/route.ts` - API route handler

#### Server Components (RSC)

For server components that need to prefetch data and hydrate to the client:

```tsx
import { trpc, prefetch, HydrateClient } from "@/trpc/server";

export default async function Page() {
    // Prefetch query options - this prepares data on the server
    void prefetch(
        trpc.cases.getCases.queryOptions({
            offset: 0,
            limit: 50,
            sortField: "lastUpdated",
            sortOrder: "desc",
            state: null,
            search: null,
        }),
    );

    // Or prefetch with input
    void prefetch(
        trpc.cases.getCasesCount.queryOptions({
            state: null,
            search: null,
        }),
    );

    return (
        <HydrateClient>
            <YourClientComponent />
        </HydrateClient>
    );
}
```

Key points:

- Use `prefetch()` with `queryOptions()` to prefetch data server-side
- Wrap client component in `<HydrateClient>` to transfer dehydrated state
- Do NOT use `useTRPC()` in server components - it's a client hook

#### Client Components

For client components that need to fetch data or call mutations:

```tsx
"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export default function ClientComponent() {
    const trpc = useTRPC();

    // Using React Query with tRPC queryOptions
    const query = useQuery(
        trpc.cases.getCases.queryOptions({
            offset: 0,
            limit: 50,
            sortField: "lastUpdated",
            sortOrder: "desc",
            state: null,
            search: null,
        }),
    );

    // Handle loading/error states
    if (query.isLoading) return <div>Loading...</div>;
    if (query.isError) return <div>Error: {query.error.message}</div>;

    return <div>{query.data.length} cases</div>;
}
```

For mutations (create/update/delete):

```tsx
"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";

export function CreateButton() {
    const trpc = useTRPC();

    const mutation = useMutation(trpc.caseMetadata.updateCaseMetadata.mutationOptions());

    const handleClick = async () => {
        try {
            await mutation.mutateAsync({
                caseNumber: "123",
                data: { plaintiffName: "John" },
            });
        } catch (error) {
            console.error("Failed to update:", error);
        }
    };

    return (
        <button onClick={handleClick} disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Save"}
        </button>
    );
}
```

#### Key Patterns

1. **Always use `queryOptions()`** - This provides full React Query integration with typing
2. **Use `useTRPC()` hook** - Returns a decorated router with queryOptions and mutationOptions
3. **Handle loading/error states** - Check `query.isLoading`, `query.isError`, `mutation.isPending`, `mutation.isError`
4. **Server prefetch + HydrateClient** - For server components, prefetch data and hydrate to client
5. **Don't mix patterns** - Don't use `useTRPC()` in server components, don't use `prefetch` in client components

#### Provider Setup

Ensure your app is wrapped with the TRPC provider (usually in `apps/web/src/app/layout.tsx`):

```tsx
import { TRPCReactProvider } from "@/trpc/client";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html>
            <body>
                <TRPCReactProvider>{children}</TRPCReactProvider>
            </body>
        </html>
    );
}
```

#### Router Structure

tRPC routers are defined in `packages/api/src/routers/`:

- `cases.ts` - Case queries (getCases, getCasesCount, getCourtGenetative, getCasesWithHearings)
- `case-metadata.ts` - Case mutations (updateCaseMetadata)
- `auth.ts` - Auth operations (login)

Access procedures via: `trpc.<router>.<procedure>` (e.g., `trpc.cases.getCases`)

### Git Practices

- Create feature branches for new features
- Commit messages should be descriptive but concise
- Run `bun run lint` before committing
- Don't commit secrets (use .env.local, not committed to repo)
