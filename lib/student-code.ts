/** Human-readable unique student identifier, e.g. STU-2026-0007 */
export function formatStudentCode(sequence: number, year = new Date().getFullYear()) {
  return `STU-${year}-${String(sequence).padStart(4, "0")}`;
}
