import { DEMO_SCANS } from "../dashboardData";

const KEY = "scamshield.scans.v1";

export function loadScans() {
  try {
    if (typeof window === "undefined") return DEMO_SCANS;
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEMO_SCANS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : DEMO_SCANS;
  } catch {
    return DEMO_SCANS;
  }
}

export function saveScans(scans) {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(KEY, JSON.stringify(scans));
    }
  } catch {
    // storage unavailable — in-memory only
  }
  return scans;
}

export function prependScan(scan, scans) {
  const next = [scan, ...scans.filter((item) => item.id !== scan.id)].slice(0, 40);
  return saveScans(next);
}

export function resetScans() {
  try {
    if (typeof window !== "undefined") window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
  return DEMO_SCANS;
}