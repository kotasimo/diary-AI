"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);

  useEffect(() => {
    // URLからハッシュパラメータを取得してセッションを復元
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");
    const error = hashParams.get("error");

    if (error) {
      if (error === "access_denied" && hashParams.get("error_code") === "otp_expired") {
        setMessage("パスワードリセットリンクの有効期限が切れています。再度リセットメールを送信してください。");
      } else {
        setMessage("無効なリンクです。再度リセットメールを送信してください。");
      }
      setLoading(false);
      return;
    }

    if (accessToken && refreshToken) {
      // セッションを設定
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      }).then(({ error }) => {
        if (error) {
          setMessage("セッションの設定に失敗しました。再度リセットメールを送信してください。");
        } else {
          setIsValidToken(true);
        }
        setLoading(false);
      });
    } else {
      setMessage("無効なリンクです。再度リセットメールを送信してください。");
      setLoading(false);
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("パスワードが一致しません。");
      return;
    }

    if (password.length < 6) {
      setMessage("パスワードは6文字以上で入力してください。");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setMessage("パスワードの更新に失敗しました: " + error.message);
      return;
    }

    setMessage("パスワードを更新しました。ログインしてください。");
    // 少し待ってからログインページにリダイレクト
    setTimeout(() => {
      window.location.href = "/";
    }, 2000);
  }

  if (loading) {
    return (
      <div className="center-screen">
        <div className="status-card">読み込み中...</div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="center-screen">
        <section className="auth-card">
          <div className="brand">
            RUN<span>NET</span> DIARY
          </div>
          <h1>パスワードリセット</h1>
          <p className="form-message">{message}</p>
          <button className="primary" onClick={() => window.location.href = "/"}>
            ログインページに戻る
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="center-screen">
      <section className="auth-card">
        <div className="brand">
          RUN<span>NET</span> DIARY
        </div>
        <h1>新しいパスワードを設定</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            新しいパスワード
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </label>
          <label>
            パスワード（確認）
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </label>
          {message ? <p className="form-message">{message}</p> : null}
          <button className="primary" type="submit">
            パスワードを更新
          </button>
        </form>
        <button className="add-link" onClick={() => window.location.href = "/"}>
          キャンセル
        </button>
      </section>
    </div>
  );
}