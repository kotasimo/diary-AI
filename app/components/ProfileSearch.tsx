"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Profile } from "../types";
import { getSupabaseClient } from "../utils/supabaseClient";

export function ProfileSearch() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [message, setMessage] = useState("");
  const [searching, setSearching] = useState(false);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseClient();
    const query = keyword.trim();

    setMessage("");
    setResults([]);

    if (!supabase || query.length === 0) {
      return;
    }

    setSearching(true);

    const safeQuery = query.replaceAll("%", "\\%").replaceAll("_", "\\_").replaceAll(",", " ");
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, handle, location, tagline, created_at")
      .or(`display_name.ilike.%${safeQuery}%,handle.ilike.%${safeQuery}%`)
      .limit(8);

    setSearching(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setResults((data || []) as Profile[]);
    if (!data?.length) {
      setMessage("見つかりませんでした。");
    }
  }

  return (
    <section className="panel profile-search">
      <div className="panel-title">ユーザー検索</div>
      <div className="panel-body">
        <form className="profile-search-form" onSubmit={handleSearch}>
          <input
            aria-label="プロフィール名検索"
            placeholder="名前で検索"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <button type="submit">{searching ? "検索中" : "検索"}</button>
        </form>
        {message ? <p className="profile-search-message">{message}</p> : null}
        {results.length > 0 ? (
          <div className="profile-search-results">
            {results.map((profile) => (
              <button
                key={profile.id}
                type="button"
                onClick={() => router.push(`/users/${profile.id}`)}
              >
                <strong>{profile.display_name}</strong>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
