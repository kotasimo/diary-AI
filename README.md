# RUNNET風 ダイアリー

週単位で日記を記録できる Next.js + React + TypeScript アプリです。Supabase を外部データベースとして使う想定で、ユーザー登録、ログイン、自分の日記の編集、他人の日記の閲覧に対応しています。

## Supabase セットアップ

1. Supabase で新しいプロジェクトを作成します。
2. Supabase の SQL Editor で `supabase-schema.sql` を実行します。
3. Project Settings > API から Project URL と anon public key をコピーします。
4. `.env.local` の値を差し替えます。

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

登録時に `Invalid API key` が出る場合は、`Project Settings > API Keys` の **Legacy API Keys** から `anon public` key をコピーして `NEXT_PUBLIC_SUPABASE_ANON_KEY` に入れてください。`eyJ...` で始まる長いJWTです。`service_role` はブラウザに入れないでください。

## 認証設定

ローカルで試す場合は、Supabase の Authentication > URL Configuration で Site URL にこのアプリを開く URL を入れてください。メール確認を省いて素早く試したい場合は、Authentication > Providers > Email の Confirm email をオフにすると、登録直後にログインしやすくなります。

## 起動

```bash
npm install
npm run dev
```

起動後は `http://localhost:3000` を開いてください。
