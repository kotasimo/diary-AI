"use client";

import { FormEvent, Suspense, useEffect, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import { useDiary } from "../../hooks/useDiary";
import { AuthScreen } from "../../components/AuthScreen";
import { CalendarPanel } from "../../components/CalendarPanel";
import { DayDiaryPanel } from "../../components/DayDiaryPanel";
import { ProfilePanel } from "../../components/ProfilePanel";
import { ProfileSearch } from "../../components/ProfileSearch";
import { SetupScreen } from "../../components/SetupScreen";
import { addDays, dateKey, parseDateKey, startOfWeek } from "../../utils/date";
import { getEntry } from "../../utils/diary";

export default function DiaryDatePage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <DiaryDateContent />
    </Suspense>
  );
}

function DiaryDateContent() {
  const params = useParams<{ date: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const targetDate = useMemo(() => parseDateKey(params.date), [params.date]);
  const auth = useAuth();
  const diary = useDiary(auth.session);
  const mode = searchParams.get("mode") === "edit" ? "edit" : "read";

  useEffect(() => {
    if (targetDate) {
      diary.setSelectedDate(targetDate);
    }
  }, [targetDate]);

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    await auth.handleAuthSubmit(email, password);
  }

  if (!targetDate) {
    return (
      <div className="center-screen">
        <div className="status-card">日付が正しくありません。</div>
      </div>
    );
  }

  if (!auth.isSupabaseConfigured) {
    return <SetupScreen />;
  }

  if (diary.loading) {
    return <LoadingScreen />;
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

  const entry = getEntry(diary.diaries, diary.currentUser?.id || null, targetDate);

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
          <CalendarPanel
            selectedDate={targetDate}
            onDateSelect={(date) => router.push(`/diary/${dateKey(date)}`)}
          />
        </aside>

        <section className="center-column">
          <DayDiaryPanel
            date={targetDate}
            entry={entry}
            mode={mode}
            onBack={() => router.push(`/?week=${dateKey(startOfWeek(targetDate))}`)}
            onPrevDay={() => {
              const date = addDays(targetDate, -1);
              router.push(`/diary/${dateKey(date)}${mode === "edit" ? "?mode=edit" : ""}`);
            }}
            onNextDay={() => {
              const date = addDays(targetDate, 1);
              router.push(`/diary/${dateKey(date)}${mode === "edit" ? "?mode=edit" : ""}`);
            }}
            onEdit={() => router.push(`/diary/${dateKey(targetDate)}?mode=edit`)}
            onSave={async (title, body) => {
              const saved = await diary.saveEntryForDate(targetDate, title, body);
              if (saved) {
                router.push(`/diary/${dateKey(targetDate)}`);
              }
            }}
          />
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

function LoadingScreen() {
  return (
    <div className="center-screen">
      <div className="status-card">読み込み中...</div>
    </div>
  );
}
