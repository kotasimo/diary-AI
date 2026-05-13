"use client";


import { FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./hooks/useAuth";
import { useDiary } from "./hooks/useDiary";
import { AuthScreen } from "./components/AuthScreen";
import { CalendarPanel } from "./components/CalendarPanel";
import { DiaryEntryRowCard } from "./components/DiaryEntryRowCard";
import { ProfilePanel } from "./components/ProfilePanel";
import { ProfileSearch } from "./components/ProfileSearch";
import { SetupScreen } from "./components/SetupScreen";
import { addDays, dateKey, formatDate, parseDateKey } from "./utils/date";
import { getEntry } from "./utils/diary";

export default function DiaryPage() {
  const router = useRouter();
  const auth = useAuth();
  const diary = useDiary(auth.session);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const week = searchParams.get("week");
    const weekDate = week ? parseDateKey(week) : null;
    if (weekDate) {
      diary.setSelectedDate(weekDate);
    }
  }, []);

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    await auth.handleAuthSubmit(email, password);
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
                {formatDate(diary.weekDates[0], false, false)}〜
                {formatDate(diary.weekDates[6], false, false)}
              </span>
              <button onClick={() => diary.setSelectedDate(addDays(diary.selectedDate, 7))}>次週 ▶</button>
            </div>
            <div className="entry-list">
              {diary.weekDates.map((date) => (
                <DiaryEntryRowCard
                  key={dateKey(date)}
                  date={date}
                  entry={getEntry(diary.diaries, diary.currentUser?.id || null, date)}
                  editable
                  onOpen={() => router.push(`/diary/${dateKey(date)}?mode=edit`)}
                  onRead={() => router.push(`/diary/${dateKey(date)}`)}
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
          <ProfileSearch />
        </aside>
      </section>
    </main>
  );
}
