<div align="center">

# 💬 Realtime Chat — Next.js

A modern, open-source realtime chat platform built with **Next.js 16**, **Supabase**, and **Drizzle ORM**. Supports group rooms, direct messages, presence tracking, typing indicators, and full internationalization (English & Indonesian).

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-realtime-green?logo=supabase)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Local Setup](#-local-setup)
  - [1. Clone the repository](#1-clone-the-repository)
  - [2. Install dependencies](#2-install-dependencies)
  - [3. Configure environment variables](#3-configure-environment-variables)
  - [4. Set up Supabase](#4-set-up-supabase)
  - [5. Run database migrations](#5-run-database-migrations)
  - [6. Start the development server](#6-start-the-development-server)
- [Available Scripts](#-available-scripts)
- [Database Schema](#-database-schema)
- [Architecture Overview](#-architecture-overview)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
  - [Contributor Flow](#contributor-flow)
  - [Branch Naming Convention](#branch-naming-convention)
  - [Commit Message Convention](#commit-message-convention)
  - [Pull Request Guidelines](#pull-request-guidelines)
  - [Code Style](#code-style)
- [License](#-license)

---

## 🌐 Overview

**Realtime Chat** is a free, open-source team messaging platform that lets you create group rooms, exchange direct messages, and see live presence and typing activity — all in real time. It is built on the **Next.js App Router** and powered by **Supabase Realtime** for WebSocket-based subscriptions, **Drizzle ORM** for type-safe database access, and **shadcn/ui** for a polished, accessible UI.

The application is fully internationalized and ships with **English** and **Indonesian** locales out of the box. The routing is locale-prefixed (`/en/...` or `/id/...`) and the default locale is automatically resolved from the browser's `Accept-Language` header.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Authentication** | Sign up, sign in, password reset & update via Supabase Auth |
| 👥 **Group Rooms** | Create named rooms, invite members, chat in real time |
| 💬 **Direct Messages** | One-to-one DMs with delivery and read timestamps |
| 🟢 **User Presence** | Online / Idle / Offline status tracked with Supabase Presence channels |
| ⌨️ **Typing Indicators** | Live "user is typing…" broadcast via Supabase Broadcast channels |
| 🌍 **i18n** | Full English & Indonesian support with locale-aware routing |
| 🌙 **Dark Mode** | System-aware theme toggle powered by CSS variables |
| 📱 **Responsive UI** | Mobile-first design with collapsible sidebar |
| 🔍 **User Search** | Search users by username to start a DM |
| 🗂️ **Sidebar Navigation** | Quick access to all rooms and DM partners |
| ⚡ **SEO Ready** | `sitemap.ts`, `robots.ts`, Open Graph and Twitter meta tags |
| 🎨 **shadcn/ui** | Accessible component primitives (Radix UI) styled with Tailwind |

---

## 🛠️ Tech Stack

### Core

| Technology | Version | Purpose |
|---|---|---|
| [Next.js](https://nextjs.org) | 16.2.1 | React framework — App Router, Server Components, Server Actions |
| [React](https://react.dev) | 19 | UI library |
| [TypeScript](https://www.typescriptlang.org) | 5 | Type safety across the entire project |

### Backend & Database

| Technology | Version | Purpose |
|---|---|---|
| [Supabase](https://supabase.com) | 2.x | Auth, PostgreSQL database, Realtime WebSocket channels |
| [Drizzle ORM](https://orm.drizzle.team) | 0.45 | Type-safe SQL query builder and schema migrations |
| [postgres](https://github.com/porsager/postgres) | 3.x | PostgreSQL driver (connection pooling–compatible) |

### UI & Styling

| Technology | Version | Purpose |
|---|---|---|
| [Tailwind CSS](https://tailwindcss.com) | 4 | Utility-first CSS |
| [shadcn/ui](https://ui.shadcn.com) | 4.x | Accessible, composable component library (Radix UI + Tailwind) |
| [Lucide React](https://lucide.dev) | 0.577 | Icon library |
| [Framer Motion](https://www.framer.com/motion) | 12 | Animation primitives |

### Forms & Validation

| Technology | Version | Purpose |
|---|---|---|
| [React Hook Form](https://react-hook-form.com) | 7 | Performant form state management |
| [Zod](https://zod.dev) | 3 | Schema validation for forms and server actions |

### Tooling

| Technology | Purpose |
|---|---|
| [pnpm](https://pnpm.io) | Fast, disk-efficient package manager |
| [ESLint](https://eslint.org) | Linting (Next.js config) |
| [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview) | Database migration CLI |

---

## 📁 Project Structure

```
realtime-chat-nextjs/
├── app/
│   ├── [lang]/                     # Locale-prefixed routes (en / id)
│   │   ├── layout.tsx              # Root locale layout — fonts, metadata, TooltipProvider
│   │   ├── page.tsx                # Public landing page
│   │   ├── dictionaries/           # i18n JSON translation files
│   │   │   ├── en.json             # English translations
│   │   │   └── id.json             # Indonesian translations
│   │   ├── auth/                   # Authentication pages
│   │   │   ├── login/              # Login page
│   │   │   ├── signup/             # Sign-up page
│   │   │   ├── reset-password/     # Request password reset
│   │   │   ├── update-password/    # Set new password (from email link)
│   │   │   └── callback/           # Supabase OAuth/email callback handler
│   │   ├── chat/                   # Protected chat workspace
│   │   │   ├── layout.tsx          # Chat shell — sidebar with groups & DMs
│   │   │   ├── page.tsx            # Redirect to first group or empty state
│   │   │   ├── groups/[roomId]/    # Group room chat view
│   │   │   └── dms/[userId]/       # Direct message chat view
│   │   └── profile/                # User profile settings page
│   ├── actions/                    # Next.js Server Actions
│   │   ├── auth.ts                 # signUp, signIn, signOut, resetPassword
│   │   ├── groups.ts               # createRoom, joinRoom, leaveRoom
│   │   ├── direct-messages.ts      # sendDM, markAsRead
│   │   └── profile.ts              # updateProfile, updateAvatar
│   ├── api/                        # API Route Handlers
│   │   ├── realtime/               # Realtime helper endpoints
│   │   └── users/                  # User lookup endpoints
│   ├── favicon.ico
│   ├── globals.css                 # Global styles & CSS variables (Tailwind)
│   ├── robots.ts                   # SEO — robots.txt generation
│   └── sitemap.ts                  # SEO — sitemap.xml generation
│
├── components/
│   ├── ui/                         # shadcn/ui primitives (Button, Input, Dialog, …)
│   ├── auth/                       # Auth form components (LoginForm, SignupForm, …)
│   ├── chat/                       # Chat UI (MessageBubble, MessageInput, DmChatWindow, …)
│   ├── profile/                    # Profile editor components
│   ├── app-sidebar.tsx             # Main navigation sidebar
│   ├── nav-user.tsx                # User avatar + dropdown (profile, sign out)
│   └── theme-toggle.tsx            # Dark/light mode switch
│
├── db/
│   ├── index.ts                    # Drizzle client instantiation
│   ├── schema.ts                   # Full database schema (tables + relations + types)
│   └── queries/                    # Reusable typed query helpers
│       ├── rooms.ts
│       ├── direct-messages.ts
│       └── …
│
├── hooks/                          # Custom React hooks
│   ├── use-realtime-messages.ts    # Subscribe to room messages via Supabase Realtime
│   ├── use-realtime-dms.ts         # Subscribe to DMs via Supabase Realtime
│   ├── use-user-presence.ts        # Track online/idle/offline status
│   ├── use-typing-indicator.ts     # Broadcast & receive typing events
│   └── use-mobile.ts               # Responsive breakpoint detection
│
├── lib/
│   ├── auth.ts                     # Server-side auth helpers (getUser, requireAuth, requireGuest)
│   ├── i18n.ts                     # Locale definitions (locales, defaultLocale, ogLocales)
│   └── utils.ts                    # Shared utilities (cn, etc.)
│
├── types/                          # Global TypeScript types
│   ├── auth.ts
│   └── chat.ts
│
├── proxy.ts                        # Next.js middleware — locale detection & session refresh
├── drizzle.config.ts               # Drizzle Kit configuration
├── next.config.ts                  # Next.js configuration
├── components.json                 # shadcn/ui configuration
├── pnpm-workspace.yaml
└── tsconfig.json
```

---

## 🔧 Prerequisites

Make sure you have the following installed before starting:

- **Node.js** ≥ 20 — [nodejs.org](https://nodejs.org)
- **pnpm** ≥ 9 — `npm install -g pnpm`
- **Supabase account** — [supabase.com](https://supabase.com) (free tier is sufficient)
- **Git** — [git-scm.com](https://git-scm.com)

---

## 🚀 Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/derispewss/realtime-chat-nextjs.git
cd realtime-chat-nextjs
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root by copying the example below and filling in your values:

```bash
# ── Supabase ────────────────────────────────────────────────
# Found in: Supabase Dashboard → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-public-key>

# ── Database (Drizzle ORM) ───────────────────────────────────
# Found in: Supabase Dashboard → Project Settings → Database → Connection string
# Use the "Transaction" pooler URI (port 6543) for serverless/edge compatibility
DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres

# ── Application ─────────────────────────────────────────────
# Used for absolute URLs in Open Graph tags and sitemap
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **Security note:** Never commit `.env.local` or any file containing secrets to version control. It is already listed in `.gitignore`.

### 4. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com/dashboard).
2. In **Authentication → Providers**, make sure **Email** provider is enabled.
3. In **Authentication → URL Configuration**, add `http://localhost:3000` to the **Site URL** and add `http://localhost:3000/en/auth/callback` and `http://localhost:3000/id/auth/callback` to **Redirect URLs**.
4. Enable **Realtime** for the following tables in **Database → Replication**:
   - `messages`
   - `direct_messages`

### 5. Run database migrations

Drizzle Kit will generate and apply the SQL schema to your Supabase PostgreSQL database:

```bash
# Generate migration files from the schema
pnpm db:generate

# Apply migrations to the database
pnpm db:migrate
```

Alternatively, push the schema directly (useful during early development):

```bash
pnpm db:push
```

You can also inspect your database visually with Drizzle Studio:

```bash
pnpm db:studio
```

### 6. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app will automatically redirect to `/en` (or your preferred locale) and prompt you to sign in.

---

## 📜 Available Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start the Next.js development server with HMR |
| `pnpm build` | Create an optimized production build |
| `pnpm start` | Start the production server (requires a build first) |
| `pnpm lint` | Run ESLint across the project |
| `pnpm db:generate` | Generate Drizzle migration files from `db/schema.ts` |
| `pnpm db:migrate` | Apply pending migrations to the database |
| `pnpm db:push` | Push schema changes directly (no migration files) |
| `pnpm db:studio` | Open Drizzle Studio — a visual database browser |

---

## 🗄️ Database Schema

The schema lives in [`db/schema.ts`](./db/schema.ts) and is managed by Drizzle ORM.

```
profiles          — Registered user profiles
  └─ id           UUID (PK, from Supabase Auth)
  └─ username     TEXT (unique)
  └─ email        TEXT (unique)
  └─ avatar_url   TEXT (nullable)
  └─ created_at / updated_at

rooms             — Group chat rooms
  └─ id           UUID (PK)
  └─ name         TEXT
  └─ description  TEXT (nullable)
  └─ owner_id     → profiles.id

room_members      — Room membership join table
  └─ room_id      → rooms.id
  └─ user_id      → profiles.id
  └─ role         TEXT ('member' | 'admin')
  └─ joined_at

messages          — Group room messages
  └─ room_id      → rooms.id
  └─ sender_id    → profiles.id
  └─ content      TEXT
  └─ created_at

direct_messages   — One-to-one DMs
  └─ sender_id    → profiles.id
  └─ receiver_id  → profiles.id
  └─ content      TEXT
  └─ created_at / delivered_at / read_at
```

All tables are in the `public` schema of your Supabase PostgreSQL database.

---

## 🏗️ Architecture Overview

```
Browser
  │
  ├─ Server Components (Next.js App Router)
  │    ├─ Page/Layout data fetching with Drizzle ORM
  │    └─ Server Actions for mutations (auth, messages, rooms, profile)
  │
  ├─ Client Components
  │    ├─ useRealtimeMessages  ──► Supabase Realtime (postgres_changes)
  │    ├─ useRealtimeDMs       ──► Supabase Realtime (postgres_changes)
  │    ├─ useUserPresence      ──► Supabase Presence channel
  │    └─ useTypingIndicator   ──► Supabase Broadcast channel
  │
  └─ Middleware (proxy.ts)
       ├─ Locale detection from Accept-Language header
       └─ Supabase session refresh on every request
```

**Data flow for a new message:**

1. User types in `<MessageInput>` → `sendTypingEvent()` broadcasts to the `typing:{roomId}` channel.
2. User submits → Server Action inserts the row into `messages` via Drizzle.
3. Supabase Realtime detects the INSERT → broadcasts to all subscribers of the `room:{roomId}` channel.
4. All connected clients receive the event via `useRealtimeMessages` and update the UI without a page reload.

---

## ☁️ Deployment

### Deploy to Vercel (recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fderispewss%2Frealtime-chat-nextjs)

1. Click the button above or import the repository on [vercel.com/new](https://vercel.com/new).
2. Add the following **Environment Variables** in the Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SITE_URL` (your production URL, e.g. `https://your-app.vercel.app`)
3. Update **Supabase → Authentication → URL Configuration** to include your production domain in both **Site URL** and **Redirect URLs**.
4. Deploy — Vercel will run `pnpm build` and serve the app automatically.

### Other platforms

The app is a standard Next.js application and can be deployed anywhere that supports Node.js ≥ 20. Set the same four environment variables and run:

```bash
pnpm build
pnpm start
```

---

## 🤝 Contributing

Contributions are warmly welcome! Whether it's a bug fix, a new feature, improved documentation, or a translation — every contribution matters.

### Contributor Flow

```
1. Fork → 2. Clone → 3. Branch → 4. Code → 5. Test → 6. Commit → 7. Push → 8. Pull Request
```

#### Step-by-step guide

**1. Fork the repository**

Click the **Fork** button at the top-right of this page to create your own copy.

**2. Clone your fork**

```bash
git clone https://github.com/<your-username>/realtime-chat-nextjs.git
cd realtime-chat-nextjs
```

**3. Add the upstream remote**

```bash
git remote add upstream https://github.com/derispewss/realtime-chat-nextjs.git
```

**4. Create a feature branch**

Always branch off `main` and follow the [naming convention](#branch-naming-convention) below:

```bash
git checkout main
git pull upstream main
git checkout -b feat/your-feature-name
```

**5. Set up the project locally**

Follow the [Local Setup](#-local-setup) steps above to get the development environment running.

**6. Make your changes**

- Write clean, readable TypeScript.
- Follow the existing file and component structure.
- Add or update translations in both `en.json` and `id.json` when you add user-visible text.
- Keep components small and focused on a single responsibility.

**7. Lint your code**

```bash
pnpm lint
```

Fix any ESLint warnings or errors before opening a PR.

**8. Commit your changes**

Follow the [commit message convention](#commit-message-convention) below:

```bash
git add .
git commit -m "feat: add emoji reactions to messages"
```

**9. Sync with upstream (recommended before pushing)**

```bash
git fetch upstream
git rebase upstream/main
```

**10. Push and open a Pull Request**

```bash
git push origin feat/your-feature-name
```

Then open a Pull Request from your fork to `derispewss/realtime-chat-nextjs:main` on GitHub. Fill in the PR template, describe what you changed and why, and link any relevant issues.

---

### Branch Naming Convention

| Type | Pattern | Example |
|---|---|---|
| New feature | `feat/<short-description>` | `feat/emoji-reactions` |
| Bug fix | `fix/<short-description>` | `fix/dm-read-timestamp` |
| Documentation | `docs/<short-description>` | `docs/update-readme` |
| Refactor | `refactor/<short-description>` | `refactor/presence-hook` |
| Style / UI | `style/<short-description>` | `style/sidebar-spacing` |
| Chore | `chore/<short-description>` | `chore/upgrade-drizzle` |
| i18n / translations | `i18n/<short-description>` | `i18n/add-arabic-locale` |

---

### Commit Message Convention

This project follows the [Conventional Commits](https://www.conventionalcommits.org) specification:

```
<type>(<optional scope>): <short summary>

[optional body]

[optional footer]
```

**Types:**

| Type | When to use |
|---|---|
| `feat` | Introducing a new feature |
| `fix` | Bug fix |
| `docs` | Documentation only changes |
| `style` | Code style / formatting (no logic change) |
| `refactor` | Code restructuring with no feature or bug change |
| `perf` | Performance improvement |
| `chore` | Build process, dependency updates, tooling |
| `i18n` | Translation or locale changes |
| `revert` | Reverting a previous commit |

**Examples:**

```
feat(chat): add emoji picker to message input
fix(auth): redirect to correct locale after password reset
docs: update local setup instructions in README
chore(deps): upgrade drizzle-orm to 0.46
i18n: add missing keys to Indonesian locale
```

---

### Pull Request Guidelines

- **One PR per feature/fix** — keep PRs small and focused for easier review.
- **Fill in the PR description** — explain what changed and why, and reference any related issues (`Closes #42`).
- **All checks must pass** — ESLint must report no errors before merge.
- **No breaking changes without discussion** — open an issue first if your change affects existing behavior.
- **Translations required** — if you add user-facing text, update both `en.json` and `id.json`.
- **Respect the code style** — follow existing patterns; do not introduce new dependencies without justification.

---

### Code Style

- **TypeScript** — prefer explicit types over `any`; use the inferred schema types exported from `db/schema.ts` (e.g. `IProfile`, `IMessage`).
- **Components** — use `"use client"` only when the component requires browser APIs or React hooks; prefer Server Components by default.
- **Server Actions** — mutations go in `app/actions/`. Validate inputs with Zod before writing to the database.
- **Hooks** — custom hooks live in `hooks/`. Keep each hook focused on one concern.
- **Queries** — reusable database queries go in `db/queries/`. Use Drizzle's typed query builder; avoid raw SQL strings.
- **Styling** — use Tailwind utility classes; avoid inline styles except for dynamic CSS variables. Use `cn()` from `lib/utils.ts` for conditional class merging.
- **i18n** — all user-visible strings must come from the dictionary via `t("key")`. Never hard-code English text in JSX.

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

```
MIT License — Copyright (c) 2026 àsyah
```

You are free to use, modify, and distribute this project for any purpose, including commercially, as long as the original copyright notice is included.
