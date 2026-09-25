# AI Usage Report

## AI Tools Used

- GitHub Copilot in VS Code was used as the coding assistant.
- Local workspace tools were used to inspect files, scaffold the Next.js project, edit source files, and run validation commands.

## Key Prompts

- Build a production-ready Intelligent Timetable Generator for Assignment 3 using Next.js/React, TypeScript, Tailwind CSS, and a deterministic backtracking CSP algorithm.
- Include typed entities for divisions, faculty, classrooms/labs, subjects, and five-day/six-period scheduling.
- Add pre-validation diagnostics, hard conflict constraints, a weekly matrix UI, filtering, seed data controls, README, approach notes, and this report.

## Code Generated Versus Modified

### Generated

- `src/lib/scheduler.ts`: domain types, seed dataset, pre-validation, deterministic backtracking solver, result diagnostics.
- `src/app/page.module.css`: dashboard layout, responsive matrix styling, diagnostic banners, and visual system.
- `APPROACH.md`: product and engineering approach notes.
- This report template.

### Modified

- `src/app/page.tsx`: replaced the scaffold placeholder page with the working dashboard and solver integration.
- `README.md`: replaced generic scaffold instructions with project-specific documentation.

## Incorrect or Incomplete Outputs Identified

- The first scaffold attempt used the workspace folder name as the npm project name and failed because it contained uppercase letters and spaces. The project was generated in a lowercase temporary directory and moved to the workspace root.
- The first CSS module build failed because global element selectors were not scoped. The selectors were changed to use the local page shell.
- During review, the initial MRV candidate-count expression was found to derive day and period from a room accumulator instead of enumerating real slots. It was corrected to loop over all days, periods, and rooms.

## Root-Cause Identification

- npm naming failure: npm package-name restrictions were applied to the directory basename.
- CSS failure: Next.js CSS Modules require selectors to contain a local class or id.
- Solver issue: one accumulator was incorrectly reused as both a room count and a time-slot coordinate.

## Fixes Applied

- Generated with a URL-safe temporary project name while keeping the requested workspace path.
- Scoped CSS module reset selectors under `.shell`.
- Replaced the candidate count with explicit deterministic day/period/room enumeration.
- Added typed diagnostics and safe early return before backtracking.

## Verification

- VS Code TypeScript diagnostics reported no errors for `src/app/page.tsx` and `src/lib/scheduler.ts` after the solver correction.
- `npm run build` was run during implementation and initially surfaced the CSS Modules issue described above. A subsequent rerun was skipped by the environment action after the CSS fix; final validation should include `npm run lint` and `npm run build`.
