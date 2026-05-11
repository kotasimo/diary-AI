import { DiaryEntry } from "../types";
import { formatDate } from "../utils/date";

interface DiaryEntryRowCardProps {
  date: Date;
  entry?: DiaryEntry;
  editable: boolean;
  onOpen: () => void;
  onRead: () => void;
}

export function DiaryEntryRowCard({
  date,
  entry,
  editable,
  onOpen,
  onRead,
}: DiaryEntryRowCardProps) {
  const title = entry?.title.trim();
  const body = entry?.body.trim();
  const shouldShowReadMore = Boolean(body && body.length > 80);

  return (
    <section className="entry">
      <div className="entry-header">
        <div className="entry-title-line">
          {title ? <span>{title}</span> : null}
          <button className="entry-action" onClick={onOpen}>
            [{editable ? "編集する" : "表示する"}]
          </button>
        </div>
        <div className="entry-date">{formatDate(date)}</div>
      </div>
      <div className="entry-body">
        {body ? <div className="entry-text entry-text-preview">{body}</div> : null}
        {shouldShowReadMore ? (
          <button className="read-more" onClick={onRead}>
            ▶ 全部見る
          </button>
        ) : null}
      </div>
    </section>
  );
}