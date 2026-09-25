# Intelligent Timetable Generator

An AI-engineered Constraint Satisfaction Problem (CSP) solver and interactive web application built for automated college schedule generation.

## 🚀 Overview
This application addresses **Assignment 3: Intelligent Timetable Generator** for the Edumerge Walk-in Product Engineering Recruitment Drive. It uses a deterministic backtracking algorithm with forward-checking to generate complete, conflict-free weekly timetables across multiple divisions, faculty members, subject constraints, and specialized classroom types[cite: 1].

---

## 📸 Application Preview

![Timetable Matrix Preview](./Intelligent%20Timetable%20Generator/screenshot/Timetable.png)

---

## 📂 Assessment Deliverables & Codebase

All primary deliverables required for evaluation are structured as follows:

- **[`APPROACH.md`](./Intelligent%20Timetable%20Generator/APPROACH.md)**: Comprehensive architectural documentation covering CSP modeling, decision trees, pre-validation check design, and bottleneck diagnostic strategies[cite: 1].
- **[`AI_USAGE_REPORT.md`](./Intelligent%20Timetable%20Generator/AI_USAGE_REPORT.md)**: Mandatory assessment breakdown detailing AI assistant usage, prompt strategies, generated vs manually modified code, and edge-case resolutions[cite: 1].
- **[`src/lib/scheduler.ts`](./Intelligent%20Timetable%20Generator/src/lib/scheduler.ts)**: Core CSP scheduling engine implementation.
- **[`src/app/page.tsx`](./Intelligent%20Timetable%20Generator/src/app/page.tsx)**: Interactive Next.js single-page workspace with live constraint feedback and interactive matrix filters.

---

## ⚙️ Key Engine Features

1. **Deterministic Backtracking CSP Engine**:
   - Enforces **Hard Constraints**: Zero teacher double-booking, zero division overlap, zero room double-booking, and strict classroom-type matching (e.g., Labs strictly mapped to Lab rooms).
   - Enforces **Capacity & Limits**: Daily/weekly faculty workload limits and subject period distribution requirements.
2. **Upfront Pre-Validation Diagnostic Pass**:
   - Analyzes global supply vs. demand before running the solver[cite: 1].
   - Instantly detects impossible configurations (e.g., room capacity shortages or unassigned faculty) and emits human-readable diagnostic reports rather than failing silently[cite: 1].
3. **High Performance**:
   - Successfully schedules **54/54 required periods** across 3 divisions in **55 search nodes** (~53 ms execution time) with 0 constraint violations.

---

## 🛠️ Local Development & Quick Start

### Prerequisites
- Node.js (v18.x or later)
- npm / pnpm / yarn

### Steps to Run

```bash
# 1. Navigate into the application directory
cd "Intelligent Timetable Generator"

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev
