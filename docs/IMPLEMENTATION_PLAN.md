# IMPLEMENTATION_PLAN

## Goal

Build and deploy a production-grade real-time chat application and a creative landing page based on the provided API.

Deliverables:

1. API Documentation
2. Chat Application
3. Landing Page
4. README + Thought Process Write-up
5. Live Deployment

---

# Phase 0 — Project Setup

## Step 0.1 Create Project

- Initialize Next.js App Router project
- Configure TypeScript
- Configure ESLint
- Configure Prettier
- Configure Husky (optional)
- Configure lint-staged (optional)

### Install Dependencies

Core:

- Next.js
- TypeScript
- TailwindCSS

Data Layer:

- Axios
- TanStack Query

Forms:

- React Hook Form
- Zod

State:

- Zustand

Utilities:

- clsx
- tailwind-merge
- date-fns

UI:

- shadcn/ui

---

# Phase 1 — API Research & Documentation

## Step 1.1 Analyze Swagger

Review every endpoint.

Document:

- Endpoint URL
- Method
- Query Params
- Path Params
- Request Body
- Response Shape
- Error Response
- Status Codes

---

## Step 1.2 Create API Documentation

Create:

docs/
└── api-documentation.md

Include:

### Authentication

- Login flow
- User creation flow

### Users

- Search user
- Get user

### Conversations

- Create conversation
- Get conversations

### Messages

- Get messages
- Send messages

### Groups

- Create group
- Get groups

---

## Step 1.3 API Improvement Notes

Document:

- Naming inconsistencies
- Missing validation
- Missing status codes
- Missing pagination
- Missing websocket support

These will be useful in Part 3.

---

# Phase 2 — Architecture Setup

## Step 2.1 Create Folder Structure

Create complete architecture:

src/

app/
features/
domains/
shared/
providers/
config/
lib/
constants/
types/

---

## Step 2.2 Setup Core Infrastructure

### Axios Client

lib/api/

- axios-instance.ts

Features:

- baseURL
- interceptors
- error normalization

---

### Query Client

lib/react-query/

- query-client.ts

Setup:

- staleTime
- gcTime
- retry

---

### Providers

providers/

- query-provider.tsx
- theme-provider.tsx

---

### Environment Config

config/

- env.ts

---

# Phase 3 — Domain Modeling

Create all business entities.

---

## User Domain

domains/user/

Create:

- user.types.ts
- user.schema.ts

Models:

User

Fields:

- id
- phone
- name
- createdAt

---

## Conversation Domain

domains/conversation/

Models:

Conversation

Fields:

- id
- type
- participants
- lastMessage
- updatedAt

ConversationType

- DIRECT
- GROUP

---

## Message Domain

domains/message/

Models:

Message

Fields:

- id
- conversationId
- senderId
- content
- createdAt

---

## Group Domain

domains/group/

Models:

Group

Fields:

- id
- name
- members

---

# Phase 4 — Authentication Feature

## Goal

Allow user login using:

- Phone Number
- Name

As specified in assignment.

---

## Tasks

Create:

features/auth/

### API

- login.ts

### Schemas

- login.schema.ts

### Hooks

- use-login.ts

### Components

- login-form.tsx

### Pages

/(auth)/login

---

## UI States

Handle:

- Loading
- Success
- Error

---

## Validation

Phone:

- Required

Name:

- Required

---

# Phase 5 — User Search Feature

## Goal

Search users by:

- Name
- Phone Number

---

## Tasks

features/user-search/

Create:

### API

- search-users.ts

### Hooks

- use-search-users.ts

### Components

- search-input.tsx
- user-search-results.tsx

---

## UX

Support:

- Debounce
- Empty state
- No results state
- Loading state

---

# Phase 6 — Conversation List Feature

## Goal

Display all conversations.

---

## Tasks

features/conversations/

### API

- get-conversations.ts

### Hooks

- use-conversations.ts

### Components

- conversation-list.tsx
- conversation-item.tsx

---

## UI

Show:

- Avatar
- Name
- Last message
- Timestamp

---

## States

Handle:

- Loading
- Empty
- Error

---

# Phase 7 — Create Conversation Feature

## Goal

Start new conversations.

Assignment requirement.

---

## Tasks

features/create-conversation/

### Components

- create-conversation-modal.tsx

### API

- create-conversation.ts

---

## Flow

1 Search User

2 Select User

3 Create Conversation

4 Redirect To Chat

---

# Phase 8 — Group Conversation Feature

## Goal

Support group conversations.

Assignment requirement.

---

## Tasks

features/group-chat/

### Components

- create-group-modal.tsx

### API

- create-group.ts

---

## Flow

1 Enter group name

2 Search participants

3 Select multiple users

4 Create group

---

## States

Handle:

- Validation
- Loading
- Error

---

# Phase 9 — Message List Feature

## Goal

Display conversation history.

Most important part of assignment.

---

## Tasks

features/chat/

### API

- get-messages.ts

### Hooks

- use-messages.ts

### Components

- message-list.tsx
- message-item.tsx

---

## UI Requirements

Differentiate:

### Sent Message

Right aligned

### Received Message

Left aligned

Show:

- Sender
- Time
- Message

---

## States

Handle:

- Loading
- Empty
- Error

---

# Phase 10 — Send Message Feature

## Goal

Send messages.

---

## Tasks

### API

- send-message.ts

### Hook

- use-send-message.ts

### Components

- message-input.tsx

---

## Validation

Prevent:

- Empty message
- Whitespace only message

---

## UX

Support:

- Enter to send
- Sending state
- Disabled button

---

# Phase 11 — Real-Time Updates

## Goal

Messages appear automatically.

Assignment requirement.

---

## Strategy 1

If API provides realtime:

Use:

- WebSocket
- SSE

---

## Strategy 2

If API doesn't provide realtime

Use polling.

Example:

Refetch:

every 2–5 seconds

using React Query.

---

## Tasks

Create:

features/realtime/

- use-realtime-messages.ts

---

## Requirements

New messages must appear automatically.

No page refresh.

---

# Phase 12 — Smart Auto Scroll

## Goal

Required by assignment.

---

## Tasks

Create:

shared/hooks/

- use-auto-scroll.ts

---

## Logic

When:

User at bottom

→ Auto scroll

When:

User reading old messages

→ Don't force scroll

Show:

"New Messages"

button

(optional bonus)

---

# Phase 13 — Chat Layout

## Goal

Build complete chat UI.

---

## Desktop Layout

┌─────────────┬─────────────┐
│ Sidebar     │ Chat Panel  │
└─────────────┴─────────────┘

---

Sidebar:

- User info
- Search
- Conversation list

---

Chat Panel:

- Header
- Messages
- Input

---

## Mobile Layout

- Responsive drawer
- Full screen chat

---

# Phase 14 — Loading / Empty / Error States

Required by assignment.

---

Create reusable components.

shared/ui/

- loading-state.tsx
- empty-state.tsx
- error-state.tsx

Apply everywhere.

---

# Phase 15 — Bonus Features

Choose ONE strong bonus.

Avoid generic features.

Recommended:

### Option A

Unread Message Counter

---

### Option B

Typing Indicator

"John is typing..."

---

### Option C

New Messages Floating Indicator

Appears when user isn't at bottom.

---

### Option D

Draft Persistence

Restore unsent messages.

---

### Option E

Message Search

Inside conversation.

Best bonus choice.

---

# Phase 16 — Landing Page

Part 2

---

## Goal

Market the product like a real SaaS.

---

## Sections

### Hero

Product intro

CTA

---

### Product Preview

Screenshots

---

### Features

- Realtime Messaging
- Group Chats
- Smart Conversations

---

### Showcase

Explain user flows.

---

### Responsive CTA

Try Demo

---

### Footer

Links

---

## Design Direction

Avoid:

- Generic SaaS clone

Create:

- Unique branding
- Strong typography
- Motion effects
- Custom illustrations

---

# Phase 17 — Responsive Testing

Test:

- 320px
- 375px
- 768px
- 1024px
- 1440px

---

# Phase 18 — Performance

Optimize:

- Dynamic imports
- Image optimization
- Memoization
- Query caching

---

## Lighthouse Goals

Performance > 90

Accessibility > 90

Best Practices > 90

SEO > 90

---

# Phase 19 — Documentation

README.md

Include:

## Project Overview

## Tech Stack

## Architecture

## Folder Structure

## Setup

## Environment Variables

## API Documentation Link

## Live Demo Links

## Thought Process

---

# Phase 20 — Part 3 Write-Up

Cover:

### Architecture Decisions

Why:

- Next.js
- React Query
- Feature Architecture

---

### Design Decisions

Explain:

- Layout
- Colors
- UX

---

### AI Usage

Mention:

- Research
- Boilerplate
- Refactoring
- Documentation

Explain what was written manually.

---

### Improvements

Future roadmap.

---

### API Issues

Document:

- Bugs
- Inconsistencies
- Workarounds

---

# Phase 21 — Deployment

Deploy:

## Chat App

Vercel

---

## Landing Page

Vercel

(or separate route)

---

Verify:

- Login works
- Search works
- Conversation works
- Groups work
- Messages work
- Realtime works
- Responsive works

---

# Final Submission Checklist

- [ ] API documentation completed
- [ ] Login completed
- [ ] User search completed
- [ ] Create conversation completed
- [ ] Group conversation completed
- [ ] Message list completed
- [ ] Send message completed
- [ ] Realtime updates completed
- [ ] Smart auto-scroll completed
- [ ] Loading states completed
- [ ] Empty states completed
- [ ] Error states completed
- [ ] Bonus feature completed
- [ ] Landing page completed
- [ ] Mobile responsive completed
- [ ] README completed
- [ ] Thought process completed
- [ ] GitHub repository ready
- [ ] Chat demo deployed
- [ ] Landing page deployed
- [ ] Submission ready
