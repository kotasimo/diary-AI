import { useEffect, useMemo, useState, useCallback } from "react";
import { Profile, DiaryRow } from "../types";
import { rowsToDiaryMap, getEntry, DiaryMap } from "../utils/diary";
import { getWeekDates, dateKey } from "../utils/date";
import { getSupabaseClient } from "../utils/supabaseClient";

export function useDiary(session: any) {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [diaries, setDiaries] = useState<DiaryMap>({});
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [editingDate, setEditingDate] = useState<Date | null>(null);
  const [readingDate, setReadingDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadAppData = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);

    if (!session?.user) {
      setCurrentUser(null);
      setDiaries({});
      setLoading(false);
      return;
    }

    await ensureProfile(session);

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, display_name, handle, location, tagline, created_at")
      .eq("id", session.user.id)
      .single();

    const { data: diaryRows, error: diariesError } = await supabase
      .from("diary_entries")
      .select("id, user_id, entry_date, title, body, distance_km")
      .eq("user_id", session.user.id)
      .order("entry_date", { ascending: true });

    if (profileError || diariesError) {
      setMessage(profileError?.message || diariesError?.message || "データの読み込みに失敗しました。");
    }

    setCurrentUser((profileData as Profile) || null);
    setDiaries(rowsToDiaryMap((diaryRows || []) as DiaryRow[]));
    setLoading(false);
  }, [session]);

  useEffect(() => {
    void loadAppData();
  }, [loadAppData]);

  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);

  const handleEntrySubmit = useCallback(async (title: string, body: string) => {
    const supabase = getSupabaseClient();
    if (!supabase || !editingDate || !currentUser) return;

    const payload = {
      user_id: currentUser.id,
      entry_date: dateKey(editingDate),
      title: title.trim() || "無題",
      distance_km: 0,
      body: body.trim(),
    };

    const { error } = await supabase.from("diary_entries").upsert(payload, {
      onConflict: "user_id,entry_date",
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setEditingDate(null);
    await loadAppData();
  }, [editingDate, currentUser, loadAppData]);

  const saveProfile = useCallback(
    async (profileFields: {
      display_name: string;
      handle: string;
      tagline: string;
      location: string;
    }) => {
      const supabase = getSupabaseClient();
      if (!supabase || !currentUser) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: profileFields.display_name.trim(),
          handle: profileFields.handle.trim(),
          tagline: profileFields.tagline.trim() || null,
          location: profileFields.location.trim() || null,
        })
        .eq("id", currentUser.id);

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage("プロフィールを保存しました。");
      await loadAppData();
    },
    [currentUser, loadAppData],
  );

  return {
    currentUser,
    diaries,
    selectedDate,
    editingDate,
    readingDate,
    loading,
    message,
    weekDates,
    setSelectedDate,
    setEditingDate,
    setReadingDate,
    setMessage,
    handleEntrySubmit,
    loadAppData,
    saveProfile,
  };
}

async function ensureProfile(session: any) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const emailName = session.user.email?.split("@")[0] || "runner";

  await supabase.from("profiles").upsert(
    {
      id: session.user.id,
      display_name: emailName,
      handle: "My Diary",
      location: "",
      tagline: "今日の記録を残す",
    },
    { onConflict: "id", ignoreDuplicates: true },
  );
}