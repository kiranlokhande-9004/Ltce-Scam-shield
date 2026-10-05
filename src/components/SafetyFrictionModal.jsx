import { useEffect, useState } from "react";

// Payment-safety friction. The "Proceed Anyway" button requires a real
// 3-second countdown so the user cannot continue by reflex.
export default function SafetyFrictionModal({ t, open, onCancel, onProceed }) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (!open) return undefined;

    setCount(3);
    const id = setInterval(() => {
      setCount((value) => (value <= 1 ? 0 : value - 1));
    }, 1000);

    return () => clearInterval(id);
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="card modal">
        <h2>💰 {t("paymentSafetyCheck")}</h2>
        <p className="modal-warning">{t("paymentWarning")}</p>

        <ul className="bullet-list safe-list">
          <li>{t("actionDoNotPay")}</li>
          <li>{t("actionVerify")}</li>
        </ul>

        <div className="modal-actions">
          <button className="btn-answer" onClick={onCancel}>
            {t("cancelPayment")}
          </button>
          <button
            className="btn-decline"
            disabled={count > 0}
            onClick={onProceed}
          >
            {t("proceedAnyway")}
            {count > 0 ? ` (${count})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}