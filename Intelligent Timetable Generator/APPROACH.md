# Approach Note

## Product Assumptions

- The planning horizon is Monday to Friday with six periods per day.
- Each division studies every configured subject for its weekly target.
- A subject has one assigned faculty member and one room type requirement.
- Division size must fit the selected room. This is treated as a hard constraint because a schedule that cannot physically seat a class is not usable.
- Seed data is intentionally in memory for Assignment 3. A later production deployment can persist the same typed entities in a database.

## Architecture

The application is a Next.js App Router project with TypeScript and Tailwind CSS available for extension. The initial surface uses a CSS Module for the dense operations dashboard. `src/lib/scheduler.ts` owns the domain types, seed data, validation, and solver so it has no React dependency.

The current generation call runs in the browser because the seed problem is small and deterministic. The pure `generateSchedule` function can be placed behind a route handler or worker without changing its input/output contract when larger institutional data is introduced.

## Algorithm

1. Build one task for each division/subject weekly-period occurrence.
2. Run pre-validation before search:
   - Total periods versus division capacity.
   - Faculty weekly load versus max weekly periods.
   - Regular and lab room-period supply versus demand.
   - Room capacity for every division.
   - Missing faculty links, invalid subject lists, and non-positive targets.
3. Reject immediately when a hard preflight error exists.
4. During backtracking, use a deterministic minimum-remaining-values ordering. The next task is the one with the fewest legal day/period/room placements; ties use the stable task id.
5. Place in stable Monday-to-Friday, period 1-to-6, room order.
6. Track occupied division slots, faculty slots, room slots, daily faculty counts, and weekly faculty counts. Undo all state on backtrack.
7. Return a sorted schedule or a human-readable deadlock diagnostic.

## Hard Constraints

- A division has at most one subject in a period.
- A faculty member has at most one division in a period.
- A room has at most one division in a period.
- Lab subjects use lab rooms; regular subjects use regular rooms.
- Room capacity must meet division size.
- Faculty daily and weekly limits are enforced.

## Trade-offs

A deterministic backtracking CSP is easy to inspect and demonstrates the requested constraint-solving behavior. MRV reduces wasted branches while preserving predictable results. It is not intended for a large university-wide optimization problem; at that scale, a CP-SAT/ILP service, persistent scheduling jobs, and soft-constraint scoring would be appropriate.

The current solver optimizes feasibility, not preferences. It does not score lunch gaps, consecutive subjects, faculty preferences, or room proximity. Those can be added as a second optimization phase after a feasible assignment is found.

## Edge Cases

- Impossible aggregate capacity is rejected before recursive search.
- Faculty overload reports the exact number of periods over the configured weekly limit.
- No suitable room reports the division and required capacity.
- A valid preflight problem can still deadlock because of slot interactions; the solver returns the assigned count and a remediation-oriented message.
- Empty generated state is represented explicitly in the UI, while diagnostics remain visible after a failed run.

## Future Production Work

- Persist CRUD entities and generated schedules behind authenticated API routes.
- Add schema validation at the API boundary and optimistic editing in the setup panels.
- Add unit tests for each hard constraint and property tests for generated schedules.
- Add soft-constraint scoring and a solver timeout/cancellation boundary for larger datasets.
