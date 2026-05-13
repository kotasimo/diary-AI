import { useCallback, useEffect, useMemo, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { DiaryRow, Profile } from "../types";
import { DiaryMap, rowsToDiaryMap } from "../utils/diary";
import { dateKey, getWeekDates } from "../utils/date";
import { getSupabaseClient } from "../utils/supabaseClient";

let cachedUserId: string | null = null;
let cachedProfile: Profile | null = null;
let cachedDiaries: DiaryMap = {};
let hasLoadedCache = false;

export function useDiary(session: Session | null) {
  const userId = session?.user?.id || null;
  const hasUsableCache = Boolean(userId && hasLoadedCache && cachedUserId === userId);

  const [currentUser, setCurrentUser] = useState<Profile | null>(() =>
    hasUsableCache ? cachedProfile : null,
  );
  const [diaries, setDiaries] = useState<DiaryMap>(() =>
    hasUsableCache ? cachedDiaries : {},
  );
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [editingDate, setEditingDate] = useState<Date | null>(null);
  const [readingDate, setReadingDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(() => !hasUsableCache);
  const [message, setMessage] = useState("");

  const applyCache = useCallback(() => {
    if (!userId || !hasLoadedCache || cachedUserId !== userId) return false;
    setCurrentUser(cachedProfile);
    setDiaries(cachedDiaries);
    setLoading(false);
    return true;
  }, [userId]);

  const loadAppData = useCallback(
    async (force = false) => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setLoading(false);
        return;
      }

      if (!userId || !session?.user) {
        setCurrentUser(null);
        setDiaries({});
        setLoading(false);
        return;
      }

      if (!force && applyCache()) {
        return;
      }

      setLoading(!hasUsableCache);

      await ensureProfile(session);

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, display_name, handle, location, tagline, created_at")
        .eq("id", userId)
        .single();

      const { data: diaryRows, error: diariesError } = await supabase
        .from("diary_entries")
        .select("id, user_id, entry_date, title, body, distance_km")
        .eq("user_id", userId)
        .order("entry_date", { ascending: true });

      if (profileError || diariesError) {
        setMessage(profileError?.message || diariesError?.message || "データの読み込みに失敗しました。");
      }

      const nextProfile = (profileData as Profile) || null;
      const nextDiaries = rowsToDiaryMap((diaryRows || []) as DiaryRow[]);

      cachedUserId = userId;
      cachedProfile = nextProfile;
      cachedDiaries = nextDiaries;
      hasLoadedCache = true;

      setCurrentUser(nextProfile);
      setDiaries(nextDiaries);
      setLoading(false);
    },
    [applyCache, hasUsableCache, session, userId],
  );

  useEffect(() => {
    void loadAppData();
  }, [loadAppData]);

  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);

  const saveEntryForDate = useCallback(
    async (date: Date, title: string, body: string) => {
      const supabase = getSupabaseClient();
      if (!supabase || !currentUser) return false;

      const entryDate = dateKey(date);
      const payload = {
        user_id: currentUser.id,
        entry_date: entryDate,
        title: title.trim() || "無題",
        distance_km: 0,
        body: body.trim(),
      };

      const { data, error } = await supabase
        .from("diary_entries")
        .upsert(payload, { onConflict: "user_id,entry_date" })
        .select("id, user_id, entry_date, title, body, distance_km")
        .single();

      if (error) {
        setMessage(error.message);
        return false;
      }

      const row = (data || payload) as DiaryRow;
      const nextEntry = {
        id: "id" in row ? row.id : undefined,
        title: row.title,
        body: row.body,
      };

      setDiaries((prev) => {
        const nextDiaries = {
          ...prev,
          [currentUser.id]: {
            ...(prev[currentUser.id] || {}),
            [entryDate]: nextEntry,
          },
        };
        cachedDiaries = nextDiaries;
        cachedUserId = currentUser.id;
        hasLoadedCache = true;
        return nextDiaries;
      });

      return true;
    },
    [currentUser],
  );

  const handleEntrySubmit = useCallback(
    async (title: string, body: string) => {
      if (!editingDate) return;
      const saved = await saveEntryForDate(editingDate, title, body);
      if (saved) setEditingDate(null);
    },
    [editingDate, saveEntryForDate],
  );

  const saveProfile = useCallback(
    async (profileFields: {
      display_name: string;
      handle: string;
      tagline: string;
      location: string;
    }) => {
      const supabase = getSupabaseClient();
      if (!supabase || !currentUser) return;

      const nextProfile = {
        ...currentUser,
        display_name: profileFields.display_name.trim(),
        handle: profileFields.handle.trim(),
        tagline: profileFields.tagline.trim() || null,
        location: profileFields.location.trim() || null,
      };

      const { data, error } = await supabase
        .from("profiles")
        .update({
          display_name: nextProfile.display_name,
          handle: nextProfile.handle,
          tagline: nextProfile.tagline,
          location: nextProfile.location,
        })
        .eq("id", currentUser.id)
        .select("id, display_name, handle, location, tagline, created_at")
        .single();

      if (error) {
        setMessage(error.message);
        return;
      }

      const savedProfile = (data as Profile) || nextProfile;
      cachedProfile = savedProfile;
      cachedUserId = currentUser.id;
      hasLoadedCache = true;

      setCurrentUser(savedProfile);
      setMessage("プロフィールを保存しました。");
    },
    [currentUser],
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
    saveEntryForDate,
    loadAppData,
    saveProfile,
  };
}

async function ensureProfile(session: Session) {
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
