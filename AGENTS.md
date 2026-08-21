# Agent Instructions

## Project Context

This is a production-grade Next.js application. Always generate code as if it will be maintained by a team of senior frontend engineers.

Priorities:

1. Scalability
2. Maintainability
3. Type Safety
4. Separation of Concerns
5. Feature-Based Architecture
6. Reusability
7. Developer Experience

Never generate beginner-level folder structures.

---

# Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- React Query (TanStack Query)
- Axios
- React Hook Form
- Zod
- Zustand (if global state is required)

---

# Architecture Rules

Use Feature-Sliced Architecture with Domain Separation.

The application must be organized by business features, not by file type.

❌ Never create:

```
    src/
    ├── components/
    ├── pages/
    ├── hooks/
    ├── services/
    ├── utils/
```

This structure becomes unmaintainable at scale.

---

# Required Root Structure

Whenever asked to create the project structure, always generate:

```
src/
│
├── app/
├── features/
├── shared/
├── domains/
├── lib/
├── providers/
├── styles/
├── config/
├── types/
└── constants/
```
---

# App Router Rules

App Router should only contain:

```
app/
│
├── (auth)/
├── (dashboard)/
├── api/
│
├── layout.tsx
├── page.tsx
├── loading.tsx
├── error.tsx
└── not-found.tsx
```
Rules:

- No business logic in app directory.
- No API calls in app directory.
- No complex state management in app directory.
- App directory is responsible only for routing and page composition.

---

# Feature Architecture

Every business feature must live inside features/.

Example:

```
features/
│
├── auth/
├── chat/
├── conversation/
├── group-chat/
├── profile/
```
Each feature should be self-contained.

Example:

```
features/chat/
│
├── api/
├── components/
├── hooks/
├── schemas/
├── types/
├── services/
├── utils/
├── store/
└── index.ts
```
Rules:

- Features cannot directly access other feature internals.
- Communication between features must happen through public exports.
- Every feature must expose a clean public API using index.ts.

---

# Domain Layer Rules

Business entities belong inside domains/.

Example:

```
domains/
│
├── user/
│   ├── user.types.ts
│   ├── user.schema.ts
│   └── index.ts
│
├── message/
│
├── conversation/
│
└── group/
```

Domain layer contains:

- Entity types
- Business models
- Validation schemas
- Shared business logic

Domain layer must not contain UI.

---

# Shared Layer Rules

Shared contains reusable code used across multiple features.

```
shared/
│
├── ui/
├── components/
├── hooks/
├── utils/
├── icons/
├── assets/
└── helpers/
```

Rules:

- Must be feature agnostic.
- Must not contain business logic.
- Must not depend on features.

---

# API Layer Rules

API communication belongs inside feature/api.

Example:

```
features/chat/api/
│
├── send-message.ts
├── get-messages.ts
└── index.ts
```
Rules:

- One file per endpoint.
- No giant api.ts files.
- Use typed request and response models.
- React components must never call axios directly.

❌ Forbidden:

axios.get(...)

inside components.

---

# Service Layer Rules

Services contain business workflows.

Example:

```
features/chat/services/
│
└── chat.service.ts
```

Responsibilities:

- Combine multiple API calls.
- Business orchestration.
- Complex workflows.

Services may use APIs.

Components must use services.

---

# React Query Rules

All server state must use React Query.

Example:

```
features/chat/hooks/
│
├── useMessages.ts
├── useSendMessage.ts
```

Rules:

- Query keys must be centralized.
- No fetch logic inside components.

---

# Zustand Rules

Use Zustand only for:

- UI state
- Modal state
- Sidebar state
- Theme state
- Temporary client state

Do not use Zustand for server data.

Use React Query instead.

---

# Form Rules

All forms must use:

- React Hook Form
- Zod

Example:

```
features/auth/schemas/
│
└── login.schema.ts
```

Never use uncontrolled validation.

---

# Component Rules

Component hierarchy:

```
shared/ui
↓
feature components
↓
pages
```

Rules:

- Shared UI components must be business agnostic.
- Feature components may contain business logic.
- Pages compose features.

---

# Naming Rules

Folders:

kebab-case

Examples:
```
group-chat/
message-list/
user-profile/
```

Files:

kebab-case

Examples:

```
chat-sidebar.tsx
message-item.tsx
create-group-modal.tsx
```

Types:

PascalCase

Examples:

```
User
Message
Conversation
```

Interfaces:

Avoid interface unless extension is required.

Prefer:

```
type User = {}
```

---

# Import Rules

Always use absolute imports.

Example:

```
import { ChatSidebar } from "@/features/chat";
import { Button } from "@/shared/ui/button";
```
Never use:
```
../../../components/button
```
---

# Barrel Export Rules

Every feature must contain:

index.ts

Example:

```
features/chat/index.ts
```
```
export * from "./components";
export * from "./hooks";
```

Consumers must import only from public entrypoints.

---

# Error Handling Rules

Never silently swallow errors.

Always:

- Handle API errors
- Show user feedback
- Log unexpected errors

Create:

```
shared/lib/error-handler.ts
```

---

# Environment Rules

Environment access must be centralized.

```
config/
│
└── env.ts
```

Never access:

process.env.XYZ

directly throughout the application.

---

# Senior Folder Structure Example

```
src/
│
├── app/
│
├── features/
│   ├── auth/
│   ├── chat/
│   ├── conversation/
│   ├── group-chat/
│   └── profile/
│
├── domains/
│   ├── user/
│   ├── message/
│   ├── conversation/
│   └── group/
│
├── shared/
│   ├── ui/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   ├── assets/
│   └── icons/
│
├── lib/
│   ├── axios/
│   ├── query-client/
│   └── websocket/
│
├── providers/
│
├── config/
│
├── styles/
│
├── constants/
│
└── types/
```
---

# AI Instruction

Whenever the user says:

- "Create the project structure"
- "Generate the base architecture"
- "Create the folder structure"
- "Scaffold the project"

Always generate:

1. Full folder tree
2. Responsibility of each folder
3. Example files
4. Public API boundaries
5. Data flow explanation

Do not generate a simplified structure.

Assume this project is expected to support 50k+ users and multiple engineers working on it.
