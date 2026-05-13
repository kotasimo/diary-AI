"use client";

import { FormEvent, useEffect, useState } from "react";
import { DiaryEntry } from "../types";
import { formatDate } from "../utils/date";

interface DayDiaryPanelProps {
  date: Date;
  entry?: DiaryEntry;
  mode: "read" | "edit";
  onBack: () => void;
  onPrevDay: () => void;
  onNextDay: () => void;
  onEdit: () => void;
  onSave: (title: string, body: string) => Promise<void>;
}

export function DayDiaryPanel({
  date,
  entry,
  mode,
  onBack,
  onPrevDay,
  onNextDay,
  onEdit,
  onSave,
}: DayDiaryPanelProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(entry?.title || "");
    setBody(entry?.body || "");
  }, [entry]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    await onSave(title, body);
    setSaving(false);
  }

  return (
    <article className="diary day-diary">
      <div className="day-diary-head">
        <button className="back-to-list" onClick={onBack}>◀ 一覧</button>
        <div className="day-date-nav">
          <button aria-label="前の日" onClick={onPrevDay}>
            ◀
          </button>
          <strong>{formatDate(date)}</strong>
          <button aria-label="次の日" onClick={onNextDay}>
            ▶
          </button>
        </div>
      </div>

      {mode === "edit" ? (
        <form className="day-form" onSubmit={handleSubmit}>
          <label className="day-title-row">
            <span>タイトル</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label>
            内容
            <textarea value={body} onChange={(event) => setBody(event.target.value)} />
          </label>
          <div className="form-actions">
            <button className="secondary" type="button" onClick={onBack}>
              戻る
            </button>
            <button className="primary" type="submit" disabled={saving}>
              {saving ? "保存中..." : "保存する"}
            </button>
          </div>
        </form>
      ) : (
        <div className="day-read">
          <div className="entry-header">
            <div className="entry-title-line">
              {entry?.title ? <span>{entry.title}</span> : null}
            </div>
            <button className="entry-action" onClick={onEdit}>
              [編集する]
            </button>
          </div>
          <div className="day-read-body">
            {entry?.body ? (
              <div className="entry-text">{entry.body}</div>
            ) : (
              <p className="empty-text">まだ記録がありません。</p>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
