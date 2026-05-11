export function SetupScreen() {
  return (
    <div className="center-screen">
      <section className="status-card setup-card">
        <div className="brand">
          RUN<span>NET</span> DIARY
        </div>
        <h1>外部データベース設定が必要です</h1>
        <p>
          Supabase の URL と anon key を .env.local に入れると、ユーザー登録、ログイン、日記保存が有効になります。
        </p>
        <ol>
          <li>Supabase でプロジェクトを作成</li>
          <li>supabase-schema.sql を SQL Editor で実行</li>
          <li>.env.local.example を .env.local にコピーして値を差し替え</li>
        </ol>
      </section>
    </div>
  );
}