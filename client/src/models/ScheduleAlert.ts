/**
 * Represents a warning when a group's scheduled hours
 * for the current week don't match its configured weekly hours.
 */
export interface ScheduleAlert {
  /** ID of the group with a mismatch */
  groupId: string;
  /** Display name of the group */
  groupName: string;
  /** Total hours currently scheduled this week */
  scheduled: number;
  /** Configured weekly hours for the group */
  expected: number;
}
