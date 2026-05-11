import { AuthError } from "@supabase/supabase-js";

export function formatSupabaseError(error: AuthError) {
  if (error.code === "invalid_credentials" || error.message?.toLowerCase().includes("invalid login credentials")) {
    return "メールアドレスまたはパスワードが正しくありません。";
  }

  if (error.message?.toLowerCase().includes("invalid api key")) {
    return "Invalid API key: Supabase の Project Settings > API Keys から Legacy anon key、または同じプロジェクトの Publishable key をコピーし直してください。登録時に出る場合は Legacy anon key の方が確実です。";
  }

  return error.message || "エラーが発生しました。";
}