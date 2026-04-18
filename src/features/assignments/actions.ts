export async function reassignAssignment(assignmentId: string) {
  // TODO: implement tiered reassignment logic for expired offers
  console.warn('reassignAssignment is not implemented yet for assignment', assignmentId);
}

export async function acceptAssignment(assignmentId: string) {
  // TODO: implement optimistic concurrency for assignment acceptance
  return { success: true };
}
