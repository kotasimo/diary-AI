"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import { AuthScreen } from "../../components/AuthScreen";
import { CalendarPanel } from "../../components/CalendarPanel";
import { DiaryEntryRowCard } from "../../components/DiaryEntryRowCard";
import { ProfileSearch } from "../../components/ProfileSearch";
import { SetupScreen } from "../../components/SetupScreen";
import { DiaryRow, Profile } from "../../types";
import { addDays, dateKey, formatDate, getWeekDates } from "../../utils/date";
import { getEntry, rowsToDiaryMap, DiaryMap } from "../../utils/diary";
import { getSupabaseClient } from "../../utils/supabaseClient";

export default function UserDiaryPage() {
  const params = useParams<{ userId: string }>();
  const router = useRouter();
  const auth = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [diaries, setDiaries] = useState<DiaryMap>({});
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadUser() {
      const supabase = getSupabaseClient();
      if (!supabase || !auth.session?.user) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const [{ data: profileData, error: profileError }, { data: diaryRows, error: diariesError }] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("id, display_name, handle, location, tagline, created_at")
            .eq("id", params.userId)
            .single(),
          supabase
            .from("diary_entries")
            .select("id, user_id, entry_date, title, body, distance_km")
            .eq("user_id", params.userId)
            .order("entry_date", { ascending: true }),
        ]);

      if (profileError || diariesError) {
        setMessage(profileError?.message || diariesError?.message || "ユーザー情報の読み込みに失敗しました。");
      }

      setProfile((profileData as Profile) || null);
      setDiaries(rowsToDiaryMap((diaryRows || []) as DiaryRow[]));
      setLoading(false);
    }

    void loadUser();
  }, [auth.session?.user, params.userId]);

  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);

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

  if (loading) {
    return (
      <div className="center-screen">
        <div className="status-card">読み込み中...</div>
      </div>
    );
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">
          RUN<span>NET</span> DIARY
        </div>
        <div className="account-strip">
          <button className="add-link" onClick={() => router.push("/")}>
            自分のページへ戻る
          </button>
        </div>
      </header>

      <section className="hero">
        <h1>{profile?.handle || "Diary"}</h1>
        <p>{profile?.tagline || "今日の記録を残す"}</p>
      </section>

      <section className="layout compact-layout">
        <aside className="left-column">
          <CalendarPanel selectedDate={selectedDate} onDateSelect={setSelectedDate} />
        </aside>

        <section className="center-column">
          <article className="diary">
            <div className="week-nav">
              <button onClick={() => setSelectedDate(addDays(selectedDate, -7))}>◀ 前週</button>
              <span>
                {formatDate(weekDates[0], false, false)}〜
                {formatDate(weekDates[6], false, false)}
              </span>
              <button onClick={() => setSelectedDate(addDays(selectedDate, 7))}>次週 ▶</button>
            </div>
            <div className="entry-list">
              {weekDates.map((date) => (
                <DiaryEntryRowCard
                  key={dateKey(date)}
                  date={date}
                  entry={getEntry(diaries, params.userId, date)}
                  editable={false}
                  onOpen={() => undefined}
                  onRead={() => undefined}
                />
              ))}
            </div>
          </article>
        </section>

        <aside className="right-column">
          <section className="panel viewed-profile">
            <div className="panel-title">閲覧中</div>
            <div className="panel-body">
              <strong>{profile?.display_name || "ユーザー"}</strong>
              <p>{profile?.handle}</p>
              {message ? <p className="form-message">{message}</p> : null}
            </div>
          </section>
          <ProfileSearch />
        </aside>
      </section>
    </main>
  );
}
