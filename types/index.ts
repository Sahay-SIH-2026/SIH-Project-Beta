/**
 * SAHAY — Core Type Contracts
 *
 * These are placeholder interfaces that define the shape of the domain model.
 * They are intentionally NOT connected to a database.
 * Replace / extend with Prisma-generated types in a future phase.
 *
 * @phase 1 — Skeleton
 */

// ─── Roles ────────────────────────────────────────────────────────────────────

export type UserRole = "VICTIM" | "COUNSELOR" | "ADMIN";

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  role: UserRole;
  displayName: string;
  /** ISO 8601 */
  createdAt: string;
  /** ISO 8601 */
  updatedAt: string;
  isActive: boolean;
}

// ─── Case ─────────────────────────────────────────────────────────────────────

export type CaseStatus =
  | "OPEN"
  | "ACTIVE"
  | "UNDER_REVIEW"
  | "CLOSED"
  | "REFERRED";

export interface Case {
  id: string;
  /** e.g. "V-1042" */
  caseRef: string;
  status: CaseStatus;
  /** User.id of the victim */
  victimId: string;
  /** User.id of the assigned counselor */
  counselorId: string | null;
  /** ISO 8601 */
  openedAt: string;
  /** ISO 8601 */
  updatedAt: string;
  notes: string | null;
}

// ─── Interaction ──────────────────────────────────────────────────────────────

export type InteractionChannel =
  | "VOICE_CALL"
  | "SMS"
  | "IN_APP_CHECK_IN"
  | "EMAIL"
  | "IN_PERSON";

export interface Interaction {
  id: string;
  caseId: string;
  channel: InteractionChannel;
  /** ISO 8601 */
  occurredAt: string;
  summary: string | null;
  /** User.id who recorded this interaction */
  recordedById: string;
}

// ─── Check-In ─────────────────────────────────────────────────────────────────

export interface CheckIn {
  id: string;
  caseId: string;
  victimId: string;
  /** Free-text response from the victim */
  responseText: string | null;
  /** ISO 8601 */
  submittedAt: string;
  /** Whether voice input was used */
  voiceInputUsed: boolean;
}

// ─── Consent ──────────────────────────────────────────────────────────────────

export type ConsentStatus = "GIVEN" | "WITHDRAWN" | "PENDING";

export interface Consent {
  id: string;
  victimId: string;
  purpose: string;
  status: ConsentStatus;
  /** ISO 8601 */
  grantedAt: string | null;
  /** ISO 8601 */
  withdrawnAt: string | null;
}

// ─── Alert ────────────────────────────────────────────────────────────────────

export type AlertStatus = "NEW" | "UNDER_REVIEW" | "REVIEWED";
export type AlertSeverity = "LOW" | "MEDIUM" | "HIGH";

export interface Alert {
  id: string;
  caseId: string;
  status: AlertStatus;
  severity: AlertSeverity;
  /**
   * Human-readable signal description.
   * Use: "Support review recommended"
   * Never: "AI diagnosis" / clinical language
   */
  signalDescription: string;
  /** ISO 8601 */
  raisedAt: string;
  /** ISO 8601 */
  reviewedAt: string | null;
  /** User.id of counselor who reviewed */
  reviewedById: string | null;
}

// ─── Risk Score ───────────────────────────────────────────────────────────────

/**
 * Illustrative support-prioritization signal.
 * This is NOT a clinical diagnosis. Human review is mandatory.
 */
export interface RiskScore {
  id: string;
  caseId: string;
  /** 0–100. Higher = higher priority for review. */
  score: number;
  /** ISO 8601 */
  computedAt: string;
  /**
   * Short human-readable reason for the signal.
   * Must not use clinical language.
   */
  signalReason: string;
  /** Whether a counselor has reviewed this signal */
  humanReviewed: boolean;
}

// ─── Audit Log ────────────────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  /** User.id who performed the action */
  actorId: string;
  actorRole: UserRole;
  action: string;
  /** e.g. "Case", "User", "Interaction" */
  resourceType: string;
  resourceId: string;
  /** ISO 8601 */
  timestamp: string;
  metadata: Record<string, unknown> | null;
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ApiHealthResponse {
  status: "ok" | "degraded" | "error";
  service: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
