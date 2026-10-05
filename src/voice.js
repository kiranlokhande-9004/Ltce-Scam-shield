// ---------------------------------------------------------------------------
// voice.js — local voice explanation using the browser Web Speech API.
// No Kimi / server dependency. Builds a short spoken explanation from the
// existing analysis data and speaks it in the selected language.
// ---------------------------------------------------------------------------

import { translate, riskLabel, speechLang } from "./i18n";

export function speechSupported() {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof window.SpeechSynthesisUtterance !== "undefined"
  );
}

// Decide whether a translated value is meaningful (not a "not identified").
function usable(value) {
  if (!value) return false;
  return !/not identified|not applicable|पहचान नहीं|लागू नहीं|ओळख पटली नाही|लागू नाही/i.test(
    String(value)
  );
}

// Build a short, spoken explanation of the analysis.
export function buildExplanation(analysis, lang) {
  if (!analysis) return "";

  const risk = riskLabel(lang, analysis.riskLevel);

  const orgInfo = analysis.organizationVerification || {};
  const orgName =
    orgInfo.name ||
    (usable(analysis.organization) ? analysis.organization : "") ||
    translate(lang, "voiceUnknownOrg");

  const reason =
    (analysis.reasons && analysis.reasons[0]) ||
    (analysis.suspiciousPhrases && analysis.suspiciousPhrases[0]) ||
    "";

  const action = usable(analysis.requestedAction)
    ? analysis.requestedAction
    : "";

  const parts = [translate(lang, "voiceLead", { risk, org: orgName })];

  if (reason) parts.push(translate(lang, "voiceReason", { reason }));
  if (action) parts.push(translate(lang, "voiceAsk", { action }));

  parts.push(translate(lang, "voiceSafe"));

  if (orgInfo.officialWebsite) {
    parts.push(
      translate(lang, "voiceVerifyWebsite", {
        website: orgInfo.officialWebsite,
      })
    );
  } else {
    parts.push(translate(lang, "voiceVerifyManual"));
  }

  parts.push(translate(lang, "voiceHelp"));

  return parts.join(" ");
}

// Speak text in the given language. Returns false when unsupported.
export function speak(text, lang, handlers = {}) {
  if (!speechSupported() || !text) {
    if (handlers.onError) handlers.onError();
    return false;
  }

  try {
    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLang(lang);
    utterance.rate = 0.98;
    utterance.pitch = 1;

    const voices = synth.getVoices ? synth.getVoices() : [];
    const target = speechLang(lang).toLowerCase();
    const voice =
      voices.find((v) => (v.lang || "").toLowerCase() === target) ||
      voices.find((v) =>
        (v.lang || "").toLowerCase().startsWith(target.slice(0, 2))
      );

    if (voice) utterance.voice = voice;

    if (handlers.onStart) utterance.onstart = handlers.onStart;
    if (handlers.onEnd) utterance.onend = handlers.onEnd;
    if (handlers.onError) utterance.onerror = handlers.onError;

    synth.speak(utterance);
    return true;
  } catch {
    if (handlers.onError) handlers.onError();
    return false;
  }
}

// Stop any in-progress speech.
export function stopSpeaking() {
  if (!speechSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
}