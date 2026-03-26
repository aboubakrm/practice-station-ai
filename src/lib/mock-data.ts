export interface Case {
  id: string;
  title: string;
  category: "communication" | "consultation";
  difficulty: number;
  duration_minutes: number;
  scenario_brief: string;
  rubric_points: string[];
}

export interface Session {
  id: string;
  user_id: string;
  case_id: string;
  case_title: string;
  case_category: string;
  status: "in_progress" | "completed" | "abandoned";
  duration_seconds: number;
  transcript: string | null;
  started_at: string;
  completed_at: string | null;
}

export interface FeedbackReport {
  id: string;
  session_id: string;
  overall_summary: string;
  strengths: string[];
  improvements: string[];
  missed_opportunities: string[];
  structure_rating: string;
  empathy_rating: string;
  clarity_rating: string;
  safety_netting_rating: string;
  better_phrasing: string;
  action_item: string;
  thumbs_up: boolean | null;
}

export const mockCases: Case[] = [
  {
    id: "case-1",
    title: "Explaining a New Diagnosis",
    category: "communication",
    difficulty: 1,
    duration_minutes: 5,
    scenario_brief:
      "You are a medical registrar in the outpatient clinic. Mrs. Patel, a 52-year-old schoolteacher, has been referred following blood tests that confirm a diagnosis of type 2 diabetes. She is anxious and has been reading conflicting information online. You must explain the diagnosis, address her concerns, and outline an initial management plan.",
    rubric_points: [
      "Establishes rapport and sets agenda",
      "Explains diagnosis in plain language",
      "Explores patient's understanding and concerns",
      "Discusses lifestyle modifications",
      "Outlines medication options",
      "Safety-nets and arranges follow-up",
    ],
  },
  {
    id: "case-2",
    title: "Breaking Bad News",
    category: "communication",
    difficulty: 3,
    duration_minutes: 5,
    scenario_brief:
      "You are a medical registrar on the oncology ward. Mr. Thompson's wife, Sandra, has come to discuss the results of her husband's recent biopsy. The results show a stage 3 pancreatic adenocarcinoma. Mr. Thompson is currently resting and has asked you to speak with his wife first. You must break this news sensitively and address her questions.",
    rubric_points: [
      "Uses a warning shot before delivering the news",
      "Delivers the news clearly but sensitively",
      "Allows time for emotional response",
      "Explores understanding and concerns",
      "Discusses next steps without overwhelming",
      "Offers support resources",
    ],
  },
  {
    id: "case-3",
    title: "Consent for a Procedure",
    category: "communication",
    difficulty: 2,
    duration_minutes: 5,
    scenario_brief:
      "You are a surgical registrar. Mr. Davies, a 67-year-old retired builder, is scheduled for an elective laparoscopic cholecystectomy tomorrow. You need to obtain informed consent. He seems agreeable but has some questions about the risks and what happens if something goes wrong.",
    rubric_points: [
      "Confirms patient identity and procedure",
      "Explains the procedure in understandable terms",
      "Discusses benefits and common risks",
      "Addresses serious/rare complications",
      "Explores alternatives including no treatment",
      "Confirms understanding and voluntary consent",
    ],
  },
  {
    id: "case-4",
    title: "Chest Pain Consultation",
    category: "consultation",
    difficulty: 2,
    duration_minutes: 5,
    scenario_brief:
      "You are the medical registrar on call. Mr. Khan, a 58-year-old accountant, presents to the acute medical unit with a 2-hour history of central chest pain. Take a focused history, perform a relevant systems review, and explain your initial assessment and management plan to the patient.",
    rubric_points: [
      "Takes a structured chest pain history (SOCRATES)",
      "Explores cardiovascular risk factors",
      "Asks about relevant red flags",
      "Performs appropriate systems review",
      "Explains likely differential diagnoses",
      "Outlines initial investigations and management",
    ],
  },
];

export const mockSessions: Session[] = [
  {
    id: "session-1",
    user_id: "user-1",
    case_id: "case-1",
    case_title: "Explaining a New Diagnosis",
    case_category: "communication",
    status: "completed",
    duration_seconds: 287,
    transcript: "Sample transcript of the consultation...",
    started_at: "2026-03-24T14:30:00Z",
    completed_at: "2026-03-24T14:34:47Z",
  },
  {
    id: "session-2",
    user_id: "user-1",
    case_id: "case-2",
    case_title: "Breaking Bad News",
    case_category: "communication",
    status: "completed",
    duration_seconds: 300,
    transcript: "Sample transcript of the consultation...",
    started_at: "2026-03-23T10:15:00Z",
    completed_at: "2026-03-23T10:20:00Z",
  },
];

export const mockFeedback: Record<string, FeedbackReport> = {
  "session-1": {
    id: "fb-1",
    session_id: "session-1",
    overall_summary:
      "You demonstrated a generally good approach to explaining a new diagnosis of type 2 diabetes. Your opening was warm and you established rapport effectively. You used mostly plain language, though there were a few medical terms that could have been simplified further. The patient's concerns were partially addressed, but you could have explored her specific worries about online information more directly.",
    strengths: [
      "Warm, professional greeting that put the patient at ease",
      "Used the 'chunk and check' technique when explaining the diagnosis",
      "Good use of open-ended questions to explore understanding",
      "Discussed lifestyle modifications with practical examples",
    ],
    improvements: [
      "Could have asked about the patient's existing knowledge before launching into explanation",
      "Missed opportunity to explore the patient's specific fears and concerns early on",
      "Time management — spent too long on pathophysiology, not enough on management plan",
      "Could have summarised key points at the end of the consultation",
    ],
    missed_opportunities: [
      "Did not address the patient's online reading and potential misinformation",
      "Did not explicitly mention diabetes education services or support groups",
      "Forgot to arrange a follow-up appointment or safety-net advice",
    ],
    structure_rating: "Good",
    empathy_rating: "Excellent",
    clarity_rating: "Good",
    safety_netting_rating: "Needs Work",
    better_phrasing:
      'Instead of saying "Your blood sugar is too high and you have diabetes," try: "Your blood tests have shown that your sugar levels are higher than they should be. This tells us you have a condition called type 2 diabetes. I know that might sound worrying, so let me explain what that means for you."',
    action_item:
      "Focus on safety-netting in your next station. Before closing, always ask: 'What would you do if your symptoms got worse?' and ensure the patient has a clear follow-up plan.",
    thumbs_up: null,
  },
  "session-2": {
    id: "fb-2",
    session_id: "session-2",
    overall_summary:
      "This was a challenging station and you handled the emotional weight of breaking bad news with good sensitivity. You used a warning shot appropriately and allowed silence after delivering the news. However, you could have been more structured in your approach and ensured the patient's wife had space to ask her own questions.",
    strengths: [
      "Effective use of a warning shot before delivering the diagnosis",
      "Allowed appropriate silence for emotional processing",
      "Maintained a calm, compassionate tone throughout",
      "Offered practical next steps without being pushy",
    ],
    improvements: [
      "Could have checked what the wife already knew or suspected before delivering news",
      "Consider using the SPIKES framework more explicitly",
      "Avoid medical jargon — 'adenocarcinoma' was used without explanation",
      "Provide written information for the family to take away",
    ],
    missed_opportunities: [
      "Did not ask if the wife wanted anyone else present for support",
      "Missed discussing palliative care options sensitively",
      "Did not offer to speak with Mr. Thompson directly afterwards",
    ],
    structure_rating: "Good",
    empathy_rating: "Excellent",
    clarity_rating: "Needs Work",
    safety_netting_rating: "Good",
    better_phrasing:
      'Instead of "The biopsy shows adenocarcinoma of the pancreas," try: "I\'m afraid the test results have shown something serious. The biopsy has found a type of cancer in the pancreas. I\'m very sorry to have to tell you this."',
    action_item:
      "Before your next breaking bad news station, revise the SPIKES protocol. Focus especially on the 'Perception' step — always find out what the person already knows or suspects before delivering the news.",
    thumbs_up: null,
  },
};
