import { FormEvent } from "react";
import { DiaryEntry } from "../types";
import { formatDate } from "../utils/date";

interface EntryModalProps {
  date: Date;
  entry?: DiaryEntry;
  readonly: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function EntryModal({
  date,
  entry,
  readonly,
  onClose,
  onSubmit,
}: EntryModalProps) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div className="modal">
        <div className="modal-header">
          <h2>{formatDate(date)} のダイアリー</h2>
          <button className="close-btn" aria-label="閉じる" onClick={onClose}>
            ×
          </button>
        </div>
        <form className="form" onSubmit={onSubmit}>
          <label>
            タイトル
            <input name="title" defaultValue={entry?.title || ""} readOnly={readonly} />
          </label>
          <label>
            内容
            <textarea name="body" defaultValue={entry?.body || ""} readOnly={readonly} />
          </label>
          <div className="form-actions">
            <button className="secondary" type="button" onClick={onClose}>
              閉じる
            </button>
            {!readonly ? (
              <button className="primary" type="submit">
                保存する
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}