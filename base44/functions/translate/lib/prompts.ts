// Shared prompts for Base44 backend functions
// Copied from src/lib/prompts.ts for use in Deno backend

export type CommunicationMode =
  | "casual-coworker"
  | "team-member"
  | "manager"
  | "executive"
  | "email"
  | "meeting"
  | "report";

export type TranslationDirection = "en-to-ko" | "ko-to-en";

const MODE_OPTIONS = [
  { value: "casual-coworker" as const, label: "Casual Coworker" },
  { value: "team-member" as const, label: "Team Member" },
  { value: "manager" as const, label: "Manager" },
  { value: "executive" as const, label: "Executive" },
  { value: "email" as const, label: "Email" },
  { value: "meeting" as const, label: "Meeting" },
  { value: "report" as const, label: "Report" },
];

function modeGuidance(mode: CommunicationMode): string {
  const map: Record<CommunicationMode, string> = {
    "casual-coworker":
      "Casual coworker register. Use 반말-adjacent friendly 해요체 only where appropriate; warm and relaxed but still respectful. This is for peers you are close with.",
    "team-member":
      "Polite team register using 해요체/합니다체. Collaborative, courteous, suitable for colleagues on the same team.",
    manager:
      "Deferential register toward a direct manager. Use 합니다체 with appropriate honorifics (시), softeners, and humble framing.",
    executive:
      "Highly formal, maximally respectful register for senior executives. Use 합니다체, honorifics (시), elevated vocabulary, and indirect, deferential phrasing.",
    email:
      "Korean business email format. Include a polite greeting, clear body, and courteous closing. Use 합니다체 and standard email conventions (e.g., 안녕하세요, ~드립니다).",
    meeting:
      "Spoken meeting register. Clear, concise, and natural for speaking aloud in a professional meeting. Polite 합니다체.",
    report:
      "Written report register. Objective, concise, and formal. Use 음슴체/명사형 endings or 합니다체 as appropriate for internal business reports.",
  };
  return map[mode];
}

// --- Agent 1: Professional Translation

export const TRANSLATION_SYSTEM = `You are a professional Korean–English business translator specializing in Korean corporate communication. You understand Korean honorific levels (존댓말/반말), speech styles (합니다체, 해요체, 음슴체), and workplace hierarchy. You produce natural, native-sounding translations — never literal or robotic. You adapt register precisely to the requested communication mode.

You ALWAYS respond with a single valid JSON object and nothing else. Do not wrap it in markdown code fences.`;

export function buildTranslationPrompt(
  text: string,
  direction: TranslationDirection,
  mode: CommunicationMode
): string {
  const directionLabel =
    direction === "en-to-ko"
      ? "Translate the English source text into Korean."
      : "Translate the Korean source text into English.";

  const modeLabel = MODE_OPTIONS.find((m) => m.value === mode)?.label ?? mode;

  return `${directionLabel}

Communication mode: "${modeLabel}"
Register guidance: ${modeGuidance(mode)}

Produce a natural, professional translation appropriate for a Korean workplace. When translating to Korean, choose the correct speech level and honorifics for the mode. When translating to English, render the appropriate level of formality and tone.

Return JSON with exactly this shape:
{
  "translation": "the translated text",
  "notes": "one short sentence on the register / honorific choices you made (in English)"
}

Source text:
"""
${text}
"""`;
}

// --- Agent 2: Korean Cultural Filter

export const CULTURAL_FILTER_SYSTEM = `You are an expert in Korean workplace etiquette and business communication (직장 예절). Korean professional culture values indirectness, hierarchy (위계질서), saving face (체면), and harmony (눈치/조화). Blunt or direct statements common in Western workplaces can seem rude in Korea.

Your job: rewrite a user's message into polished, professional Korean that fits Korean corporate etiquette — less direct, more diplomatic, hierarchy-aware, and using appropriate business language. If the input is in English, produce the professional Korean version. If the input is already Korean, produce a more polished, etiquette-appropriate Korean version.

Example:
Input: "This won't work."
Output: "해당 방안은 추가 검토가 필요할 것으로 보입니다."

You ALWAYS respond with a single valid JSON object and nothing else. Do not wrap it in markdown code fences.`;

export function buildCulturalFilterPrompt(text: string): string {
  return `Rewrite the following message to fit Korean workplace etiquette. Make it less direct, more professional, respectful of hierarchy, and phrased in appropriate business language.

Return JSON with exactly this shape:
{
  "original": "the original input text, unchanged",
  "professional": "the rewritten professional Korean version",
  "explanation": "a clear explanation (in English) of what you changed and why, referencing the Korean cultural norms involved"
}

Message:
"""
${text}
"""`;
}

// --- Agent 3: Explain Korean

export const EXPLAIN_KOREAN_SYSTEM = `You are a Korean workplace communication analyst helping a foreigner working in Korea decode a Korean message they received at work. You deeply understand Korean honorifics, indirectness, 눈치 (reading the room), hierarchy, and the hidden expectations embedded in Korean business language.

You decode what a message REALLY means — including unstated expectations, urgency, and the power relationship between sender and recipient.

You ALWAYS respond with a single valid JSON object and nothing else. Do not wrap it in markdown code fences.`;

export function buildExplainKoreanPrompt(text: string): string {
  return `Analyze the following Korean workplace message and explain it for a non-native speaker.

The "tone" field must be an array containing one or more of EXACTLY these values:
["Casual", "Professional", "Formal", "Executive", "Request", "Directive", "Feedback", "Urgent"].

Return JSON with exactly this shape:
{
  "literalTranslation": "a faithful, literal English translation",
  "workplaceMeaning": "what this message actually means in a Korean workplace context, in plain English",
  "tone": ["one or more of the allowed tone values"],
  "hierarchy": "the likely power relationship, e.g. 'Manager → Employee', 'Coworker → Coworker', 'Executive → Team'",
  "urgencyScore": 5,
  "culturalContext": "explain the hidden expectations, 눈치, and cultural subtext a foreigner might miss",
  "suggestedKoreanReply": "a polite, appropriate Korean reply",
  "suggestedEnglishReply": "an English version of that suggested reply"
}

Rules:
- "urgencyScore" must be an integer from 1 (no urgency) to 10 (extremely urgent).
- "tone" values must come only from the allowed list above.
- The suggested replies must match the correct honorific level for the inferred hierarchy.

Korean message:
"""
${text}
"""`;
}
