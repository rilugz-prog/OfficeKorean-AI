// ---------------------------------------------------------------------------
// Shared application types for OfficeKorean AI
// ---------------------------------------------------------------------------

// --- Feature 1: Professional Translation -----------------------------------

export type TranslationDirection = "en-to-ko" | "ko-to-en";

export type CommunicationMode =
  | "casual-coworker"
  | "team-member"
  | "manager"
  | "executive"
  | "email"
  | "meeting"
  | "report";

export interface TranslateRequest {
  text: string;
  direction: TranslationDirection;
  mode: CommunicationMode;
}

export interface TranslateResponse {
  translation: string;
  /** Short note on the register / honorific choices made. */
  notes?: string;
}

// --- Feature 2: Korean Cultural Filter -------------------------------------

export interface CulturalFilterRequest {
  text: string;
}

export interface CulturalFilterResponse {
  original: string;
  professional: string;
  explanation: string;
}

// --- Feature 3: Explain Korean ---------------------------------------------

export type KoreanTone =
  | "Casual"
  | "Professional"
  | "Formal"
  | "Executive"
  | "Request"
  | "Directive"
  | "Feedback"
  | "Urgent";

export interface ExplainKoreanRequest {
  text: string;
}

export interface ExplainKoreanResponse {
  literalTranslation: string;
  workplaceMeaning: string;
  tone: KoreanTone[];
  hierarchy: string;
  urgencyScore: number; // 1–10
  culturalContext: string;
  suggestedKoreanReply: string;
  suggestedEnglishReply: string;
}

// --- Feature 4: Workplace Template Generator -------------------------------

export interface TemplateGenerateResponse {
  korean: string;
  english: string;
  explanation: string;
}

// --- API error shape -------------------------------------------------------

export interface ApiError {
  error: string;
}

/** Structured error envelope returned by Phase 2 (account-aware) endpoints. */
export interface StructuredApiError {
  success: false;
  code: string;
  message: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// UI option metadata (labels for selects)
// ---------------------------------------------------------------------------

export const DIRECTION_OPTIONS: {
  value: TranslationDirection;
  label: string;
}[] = [
  { value: "en-to-ko", label: "English → Korean" },
  { value: "ko-to-en", label: "Korean → English" },
];

export const MODE_OPTIONS: {
  value: CommunicationMode;
  label: string;
  description: string;
}[] = [
  {
    value: "casual-coworker",
    label: "Casual Coworker",
    description: "Friendly, relaxed tone for peers you know well",
  },
  {
    value: "team-member",
    label: "Team Member",
    description: "Polite, collaborative tone for your team",
  },
  {
    value: "manager",
    label: "Manager",
    description: "Respectful, deferential tone for your direct manager",
  },
  {
    value: "executive",
    label: "Executive",
    description: "Highly formal, honorific tone for senior leadership",
  },
  {
    value: "email",
    label: "Email",
    description: "Structured business email format",
  },
  {
    value: "meeting",
    label: "Meeting",
    description: "Clear, spoken phrasing for meetings",
  },
  {
    value: "report",
    label: "Report",
    description: "Concise, objective written report style",
  },
];
