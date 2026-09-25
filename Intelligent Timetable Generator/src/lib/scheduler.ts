export type RoomType = "regular" | "lab";

export type Division = {
  id: string;
  name: string;
  studentCount: number;
};

export type Faculty = {
  id: string;
  name: string;
  maxDailyPeriods: number;
  maxWeeklyPeriods: number;
  subjectIds: string[];
};

export type Room = {
  id: string;
  name: string;
  capacity: number;
  type: RoomType;
};

export type Subject = {
  id: string;
  name: string;
  weeklyPeriods: number;
  requiresLab: boolean;
  facultyId: string;
};

export type ScheduleEntry = {
  id: string;
  divisionId: string;
  subjectId: string;
  facultyId: string;
  roomId: string;
  day: number;
  period: number;
};

export type ScheduleProblem = {
  divisions: Division[];
  faculty: Faculty[];
  rooms: Room[];
  subjects: Subject[];
};

export type Diagnostic = {
  severity: "error" | "warning";
  message: string;
};

export type ScheduleResult = {
  success: boolean;
  entries: ScheduleEntry[];
  diagnostics: Diagnostic[];
  stats: {
    requiredPeriods: number;
    assignedPeriods: number;
    searchNodes: number;
    durationMs: number;
  };
};

type Task = {
  id: string;
  division: Division;
  subject: Subject;
  occurrence: number;
};

type SearchState = {
  entries: ScheduleEntry[];
  occupiedDivisions: Set<string>;
  occupiedFaculty: Set<string>;
  occupiedRooms: Set<string>;
  facultyDaily: Map<string, number>;
  facultyWeekly: Map<string, number>;
  remaining: Task[];
};

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;
export const PERIODS = [1, 2, 3, 4, 5, 6] as const;

const slotKey = (day: number, period: number) => `${day}-${period}`;

export function createSeedProblem(): ScheduleProblem {
  return {
    divisions: [
      { id: "cs-a", name: "CS-A", studentCount: 42 },
      { id: "cs-b", name: "CS-B", studentCount: 38 },
      { id: "it-a", name: "IT-A", studentCount: 35 },
    ],
    faculty: [
      {
        id: "f-aisha",
        name: "Prof. Aisha Khan",
        maxDailyPeriods: 4,
        maxWeeklyPeriods: 18,
        subjectIds: ["algorithms", "discrete"],
      },
      {
        id: "f-daniel",
        name: "Prof. Daniel Lee",
        maxDailyPeriods: 4,
        maxWeeklyPeriods: 18,
        subjectIds: ["databases", "operating-systems"],
      },
      {
        id: "f-mira",
        name: "Prof. Mira Shah",
        maxDailyPeriods: 4,
        maxWeeklyPeriods: 18,
        subjectIds: ["web-engineering"],
      },
      {
        id: "f-omar",
        name: "Prof. Omar Nair",
        maxDailyPeriods: 4,
        maxWeeklyPeriods: 18,
        subjectIds: ["networks"],
      },
    ],
    rooms: [
      { id: "room-101", name: "Main 101", capacity: 60, type: "regular" },
      { id: "room-204", name: "Seminar 204", capacity: 45, type: "regular" },
      { id: "lab-1", name: "Systems Lab 1", capacity: 45, type: "lab" },
      { id: "lab-2", name: "Networks Lab 2", capacity: 40, type: "lab" },
    ],
    subjects: [
      { id: "algorithms", name: "Algorithms", weeklyPeriods: 3, requiresLab: false, facultyId: "f-aisha" },
      { id: "databases", name: "Database Systems", weeklyPeriods: 3, requiresLab: false, facultyId: "f-daniel" },
      { id: "web-engineering", name: "Web Engineering", weeklyPeriods: 3, requiresLab: true, facultyId: "f-mira" },
      { id: "networks", name: "Computer Networks", weeklyPeriods: 3, requiresLab: true, facultyId: "f-omar" },
      { id: "discrete", name: "Discrete Mathematics", weeklyPeriods: 3, requiresLab: false, facultyId: "f-aisha" },
      { id: "operating-systems", name: "Operating Systems", weeklyPeriods: 3, requiresLab: true, facultyId: "f-daniel" },
    ],
  };
}

export function validateProblem(problem: ScheduleProblem): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const requiredPeriods = problem.divisions.length * problem.subjects.reduce((sum, subject) => sum + subject.weeklyPeriods, 0);
  const totalDivisionSlots = problem.divisions.length * DAYS.length * PERIODS.length;

  if (requiredPeriods > totalDivisionSlots) {
    diagnostics.push({
      severity: "error",
      message: `Divisions need ${requiredPeriods} periods, but only ${totalDivisionSlots} division slots exist. Reduce weekly targets or add scheduling days.`,
    });
  }

  const subjectById = new Map(problem.subjects.map((subject) => [subject.id, subject]));
  const facultyById = new Map(problem.faculty.map((member) => [member.id, member]));
  for (const member of problem.faculty) {
    const assignedPeriods = problem.divisions.length * member.subjectIds.reduce(
      (sum, subjectId) => sum + (subjectById.get(subjectId)?.weeklyPeriods ?? 0),
      0,
    );
    if (assignedPeriods > member.maxWeeklyPeriods) {
      diagnostics.push({
        severity: "error",
        message: `${member.name} is overbooked by ${assignedPeriods - member.maxWeeklyPeriods} periods (${assignedPeriods} required vs ${member.maxWeeklyPeriods} allowed weekly).`,
      });
    }
  }

  const labDemand = problem.divisions.length * problem.subjects.filter((subject) => subject.requiresLab).reduce((sum, subject) => sum + subject.weeklyPeriods, 0);
  const labCapacity = problem.rooms.filter((room) => room.type === "lab").length * DAYS.length * PERIODS.length;
  if (labDemand > labCapacity) {
    diagnostics.push({
      severity: "error",
      message: `Lab demand is ${labDemand} periods, but lab rooms provide only ${labCapacity} room-periods. Add ${Math.ceil((labDemand - labCapacity) / (DAYS.length * PERIODS.length))} lab room(s) or reduce lab targets.`,
    });
  }

  const regularDemand = requiredPeriods - labDemand;
  const regularCapacity = problem.rooms.filter((room) => room.type === "regular").length * DAYS.length * PERIODS.length;
  if (regularDemand > regularCapacity) {
    diagnostics.push({
      severity: "error",
      message: `Regular-room demand is ${regularDemand} periods, but regular rooms provide only ${regularCapacity} room-periods.`,
    });
  }

  for (const division of problem.divisions) {
    const suitableRooms = problem.rooms.filter((room) => room.capacity >= division.studentCount);
    if (suitableRooms.length === 0) {
      diagnostics.push({ severity: "error", message: `${division.name} has ${division.studentCount} students, but no classroom has enough capacity.` });
    }
  }

  for (const subject of problem.subjects) {
    const member = facultyById.get(subject.facultyId);
    if (!member) {
      diagnostics.push({ severity: "error", message: `${subject.name} has no valid faculty assignment.` });
    } else if (!member.subjectIds.includes(subject.id)) {
      diagnostics.push({ severity: "warning", message: `${member.name} teaches ${subject.name}, but the subject is missing from their assigned-subject list.` });
    }
    if (subject.weeklyPeriods < 1) {
      diagnostics.push({ severity: "error", message: `${subject.name} must have at least one weekly period.` });
    }
  }

  const warnings = problem.faculty.filter((member) => member.maxDailyPeriods < 2).map((member) => ({
    severity: "warning" as const,
    message: `${member.name} has a daily limit of ${member.maxDailyPeriods}; the schedule may be difficult to balance.`,
  }));
  return diagnostics.concat(warnings);
}

function makeTasks(problem: ScheduleProblem): Task[] {
  const subjects = [...problem.subjects].sort((a, b) => a.id.localeCompare(b.id));
  return problem.divisions.flatMap((division) => subjects.flatMap((subject) => Array.from({ length: subject.weeklyPeriods }, (_, occurrence) => ({
    id: `${division.id}-${subject.id}-${occurrence}`,
    division,
    subject,
    occurrence,
  }))));
}

export function generateSchedule(problem: ScheduleProblem): ScheduleResult {
  const startedAt = performance.now();
  const diagnostics = validateProblem(problem);
  const requiredPeriods = makeTasks(problem).length;
  if (diagnostics.some((diagnostic) => diagnostic.severity === "error")) {
    return {
      success: false,
      entries: [],
      diagnostics,
      stats: { requiredPeriods, assignedPeriods: 0, searchNodes: 0, durationMs: Math.round(performance.now() - startedAt) },
    };
  }

  const facultyById = new Map(problem.faculty.map((member) => [member.id, member]));
  const state: SearchState = {
    entries: [],
    occupiedDivisions: new Set(),
    occupiedFaculty: new Set(),
    occupiedRooms: new Set(),
    facultyDaily: new Map(),
    facultyWeekly: new Map(),
    remaining: makeTasks(problem),
  };
  let searchNodes = 0;

  const canPlace = (task: Task, day: number, period: number, room: Room) => {
    const faculty = facultyById.get(task.subject.facultyId);
    if (!faculty || room.capacity < task.division.studentCount) return false;
    if (task.subject.requiresLab && room.type !== "lab") return false;
    if (!task.subject.requiresLab && room.type !== "regular") return false;
    if (state.occupiedDivisions.has(`${task.division.id}:${slotKey(day, period)}`)) return false;
    if (state.occupiedFaculty.has(`${task.subject.facultyId}:${slotKey(day, period)}`)) return false;
    if (state.occupiedRooms.has(`${room.id}:${slotKey(day, period)}`)) return false;
    if ((state.facultyDaily.get(`${faculty.id}:${day}`) ?? 0) >= faculty.maxDailyPeriods) return false;
    if ((state.facultyWeekly.get(faculty.id) ?? 0) >= faculty.maxWeeklyPeriods) return false;
    return true;
  };

  const place = (task: Task, day: number, period: number, room: Room) => {
    const entry: ScheduleEntry = {
      id: task.id,
      divisionId: task.division.id,
      subjectId: task.subject.id,
      facultyId: task.subject.facultyId,
      roomId: room.id,
      day,
      period,
    };
    state.entries.push(entry);
    state.occupiedDivisions.add(`${task.division.id}:${slotKey(day, period)}`);
    state.occupiedFaculty.add(`${task.subject.facultyId}:${slotKey(day, period)}`);
    state.occupiedRooms.add(`${room.id}:${slotKey(day, period)}`);
    state.facultyDaily.set(`${task.subject.facultyId}:${day}`, (state.facultyDaily.get(`${task.subject.facultyId}:${day}`) ?? 0) + 1);
    state.facultyWeekly.set(task.subject.facultyId, (state.facultyWeekly.get(task.subject.facultyId) ?? 0) + 1);
  };

  const unplace = (task: Task, day: number, period: number, room: Room) => {
    state.entries.pop();
    state.occupiedDivisions.delete(`${task.division.id}:${slotKey(day, period)}`);
    state.occupiedFaculty.delete(`${task.subject.facultyId}:${slotKey(day, period)}`);
    state.occupiedRooms.delete(`${room.id}:${slotKey(day, period)}`);
    const dailyKey = `${task.subject.facultyId}:${day}`;
    const dailyCount = (state.facultyDaily.get(dailyKey) ?? 1) - 1;
    if (dailyCount === 0) state.facultyDaily.delete(dailyKey); else state.facultyDaily.set(dailyKey, dailyCount);
    const weeklyCount = (state.facultyWeekly.get(task.subject.facultyId) ?? 1) - 1;
    if (weeklyCount === 0) state.facultyWeekly.delete(task.subject.facultyId); else state.facultyWeekly.set(task.subject.facultyId, weeklyCount);
  };

  const search = (): boolean => {
    searchNodes += 1;
    if (state.remaining.length === 0) return true;
    const candidates = state.remaining.map((task) => {
      let count = 0;
      for (let day = 0; day < DAYS.length; day += 1) {
        for (const period of PERIODS) {
          for (const room of problem.rooms) {
            if (canPlace(task, day, period, room)) count += 1;
          }
        }
      }
      return { task, count };
    }).sort((left, right) => left.count - right.count || left.task.id.localeCompare(right.task.id));
    const selected = candidates[0];
    if (!selected || selected.count === 0) return false;

    const index = state.remaining.indexOf(selected.task);
    state.remaining.splice(index, 1);
    for (let day = 0; day < DAYS.length; day += 1) {
      for (const period of PERIODS) {
        for (const room of problem.rooms) {
          if (!canPlace(selected.task, day, period, room)) continue;
          place(selected.task, day, period, room);
          if (search()) return true;
          unplace(selected.task, day, period, room);
        }
      }
    }
    state.remaining.splice(index, 0, selected.task);
    return false;
  };

  const success = search();
  const finalDiagnostics = success ? diagnostics : diagnostics.concat({
    severity: "error",
    message: `Scheduling deadlock after ${state.entries.length} of ${requiredPeriods} periods. Check faculty daily limits, room types, or room capacity for the remaining subjects.`,
  });
  return {
    success,
    entries: success ? [...state.entries].sort((a, b) => a.day - b.day || a.period - b.period || a.divisionId.localeCompare(b.divisionId)) : [],
    diagnostics: finalDiagnostics,
    stats: { requiredPeriods, assignedPeriods: success ? state.entries.length : 0, searchNodes, durationMs: Math.round(performance.now() - startedAt) },
  };
}
