# Yoga Studio

A student management app for yoga instructors. Track students, plan classes, log sessions, and chat with an AI teaching assistant.

## Features

- **Student Management** — Add and edit student profiles with notes, health considerations, and contact info
- **Class Plans** — Build reusable class plans with ordered poses, durations, and notes. Drag-and-drop to reorder
- **Timeline** — Log classes and notes per student. Attached class plans display inline with their full pose list
- **AI Chat** — Per-student chat powered by Google Gemini, with full context of the student's history and your class plans
- **Settings** — Configure your Gemini API key from the UI

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Database:** SQLite via better-sqlite3 + Drizzle ORM
- **UI:** Tailwind CSS, Radix UI, shadcn/ui
- **AI:** Google Gemini 2.5 Flash
- **Drag & Drop:** dnd-kit

## Getting Started

```bash
npm install
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To enable AI chat, go to **Settings** and enter your [Google Gemini API key](https://aistudio.google.com/apikey). Without a key, chat returns a placeholder summary.

## Project Structure

```
src/
├── app/              # Pages and API routes
│   ├── api/          # REST endpoints (students, plans, timeline, chat, settings)
│   ├── plans/        # Class plans page
│   ├── settings/     # Settings page
│   └── students/     # Student detail page
├── components/       # React components
│   ├── chat/         # Chat panel and messages
│   ├── layout/       # Sidebar, page header
│   ├── plans/        # Plan builder with drag-and-drop
│   ├── students/     # Student list, cards, forms
│   ├── timeline/     # Timeline entries, add forms
│   └── ui/           # shadcn/ui primitives
├── db/               # Schema, migrations, DB instance
└── lib/              # Validators, AI providers, utilities
```
