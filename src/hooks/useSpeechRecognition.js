import { useCallback, useEffect, useRef, useState } from "react";

// Thin, dependency-free wrapper around the Web Speech API (SpeechRecognition).
// Produces REAL on-device transcription from the microphone. Automatically
// restarts recognition because the API stops after short silences.
export function useSpeechRecognition({ lang = "en-IN", onFinal }) {
  const recRef = useRef(null);
  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;

  const supported =
    typeof window !== "undefined" &&
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState("");

  const stop = useCallback(() => {
    const rec = recRef.current;
    if (rec) {
      rec.__want = false;
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
    }
    setListening(false);
    setInterim("");
  }, []);

  const start = useCallback(() => {
    if (!supported) {
      setError("unsupported");
      return false;
    }

    // Tear down any previous instance first.
    if (recRef.current) {
      recRef.current.__want = false;
      try {
        recRef.current.stop();
      } catch {
        /* ignore */
      }
    }

    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = lang;

    rec.onresult = (event) => {
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = result[0].transcript.trim();

        if (result.isFinal) {
          if (text && onFinalRef.current) onFinalRef.current(text);
        } else {
          interimText += result[0].transcript;
        }
      }

      setInterim(interimText);
    };

    rec.onerror = (event) => {
      // "no-speech" / "aborted" are normal during continuous use.
      if (event.error && event.error !== "no-speech" && event.error !== "aborted") {
        setError(event.error);
      }
    };

    rec.onend = () => {
      // Keep listening until we explicitly stop.
      if (recRef.current && recRef.current.__want) {
        try {
          rec.start();
        } catch {
          /* ignore */
        }
      } else {
        setListening(false);
      }
    };

    rec.__want = true;
    recRef.current = rec;

    try {
      rec.start();
    } catch {
      setError("start-failed");
      return false;
    }

    setError("");
    setListening(true);
    return true;
  }, [lang, supported]);

  // Stop recognition on unmount.
  useEffect(
    () => () => {
      const rec = recRef.current;
      if (rec) {
        rec.__want = false;
        try {
          rec.stop();
        } catch {
          /* ignore */
        }
      }
    },
    []
  );

  return { supported, listening, interim, error, start, stop };
}