import { DiaryEntry } from "../types";
import { formatDate } from "../utils/date";

interface ReadModalProps {
  date: Date;
  entry?: DiaryEntry;
  onClose: () => void;
}

export function ReadModal({
  date,
  entry,
  onClose,
}: ReadModalProps) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div className="modal">
        <div className="modal-header">
          <h2>{formatDate(date)} の日記</h2>
          <button className="close-btn" aria-label="閉じる" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="read-modal-body">
          {entry?.title ? <h3>{entry.title}</h3> : null}
          <div className="entry-text">{entry?.body || ""}</div>
        </div>
      </div>
    </div>
  );
}