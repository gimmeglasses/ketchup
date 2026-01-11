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

## Supabase（Docker in Docker + Supabase CLI）

本プロジェクトでは、ローカル Supabase を  
**Docker in Docker（DinD）環境上で Supabase CLI により起動**します。

### Docker in Docker（DinD）とは

Docker in Docker とは、

- **コンテナの中から Docker を操作できる構成**
- Dev Container 内で `docker` / `docker ps` / `npx supabase` が実行可能
- Supabase CLI が内部的に Docker コンテナを起動

という仕組みです。

## Supabase の起動・停止（重要）

⚠️ **必ず Dev Container のターミナル内で実行してください**

### Supabase 起動

```bash
npx supabase start
```

初回起動時は、必要な Docker イメージが自動的に pull されます。

```bash
docker ps
```

`supabase_*` といったコンテナが表示されていれば正常です。

### Supabase 状態確認（URL 確認）

```bash
npx supabase status
```

### Supabase 停止

```bash
npx supabase stop
```

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

## テスト（Vitest）

このプロジェクトでは Vitest を使用してユニットテストを行います。

### テストの実行

```
npm run test
```

## Drizzle ORM について

本プロジェクトでは、データベース操作のために **Drizzle ORM** を採用しています。

### Drizzle ORM とは

TypeScript 向けの軽量 ORM で、次のような特徴があります。

- **型安全**（スキーマベースで型が自動反映される）
- **軽量・高速**（ランタイム依存が少ない）
- **SQL が分かりやすい**（直感的な API）
- **マイグレーションが扱いやすい**
- Supabase / PostgreSQL と相性が良い

### 役割

- DB スキーマ管理
- マイグレーション管理
- TypeScript から安全に DB 操作するためのレイヤー

### Drizzle ORM コマンド

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

## E2E テスト (Playwright)

### Playwright とは

[Playwright](https://playwright.dev/) は Microsoft が開発したモダンな E2E テストフレームワークです。

### コマンド

#### 特定のテストファイルを実行

```
npx playwright test e2e/spec/register.spec.ts
```

#### 特定のテストファイルを UI モードで実行

```
npx playwright test e2e/spec/register.spec.ts --ui-host=0.0.0.0
```

- UI モードではテストの実行状況をブラウザ上で確認できます
- Docker コンテナ上で実行するため、--ui-host=0.0.0.0 を指定しています

#### 全ての E2E テストを実行

```
npx playwright test
```

### ディレクトリ構成

```
e2e/
├── page/                   // 画面ごとの操作・要素取得を責務として持つ
│ └── {page}-page.ts
│
└── spec/                   // テストシナリオを記述するディレクトリ
  ├── {page}.spec.ts        // 単一ページ単位の振る舞いを検証するテスト
  └── application.spec.ts   // アプリケーション全体の動線・統合シナリオを検証するテスト
```

### 注意事項（Docker 環境）

`--headed` オプション（ブラウザを表示して実行）は Docker コンテナ上では使用できません。
そのため、本プロジェクトでは headless モードのみ を利用しています
