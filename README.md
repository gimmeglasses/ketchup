# Next.js プロジェクト

このプロジェクトは[`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app)で作成された[Next.js](https://nextjs.org)プロジェクトです。

## 開発環境

このプロジェクトは**Dev Container**で動作するように構成されています。VS Code で開くと、自動的にコンテナ内で開発環境が構築されます。

### 必要な環境

- Docker
- Visual Studio Code
- Dev Containers 拡張機能

VS Code でこのプロジェクトを開くと、Dev Container で再度開くかどうか尋ねられます。「Reopen in Container」を選択することで、必要な開発環境がすべて自動的にセットアップされます。

## 技術スタック

- **Next.js** - React フレームワーク
- **TypeScript** - 型安全な開発
- **Tailwind CSS** - ユーティリティファーストの CSS フレームワーク
- **Supabase** - DB（ローカルは docker-compose で起動）
- **Drizzle ORM** - TypeScript フレンドリーな ORM

## Supabase コンテナの起動

ローカルの Supabase は[supabase-project/docker-compose.yml](supabase-project/docker-compose.yml)を使って起動します。**ホスト側（コンテナ外）のターミナル**で以下を実行してください。

```bash
cd supabase-project
docker compose up -d
```

停止する場合は次を実行します。

```bash
docker compose down
```

| 画面 / サービス         | URL                                                | 説明                                                                   |
| ----------------------- | -------------------------------------------------- | ---------------------------------------------------------------------- |
| Supabase Studio         | **[http://localhost:8000](http://localhost:8000)** | Supabase の各サービスへの入り口。REST/Auth/Realtime などは基本ここ経由 |
| Mailpit UI              | **[http://localhost:8025](http://localhost:8025)** | Supabase Auth から送信されたメールを確認できる Web UI                  |
| Analytics (Logflare UI) | **[http://localhost:4000](http://localhost:4000)** | Supabase ログ/Analytics の UI                                          |

## 開発環境の起動

まず、依存パッケージをインストールします：

```bash
npm install
```

次に、開発サーバーを起動します：

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて結果を確認してください。

`app/page.tsx`を編集することでページを編集できます。ファイルを編集すると自動的にページが更新されます。

## Drizzle ORM コマンド（簡易まとめ）

| やりたいこと                       | コマンド                     | 説明                                            |
| ---------------------------------- | ---------------------------- | ----------------------------------------------- |
| スキーマ変更から SQL 生成          | `npx drizzle-kit generate`   | `schema.ts` → `drizzle/migrations/*.sql` を作成 |
| 生成済みマイグレーションを実行     | `npx drizzle-kit migrate`    | SQL を DB に適用                                |
| 変更を即 DB に反映（SQL 生成省略） | `npx drizzle-kit push`       | 開発向けの簡易反映                              |
| 既存 DB → schema.ts 生成           | `npx drizzle-kit introspect` | 逆生成                                          |
| GUI で DB を確認                   | `npx drizzle-kit studio`     | Drizzle Studio 起動                             |

※ ローカル開発では **push** が手軽、本番や履歴管理する場合は **generate → migrate** 推奨。

## Tailwind CSS について

このプロジェクトでは Tailwind CSS を使用しています。Tailwind のユーティリティクラスを使って簡単にスタイリングできます。

```tsx
// 使用例
<div className="flex items-center justify-center min-h-screen bg-gray-100">
  <h1 className="text-4xl font-bold text-blue-600">Hello, Tailwind!</h1>
</div>
```

Tailwind CSS の詳細については[公式ドキュメント](https://tailwindcss.com/docs)をご覧ください。

## さらに学ぶ

Next.js についてさらに学ぶには、以下のリソースをご覧ください：

- [Next.js ドキュメント](https://nextjs.org/docs) - Next.js の機能と API について学ぶ
- [Learn Next.js](https://nextjs.org/learn) - インタラクティブな Next.js チュートリアル
- [Next.js GitHub リポジトリ](https://github.com/vercel/next.js)

## デプロイ

Next.js アプリをデプロイする最も簡単な方法は、Next.js の開発元である[Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)を使用することです。

詳細については[Next.js デプロイメントドキュメント](https://nextjs.org/docs/app/building-your-application/deploying)をご覧ください。
