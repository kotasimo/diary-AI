export type AuthMode = "login" | "signup" | "reset";

export type Profile = {
  id: string;
  display_name: string;
  handle: string;
  location: string | null;
  tagline: string | null;
  created_at: string;
};

export type DiaryEntry = {
  id?: number;
  title: string;
  body: string;
};

export type DiaryRow = {
  id: number;
  user_id: string;
  entry_date: string;
  title: string;
  body: string;
  distance_km: number | string | null;
};