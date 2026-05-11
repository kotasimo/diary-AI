import { FormEvent } from "react";
import { AuthMode } from "../types";

interface AuthScreenProps {
  authMode: AuthMode;
  message: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSwitch: () => void;
  onReset: () => void;
}

export function AuthScreen({
  authMode,
  message,
  onSubmit,
  onSwitch,
  onReset,
}: AuthScreenProps) {
  const isSignup = authMode === "signup";
  const isReset = authMode === "reset";

  return (
    <div className="center-screen">
      <section className="auth-card">
        <div className="brand">
          RUN<span>NET</span> DIARY
        </div>
        <h1>{isSignup ? "ユーザー登録" : isReset ? "パスワードリセット" : "ログイン"}</h1>
        <form className="auth-form" onSubmit={onSubmit}>
          <label>
            メールアドレス
            <input name="email" type="email" required autoComplete="email" />
          </label>
          {!isReset && (
            <label>
              パスワード
              <input
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete={isSignup ? "new-password" : "current-password"}
              />
            </label>
          )}
          {message ? <p className="form-message">{message}</p> : null}
          <button className="primary" type="submit">
            {isSignup ? "登録する" : isReset ? "リセットメール送信" : "ログインする"}
          </button>
        </form>
        <button className="add-link auth-switch" onClick={onSwitch}>
          {isSignup ? "すでにアカウントがある方はこちら" : isReset ? "ログインに戻る" : "新しく登録する"}
        </button>
        {!isReset && (
          <button className="add-link auth-switch" onClick={onReset}>
            パスワードを忘れた場合
          </button>
        )}
      </section>
    </div>
  );
}