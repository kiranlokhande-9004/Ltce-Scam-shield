import CallSafetyDashboard from "../components/CallSafetyDashboard";
import ScamCall from "../components/ScamCall";

export default function CallSafetyPage({ lang, t }) {
  return (
    <div className="space-y-5">
      <section className="ss-card p-6 sm:p-7">
        <h2 className="font-display text-lg font-semibold text-ink">
          Real-time call protection
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          ScamShield transcribes a conversation on-device and analyzes the
          transcript for fraud indicators. The native Android companion
          (in <code className="rounded bg-app px-1.5 py-0.5">android/</code>)
          handles real call-state monitoring and streams only transcript text.
        </p>
      </section>

      <div className="legacy-dark">
        <CallSafetyDashboard lang={lang} t={t} />
      </div>

      <section className="ss-card p-6 sm:p-7">
        <h2 className="font-display text-lg font-semibold text-ink">
          Call Simulation (training)
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          A safe, scripted walkthrough of a typical bank-impersonation call. No
          real call is placed.
        </p>
        <div className="legacy-dark mt-4">
          <ScamCall t={t} />
        </div>
      </section>
    </div>
  );
}