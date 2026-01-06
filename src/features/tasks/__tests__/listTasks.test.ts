/**
 * listTasks サービスのテスト
 * SQLiteインメモリDBを使用してクエリの正確性を検証
 */
import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { tasks } from "@/app/db/schema";

// テスト用インメモリDBのセットアップ
// NOTE: 本番は Postgres を使用するがテストは軽量化のため SQLite を使用している。
// UUID を TEXT に、serial を INTEGER AUTOINCREMENT に置き換えており、
// 型制約・タイムスタンプ精度・NULL ソート順などの差異を検知できない可能性がある。
const sqliteDb = new Database(":memory:");
const testDb = drizzle(sqliteDb);

// DBクライアントをモック化
vi.mock("@/app/db/client", () => ({
  db: testDb,
  client: sqliteDb,
}));

describe("listTasks DBテスト", () => {
  const testUserId = "00000000-0000-0000-0000-000000000001";
  const otherUserId = "00000000-0000-0000-0000-000000000002";

  beforeAll(() => {
    // テーブルを作成
    // NOTE: PostgreSQLのUUIDはSQLiteではTEXTとして扱う
    sqliteDb.exec(`
      CREATE TABLE tasks (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        estimated_minutes INTEGER,
        due_at DATETIME,
        completed_at DATETIME,
        note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
  });

  afterEach(() => {
    sqliteDb.exec("DELETE FROM tasks");
  });

  it("指定ユーザーのタスクのみを作成日時の降順で取得すること", async () => {
    const { listTasks } = await import("../services/listTasks");
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 86400000);
    const twoDaysAgo = new Date(now.getTime() - 172800000);

    await testDb.insert(tasks).values([
      {
        id: "10000000-0000-0000-0000-000000000001",
        userId: testUserId,
        title: "古いタスク",
        createdAt: twoDaysAgo.toISOString(),
      },
      {
        id: "10000000-0000-0000-0000-000000000002",
        userId: testUserId,
        title: "最新タスク",
        createdAt: now.toISOString(),
      },
      {
        id: "10000000-0000-0000-0000-000000000003",
        userId: testUserId,
        title: "中間タスク",
        createdAt: oneDayAgo.toISOString(),
      },
      {
        id: "10000000-0000-0000-0000-000000000004",
        userId: otherUserId,
        title: "他ユーザーのタスク",
        createdAt: now.toISOString(),
      },
    ]);

    const result = await listTasks(testUserId);

    expect(result).toHaveLength(3);
    // 降順（新しい順）で返されること
    expect(result[0].title).toBe("最新タスク");
    expect(result[1].title).toBe("中間タスク");
    expect(result[2].title).toBe("古いタスク");
    // 他ユーザーのタスクは含まれないこと
    expect(result.every((task) => task.userId === testUserId)).toBe(true);
  });

  it("タスクが存在しない場合は空の配列を返すこと", async () => {
    const { listTasks } = await import("../services/listTasks");

    const result = await listTasks(testUserId);

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it("タスクのすべての属性が正しく取得されること", async () => {
    const { listTasks } = await import("../services/listTasks");
    const createdAt = new Date();

    await testDb.insert(tasks).values({
      id: "20000000-0000-0000-0000-000000000001",
      userId: testUserId,
      title: "詳細タスク",
      estimatedMinutes: 120,
      dueAt: new Date(createdAt.getTime() + 86400000).toISOString(),
      completedAt: null,
      note: "重要なタスク",
      createdAt: createdAt.toISOString(),
    });

    const result = await listTasks(testUserId);

    expect(result).toHaveLength(1);
    const task = result[0];
    expect(task).toEqual({
      id: expect.any(String),
      userId: testUserId,
      title: "詳細タスク",
      estimatedMinutes: 120,
      dueAt: expect.any(String),
      completedAt: null,
      note: "重要なタスク",
      createdAt: expect.any(String),
    });
  });

  it("完了済みタスクおよびNULL値も正しく取得されること", async () => {
    const { listTasks } = await import("../services/listTasks");

    await testDb.insert(tasks).values({
      id: "30000000-0000-0000-0000-000000000001",
      userId: testUserId,
      title: "シンプルなタスク",
      estimatedMinutes: null,
      dueAt: null,
      completedAt: new Date().toISOString(),
      note: null,
      createdAt: new Date().toISOString(),
    });

    const result = await listTasks(testUserId);

    expect(result).toHaveLength(1);
    expect(result[0].estimatedMinutes).toBeNull();
    expect(result[0].dueAt).toBeNull();
    expect(result[0].note).toBeNull();
    expect(result[0].completedAt).not.toBeNull();
  });
});
