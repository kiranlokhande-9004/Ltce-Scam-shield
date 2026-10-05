import { useRef, useState } from "react";
import { ImagePlus, Loader2, Lock, Sparkles } from "lucide-react";
import ScanTypeSelector from "./ScanTypeSelector";
import { useLang } from "../../i18nContext";

const PLACEHOLDER_KEYS = {
  message: "phMessage",
  url: "phUrl",
  email: "phEmail",
};

export default function ScanCard({
  type,
  onTypeChange,
  value,
  onValueChange,
  onAnalyze,
  loading,
  error,
  onScreenshot,
  screenshotLoading,
}) {
  const fileRef = useRef(null);
  const [focused, setFocused] = useState(false);
  const { t } = useLang();

  return (
    <section className="ss-card p-6 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">
            {t("scanCardTitle")}
          </h2>
          <p className="mt-1 max-w-md text-sm text-muted">
            {t("scanCardSubtitle")}
          </p>
        </div>
        <ScanTypeSelector value={type} onChange={onTypeChange} />
      </div>

      <div
        className={`mt-5 rounded-2xl border bg-app/60 p-1 transition-all duration-200 ${
          focused ? "border-gold ring-4 ring-gold/15" : "border-line"
        }`}
      >
        <textarea
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          rows={5}
          placeholder={t(PLACEHOLDER_KEYS[type] || PLACEHOLDER_KEYS.message)}
          className="w-full resize-none rounded-xl bg-transparent px-4 py-3 text-sm text-ink placeholder:text-muted/70 focus:outline-none"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={loading || screenshotLoading || !value.trim()}
          className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-xs font-bold tracking-[0.16em] text-primary-dark shadow-gold transition-all duration-200 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              {t("analyzingIndicators")}
            </>
          ) : (
            <>
              <Sparkles size={15} />
              {t("analyzeWithAi")}
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={loading || screenshotLoading}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-3 text-xs font-semibold text-primary transition hover:border-primary/40 disabled:opacity-50"
        >
          {screenshotLoading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <ImagePlus size={15} />
          )}
          {t("uploadScreenshot")}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onScreenshot?.(file);
            event.target.value = "";
          }}
        />

        <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted">
          <Lock size={13} />
          {t("secureAnalyzed")}
        </span>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}
    </section>
  );
}