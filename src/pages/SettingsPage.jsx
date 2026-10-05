import { Check, RotateCcw, ShieldCheck } from "lucide-react";
import { LANGUAGES } from "../i18n";
import { useLang } from "../i18nContext";

export default function SettingsPage({ lang, setLang, onReset }) {
  const { t } = useLang();

  return (
    <div className="space-y-5">
      <section className="ss-card p-6 sm:p-7">
        <h2 className="font-display text-lg font-semibold text-ink">
          {t("settingsProfile")}
        </h2>
        <div className="mt-4 flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-primary font-display text-lg font-bold text-gold-soft">
            AJ
          </span>
          <div>
            <p className="font-semibold text-ink">Alex Johnson</p>
            <p className="text-sm text-muted">alex.johnson@email.com</p>
          </div>
        </div>
      </section>

      <section className="ss-card p-6 sm:p-7">
        <h2 className="font-display text-lg font-semibold text-ink">
          {t("settingsInterfaceLanguage")}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {t("settingsLanguageNote")}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {LANGUAGES.map((entry) => {
            const active = entry.code === lang;
            return (
              <button
                key={entry.code}
                type="button"
                onClick={() => setLang(entry.code)}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  active
                    ? "bg-primary text-white"
                    : "border border-line bg-white text-primary hover:border-primary/40"
                }`}
              >
                {active && <Check size={14} />}
                {entry.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="ss-card p-6 sm:p-7">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-safe/10 text-safe">
              <ShieldCheck size={18} />
            </span>
            <div>
              <p className="font-semibold text-ink">
                {t("settingsProtectionActive")}
              </p>
              <p className="text-sm text-muted">
                {t("settingsMonitoring")}
              </p>
            </div>
          </div>
          <span className="h-2.5 w-2.5 rounded-full bg-safe" />
        </div>
      </section>

      <section className="ss-card p-6 sm:p-7">
        <h2 className="font-display text-lg font-semibold text-ink">
          {t("settingsDemoData")}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {t("settingsDemoDataNote")}
        </p>
        <button
          type="button"
          onClick={onReset}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-primary transition hover:border-primary/40"
        >
          <RotateCcw size={14} />
          {t("settingsResetDemo")}
        </button>
      </section>
    </div>
  );
}