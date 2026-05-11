"use client";

import { FormEvent } from "react";
import { useAuth } from "./hooks/useAuth";
import { useDiary } from "./hooks/useDiary";
import { AuthScreen } from "./components/AuthScreen";
import { SetupScreen } from "./components/SetupScreen";
import { CalendarPanel } from "./components/CalendarPanel";
import { DiaryEntryRowCard } from "./components/DiaryEntryRowCard";
import { ReadModal } from "./components/ReadModal";
import { EntryModal } from "./components/EntryModal";
import { ProfilePanel } from "./components/ProfilePanel";
import { addDays, formatDate, dateKey } from "./utils/date";
import { getEntry } from "./utils/diary";

export default function DiaryPage() {
  const auth = useAuth();
  const diary = useDiary(auth.session);

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    await auth.handleAuthSubmit(email, password);
  }

  async function handleEntrySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") || "");
    const body = String(formData.get("body") || "");
    await diary.handleEntrySubmit(title, body);
  }

  if (!auth.isSupabaseConfigured) {
    return <SetupScreen />;
  }

  if (diary.loading) {
    return (
      <div className="center-screen">
        <div className="status-card">読み込み中...</div>
      </div>
    );
  }

  if (!auth.session?.user) {
    return (
      <AuthScreen
        authMode={auth.authMode}
        message={auth.message}
        onSubmit={handleAuthSubmit}
        onSwitch={auth.switchAuthMode}
        onReset={auth.resetToResetMode}
      />
    );
  }

  return (
    <>
      <main className="shell">
        <header className="topbar">
          <div className="brand">
            RUN<span>NET</span> DIARY
          </div>
          <div className="account-strip">
            <span>{diary.currentUser?.display_name || auth.session.user.email}</span>
          </div>
        </header>

        <section className="hero">
          <h1>{diary.currentUser?.handle || "Diary"}</h1>
          <p>{diary.currentUser?.tagline || "今日の記録を残す"}</p>
        </section>

        <section className="layout compact-layout">
          <aside className="left-column">
            <CalendarPanel selectedDate={diary.selectedDate} onDateSelect={diary.setSelectedDate} />
          </aside>

          <section className="center-column">
            <article className="diary">
              <div className="week-nav">
                <button onClick={() => diary.setSelectedDate(addDays(diary.selectedDate, -7))}>◀ 前週</button>
                <span>
                  {formatDate(diary.weekDates[0], false, false)}〜{formatDate(diary.weekDates[6], false, false)}
                </span>
                <button onClick={() => diary.setSelectedDate(addDays(diary.selectedDate, 7))}>次週 ▶</button>
              </div>
              <div className="entry-list">
                {diary.weekDates.map((date) => (
                  <DiaryEntryRowCard
                    key={dateKey(date)}
                    date={date}
                    entry={getEntry(diary.diaries, diary.currentUser?.id || null, date)}
                    editable={true}
                    onOpen={() => diary.setEditingDate(date)}
                    onRead={() => diary.setReadingDate(date)}
                  />
                ))}
              </div>
              <div className="diary-footer">
                <div className="footer-nav">
                  <button onClick={() => diary.setSelectedDate(addDays(diary.selectedDate, -7))}>◀ 前へ</button>
                  <button onClick={() => diary.setSelectedDate(new Date())}>▲ 今週</button>
                  <button onClick={() => diary.setSelectedDate(addDays(diary.selectedDate, 7))}>次へ ▶</button>
                </div>
              </div>
            </article>
          </section>

          <aside className="right-column">
            <ProfilePanel
              profile={diary.currentUser}
              message={diary.message}
              onSave={diary.saveProfile}
            />
          </aside>
        </section>
      </main>

      {diary.editingDate ? (
        <EntryModal
          date={diary.editingDate}
          entry={getEntry(diary.diaries, diary.currentUser?.id || null, diary.editingDate)}
          readonly={false}
          onClose={() => diary.setEditingDate(null)}
          onSubmit={handleEntrySubmit}
        />
      ) : null}

      {diary.readingDate ? (
        <ReadModal
          date={diary.readingDate}
          entry={getEntry(diary.diaries, diary.currentUser?.id || null, diary.readingDate)}
          onClose={() => diary.setReadingDate(null)}
        />
      ) : null}
    </>
  );
}
