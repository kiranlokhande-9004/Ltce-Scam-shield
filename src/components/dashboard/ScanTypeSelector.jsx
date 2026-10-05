import { Link2, Mail, MessageSquare } from "lucide-react";

export const SCAN_TYPES = [
  { id: "message", label: "Message", icon: MessageSquare },
  { id: "url", label: "URL", icon: Link2 },
  { id: "email", label: "Email", icon: Mail },
];

export default function ScanTypeSelector({ value, onChange }) {
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
            {type.label}
          </button>
        );
      })}
    </div>
  );
}