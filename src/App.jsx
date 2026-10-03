import { useEffect, useRef, useState } from "react";

// Risk level -> display metadata (label + colour class).
const RISK_META = {
  HIGH: { label: "High Risk", className: "risk-high", icon: "🚨" },
  MEDIUM: { label: "Medium Risk", className: "risk-medium", icon: "⚠️" },
  LOW: { label: "Low Risk", className: "risk-low", icon: "🟢" },
  SAFE: { label: "Looks Safe", className: "risk-safe", icon: "✅" },
};

function riskMeta(level) {
  return (
    RISK_META[String(level || "").toUpperCase()] || {
      label: level || "Unknown",
      className: "risk-medium",
      icon: "❔",
    }
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-value">{value || "Not identified"}</span>
    </div>
  );
}

function BulletList({ items, emptyText }) {
  if (!items || items.length === 0) {
    return <p className="muted">{emptyText}</p>;
  }

  return (
    <ul className="bullet-list">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  // Revoke the object URL when the preview changes or the app unmounts.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleFile(e) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (preview) URL.revokeObjectURL(preview);

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult(null);
    setError("");
  }

  function reset() {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview("");
    setResult(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  async function analyze() {
    if (!file || loading) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const form = new FormData();
      form.append("image", file);

      // Use the relative /api path so it works through the Vite proxy in dev
      // and the same-origin server in production.
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: form,
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error(
          `Server returned an unreadable response (HTTP ${response.status}).`
        );
      }

      if (!response.ok || data.success === false) {
        throw new Error(data.error || `Analysis failed (HTTP ${response.status}).`);
      }

      const analysis = data.analysis ?? data;

      if (!analysis || !analysis.riskLevel) {
        throw new Error("Analysis response was missing expected fields.");
      }

      setResult(analysis);
    } catch (err) {
      setError(err.message || "Something went wrong during analysis.");
    } finally {
      setLoading(false);
    }
  }

  const meta = result ? riskMeta(result.riskLevel) : null;

  return (
    <main className="app">
      <header className="hero">
        <div className="hero-badge">🛡️</div>
        <h1>ScamShield</h1>
        <p>Verify before you click, pay or share.</p>
      </header>

      <section className="card upload-card">
        <label className="dropzone" htmlFor="file-input">
          <input
            id="file-input"
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFile}
          />
          <span className="dropzone-icon">📤</span>
          <span className="dropzone-title">
            {file ? file.name : "Upload a suspicious screenshot"}
          </span>
          <span className="dropzone-hint">
            PNG, JPG or WEBP · up to 15&nbsp;MB
          </span>
        </label>

        {preview && (
          <div className="preview-wrap">
            <img className="preview" src={preview} alt="Uploaded screenshot" />
          </div>
        )}

        <div className="actions">
          <button
            className="btn-primary"
            onClick={analyze}
            disabled={!file || loading}
          >
            {loading ? (
              <>
                <span className="spinner" />
                Analyzing…
              </>
            ) : (
              "Analyze Screenshot"
            )}
          </button>

          {(file || result) && !loading && (
            <button className="btn-ghost" onClick={reset}>
              Clear
            </button>
          )}
        </div>

        {error && (
          <div className="error" role="alert">
            <strong>⚠️ {error}</strong>
          </div>
        )}
      </section>

      {result && (
        <section className="results">
          <div className={`card risk-card ${meta.className}`}>
            <div className="risk-icon">{meta.icon}</div>
            <div>
              <span className="risk-label">Verdict</span>
              <h2 className="risk-title">{meta.label}</h2>
            </div>
          </div>

          <div className="card">
            <h2>📋 Summary</h2>
            <InfoRow label="Organization" value={result.organization} />
            <InfoRow label="Claim" value={result.claim} />
            <InfoRow label="Requested Action" value={result.requestedAction} />
            <InfoRow label="Urgency" value={result.urgency} />
          </div>

          <div className="card">
            <h2>🔎 Suspicious Evidence</h2>
            <BulletList
              items={result.suspiciousPhrases}
              emptyText="No specific suspicious phrases detected."
            />

            <h3>Why suspicious?</h3>
            <BulletList
              items={result.reasons}
              emptyText="No additional reasoning provided."
            />
          </div>

          <div className="card">
            <h2>⛓️ Attack Chain</h2>
            {result.attackChain?.length ? (
              <ol className="chain">
                {result.attackChain.map((step, i) => (
                  <li key={i}>
                    <span className="chain-dot">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="muted">No multi-step attack chain identified.</p>
            )}
          </div>

          <div className="card">
            <h2>🌐 URL Verification</h2>

            {result.urlVerification?.length ? (
              result.urlVerification.map((item, i) => (
                <div
                  className={`url ${item.isOfficial ? "url-good" : "url-bad"}`}
                  key={i}
                >
                  <strong>{item.url}</strong>
                  <p>
                    {item.isOfficial
                      ? `✅ Official ${item.matchedBrand || "domain"}`
                      : item.impersonation
                        ? `🚨 ${item.assessment}`
                        : "⚠️ Not verified as an official domain"}
                  </p>
                </div>
              ))
            ) : (
              <p className="muted">No URL detected in the screenshot.</p>
            )}
          </div>

          <div className="card safe">
            <h2>✅ Safe Actions</h2>
            <BulletList
              items={result.safeActions}
              emptyText="No specific actions provided."
            />
          </div>
        </section>
      )}

      <footer className="footer">
        ScamShield gives guidance, not guarantees. Always verify through
        official channels.
      </footer>
    </main>
  );
}