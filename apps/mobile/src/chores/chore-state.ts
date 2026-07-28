import type { ChoreAssignment, ChoreStatus } from "@skill-spark/contracts";

export type ChoreSections = Record<ChoreStatus, ChoreAssignment[]>;

export function groupChores(assignments: ChoreAssignment[]): ChoreSections {
  return {
    assigned: assignments.filter((assignment) => assignment.status === "assigned"),
    submitted: assignments.filter(
      (assignment) => assignment.status === "submitted"
    ),
    approved: assignments.filter((assignment) => assignment.status === "approved"),
    rejected: assignments.filter((assignment) => assignment.status === "rejected"),
  };
}

export function canSubmitChore(assignment: ChoreAssignment) {
  return assignment.status === "assigned" || assignment.status === "rejected";
}

export function replaceChoreAssignment(
  assignments: ChoreAssignment[],
  nextAssignment: ChoreAssignment
) {
  return assignments.map((assignment) =>
    assignment.id === nextAssignment.id ? nextAssignment : assignment
  );
}

export function choreStatusLabel(status: ChoreStatus) {
  switch (status) {
    case "assigned":
      return "Ready to do";
    case "submitted":
      return "Waiting for grown-up";
    case "approved":
      return "Approved";
    case "rejected":
      return "Try again";
  }
}
