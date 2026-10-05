// Real-time call timeline. Each event is { time, text, tone }.
export default function CallTimeline({ events, t }) {
  return (
    <div className="card">
      <h2>🕒 {t("callTimeline")}</h2>

      {events.length === 0 ? (
        <p className="muted">{t("transcriptPlaceholder")}</p>
      ) : (
        <ol className="timeline">
          {events.map((event, i) => (
            <li key={i} className={`timeline-item tone-${event.tone || "info"}`}>
              <span className="timeline-time">{event.time}</span>
              <span className="timeline-dot" />
              <span className="timeline-text">{event.text}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}