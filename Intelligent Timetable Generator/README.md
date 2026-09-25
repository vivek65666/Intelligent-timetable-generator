# Intelligent Timetable Generator

Production-oriented college timetable workspace for Assignment 3. It combines a typed scheduling domain, deterministic backtracking CSP engine, pre-validation diagnostics, and an operations-focused weekly matrix UI.

## Features

- Seed data for divisions, faculty, rooms/labs, and subjects.
- Hard constraints for division, teacher, room, lab type, and room capacity conflicts.
- Faculty daily and weekly period limits.
- Pre-validation for aggregate division capacity, faculty overload, room-type capacity, room capacity, and invalid assignments.
- Deterministic MRV-ordered backtracking solver with deadlock diagnostics.
- Weekly matrix filtering by division, faculty, or room.
- Responsive dashboard UI with diagnostic banners and schedule metrics.

## Getting Started

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Validation

```bash
npm run lint
npm run build
```

The solver is implemented in `src/lib/scheduler.ts`. The primary product surface is `src/app/page.tsx` with styles in `src/app/page.module.css`.

## Project Notes

- The current UI uses in-memory seed data so the assignment can run without a database or authentication service.
- The scheduling engine is framework-independent and can be moved to a Next.js route handler or worker when persistence is added.
- See `APPROACH.md` for constraint decisions and edge-case handling.
- See `AI_USAGE_REPORT.md` for the required AI-use record template.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
