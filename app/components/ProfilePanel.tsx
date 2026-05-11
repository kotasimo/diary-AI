"use client";

import { FormEvent, useEffect, useState } from "react";
import { Profile } from "../types";

export function ProfilePanel({
  profile,
  onSave,
  message,
}: {
  profile: Profile | null;
  onSave: (profileFields: { display_name: string; handle: string; tagline: string; location: string }) => Promise<void>;
  message?: string;
}) {
  const [collapsed, setCollapsed] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [tagline, setTagline] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.display_name || "");
    setHandle(profile.handle || "");
    setTagline(profile.tagline || "");
    setLocation(profile.location || "");
  }, [profile]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave({ display_name: displayName, handle, tagline, location });
  }

  return (
    <section className={`panel profile-panel ${collapsed ? "collapsed" : "expanded"}`}>
      <div className="panel-title profile-title" onClick={() => setCollapsed((prev) => !prev)}>
        <div>
          <div>プロフィール</div>
          <div className="profile-name">{displayName || "プロフィール"}</div>
        </div>
        <button className="toggle-btn" type="button">
          {collapsed ? "▼" : "▲"}
        </button>
      </div>
      <div className="panel-body">
        <form className="form" onSubmit={handleSubmit}>
          <label>
            表示名
            <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
          </label>
          <label>
            ハンドル名
            <input value={handle} onChange={(event) => setHandle(event.target.value)} />
          </label>
          <label>
            タグライン
            <input value={tagline} onChange={(event) => setTagline(event.target.value)} />
          </label>
          <label>
            位置
            <input value={location} onChange={(event) => setLocation(event.target.value)} />
          </label>
          {message ? <p className="form-message">{message}</p> : null}
          <div className="form-actions">
            <button className="primary" type="submit">
              保存
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
