import { Link2, Mail, MessageSquare } from "lucide-react";
import { useLang } from "../../i18nContext";

export const SCAN_TYPES = [
  { id: "message", labelKey: "scanTypeMessage", icon: MessageSquare },
  { id: "url", labelKey: "scanTypeUrl", icon: Link2 },
  { id: "email", labelKey: "scanTypeEmail", icon: Mail },
];

export default function ScanTypeSelector({ value, onChange }) {
  const { t } = useLang();

  return (
    <div className="inline-flex rounded-full bg-app p-1">
      {SCAN_TYPES.map((type) => {
        const Icon = type.icon;
        const active = value === type.id;
        return (
          <button
            key={type.id}
            type="button"
            onClick={() => onChange(type.id)}
            className={`ss-chip flex items-center gap-1.5 ${
              active
                ? "bg-white text-primary shadow-soft"
                : "text-muted hover:text-primary"
            }`}
          >
            <Icon size={14} strokeWidth={2.2} />
            {t(type.labelKey)}
          </button>
        );
      })}
    </div>
  );
}