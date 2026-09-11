/**
 * LUMA Multilingual Lexicon & Language Detection (Phase 6)
 *
 * Supports English, Devanagari Hindi (हिन्दी), and Hinglish (Latin-script colloquial Hindi).
 */

import type { SupportedLanguage } from "./types";

export interface LexiconCategory {
  id: string;
  label: string;
  weight: number;
  english: string[];
  hindi: string[]; // Devanagari script
  hinglish: string[]; // Latin transliteration
}

export const MULTILINGUAL_LEXICON: Record<string, LexiconCategory> = {
  SAFETY_THREAT: {
    id: "SAFETY_THREAT",
    label: "Safety Threat & Intimidation",
    weight: 30,
    english: [
      "threat", "threatened", "scared", "terrified", "fear", "afraid",
      "follow", "following", "watching", "stalk", "stalking", "danger",
      "harm", "unsafe", "attack", "hurt", "kill", "protect", "weapon"
    ],
    hindi: [
      "डर", "खतरा", "धमकी", "पीछा", "हमला", "असुरक्षित", "नुकसान",
      "मारेगा", "जान का खतरा", "बचाओ", "घबराहट", "दहशत", "हथियार"
    ],
    hinglish: [
      "darr", "dar", "khatra", "dhamki", "picha", "peechha", "hamla",
      "asurakshit", "nuksan", "marega", "marne", "bachao", "ghabrahat",
      "dahshat", "jaan ka khatra", "dar lag raha hai", "peecha kar raha hai"
    ],
  },
  SEVERE_DISTRESS: {
    id: "SEVERE_DISTRESS",
    label: "Severe Emotional Distress & Overload",
    weight: 25,
    english: [
      "hopeless", "unbearable", "breaking down", "panic", "panic attack",
      "nightmare", "can't sleep", "cannot sleep", "insomnia", "giving up",
      "exhausted", "crying", "alone", "isolated", "shaking", "worthless", "suffering"
    ],
    hindi: [
      "परेशान", "अकेला", "रो रही", "रो रहा", "सहन नहीं", "नींद नहीं",
      "टूट गई", "टूट गया", "उम्मीद नहीं", "असहनीय", "बेबस", "लाचार", "तनाव"
    ],
    hinglish: [
      "pareshan", "akela", "akeli", "ro rahi", "ro raha", "sahan nahi",
      "neend nahi", "toot gayi", "toot gaya", "ummeed nahi", "asahania",
      "bebas", "laachar", "tanav", "himmat toot gayi", "bardasht nahi hota"
    ],
  },
  HOUSING_INSTABILITY: {
    id: "HOUSING_INSTABILITY",
    label: "Housing & Shelter Instability",
    weight: 20,
    english: [
      "shelter", "evict", "eviction", "homeless", "no place", "kicked out",
      "locked out", "nowhere to stay", "rent", "temporary spot", "landlord"
    ],
    hindi: [
      "घर से निकाला", "बेघर", "रहने की जगह नहीं", "किराया", "आश्रय",
      "घर से बाहर", "ठिकाना नहीं", "कहाँ जाऊं"
    ],
    hinglish: [
      "ghar se nikal diya", "beghar", "rahne ki jagah nahi", "kiraya",
      "shelter", "ghar se bahar", "thikana nahi", "kahan jaun", "kahan jau"
    ],
  },
  LEGAL_STRESS: {
    id: "LEGAL_STRESS",
    label: "Legal Proceedings & Case Stress",
    weight: 15,
    english: [
      "court", "police", "lawyer", "trial", "hearing", "judge",
      "testify", "cross-examination", "affidavit", "charges", "bail", "fir"
    ],
    hindi: [
      "थाना", "अदालत", "वकील", "मुकदमा", "गवाही", "सुनवाई", "जज",
      "एफआईआर", "जमानत", "बयान", "इंसाफ"
    ],
    hinglish: [
      "thana", "adalat", "vakeel", "vakil", "mukadma", "gavahi", "gavah",
      "sunwai", "judge", "fir", "zamanat", "bayan", "insaf", "tareekh"
    ],
  },
  POSITIVE_PROTECTIVE: {
    id: "POSITIVE_PROTECTIVE",
    label: "Positive Protective Indicators",
    weight: -15,
    english: [
      "relieved", "better", "safe", "calm", "peaceful", "progress",
      "supported", "hopeful", "recovering", "good", "fine", "helpful"
    ],
    hindi: [
      "राहत", "बेहतर", "सुरक्षित", "शांत", "मदद मिली", "उम्मीद",
      "सहारा", "अच्छा", "शांति"
    ],
    hinglish: [
      "rahat", "behtar", "surakshit", "shant", "madad mili", "ummeed",
      "sahara", "achha", "achhi", "shanti", "thoda theek hai"
    ],
  },
};

const HINGLISH_MARKERS = [
  "hai", "hoon", "hun", "raha", "rahi", "meri", "mera", "mere", "bahut",
  "bahot", "kuch", "kuchh", "kya", "kyun", "nahi", "nahin", "mujhe",
  "humein", "unhone", "unhone", "kar", "gaya", "gayi", "aur", "toh",
  "lekin", "magar", "bhi", "tha", "thi", "the"
];

const DEVANAGARI_REGEX = /[\u0900-\u097F]/;

/**
 * Detect language of check-in text (English, Hindi Devanagari, or Hinglish)
 */
export function detectLanguage(text: string): {
  language: SupportedLanguage;
  label: string;
  confidence: number;
} {
  if (!text || text.trim().length === 0) {
    return { language: "en", label: "English", confidence: 100 };
  }

  // 1. Check for Devanagari script
  const devanagariMatches = text.match(/[\u0900-\u097F]/g) || [];
  const devanagariRatio = devanagariMatches.length / text.length;
  if (devanagariRatio > 0.15 || DEVANAGARI_REGEX.test(text)) {
    return {
      language: "hi",
      label: "Hindi (हिन्दी)",
      confidence: Math.min(98, Math.round(70 + devanagariRatio * 30)),
    };
  }

  // 2. Check for Hinglish markers in Latin text
  const tokens = text.toLowerCase().split(/\s+/);
  const matchedHinglishCount = tokens.filter((t) =>
    HINGLISH_MARKERS.includes(t.replace(/[^a-z]/g, ""))
  ).length;

  const hinglishRatio = tokens.length > 0 ? matchedHinglishCount / tokens.length : 0;
  if (matchedHinglishCount >= 2 || hinglishRatio > 0.1) {
    return {
      language: "hinglish",
      label: "Hinglish (Colloquial Hindi)",
      confidence: Math.min(95, Math.round(65 + hinglishRatio * 35)),
    };
  }

  return { language: "en", label: "English", confidence: 90 };
}
