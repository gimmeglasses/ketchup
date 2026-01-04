import { Task } from '@/types/task';

const tasks: Task[] = [
  // 1. 未完了: 期限に余裕あり (標準的なタスク)
  {
    id: "ID0000000001TASK",
    name: "企画書を作成する",
    description: "Q1のマーケティング企画書案を作成して共有する",
    dueDate: "2026-01-10",
    estimatedMin: 60,
    completedAt: null,
    createdAt: "2026-01-02T10:00:00Z"
  },
  // 2. 完了済み: 期限内に完了
  {
    id: "ID0000000002TASK",
    name: "経費精算",
    description: "12月分の交通費精算",
    dueDate: "2026-01-05",
    estimatedMin: 15,
    completedAt: "2026-01-02T15:30:00Z", // 完了日時あり
    createdAt: "2026-01-01T09:00:00Z"
  },
  // 3. 未完了: 期限切れ (Overdue)
  {
    id: "ID0000000003TASK",
    name: "週報の提出",
    description: "先週分の週報を提出する",
    dueDate: "2025-12-31", // 過去の日付
    estimatedMin: 20,
    completedAt: null,
    createdAt: "2025-12-28T09:00:00Z"
  },
  // 4. 未完了: 今日が期限 (Due Today)
  {
    id: "ID0000000004TASK",
    name: "クライアントへのメール返信",
    description: null,
    dueDate: "2026-01-03", // 今日の日付
    estimatedMin: 10,
    completedAt: null,
    createdAt: "2026-01-03T08:00:00Z"
  },
  // 5. 未完了: 期限なし
  {
    id: "ID0000000005TASK",
    name: "参考書籍を読む",
    description: "技術書のデザインパターン部分を読む",
    dueDate: null, // 期限なし
    estimatedMin: 120,
    completedAt: null,
    createdAt: "2026-01-01T10:00:00Z"
  },
  // 6. 完了済み: 期限を過ぎてから完了
  {
    id: "ID0000000006TASK",
    name: "大掃除",
    description: "デスク周りの整理",
    dueDate: "2025-12-28",
    estimatedMin: 180,
    completedAt: "2025-12-30T14:00:00Z", // dueDateより後に完了
    createdAt: "2025-12-20T10:00:00Z"
  },
  // 7. 未完了: 見積時間なし
  {
    id: "ID0000000007TASK",
    name: "牛乳を買う",
    description: null,
    dueDate: "2026-01-04",
    estimatedMin: undefined, // 見積なし
    completedAt: null,
    createdAt: "2026-01-03T18:00:00Z"
  },
  // 8. 未完了: 長文の説明
  {
    id: "ID0000000008TASK",
    name: "サイトのバグ調査",
    description: "ログイン画面で特定のアカウントにてエラーが発生する件について、ログを確認し原因を特定する。必要であればIssueを起票する。",
    dueDate: "2026-01-06",
    estimatedMin: 45,
    completedAt: null,
    createdAt: "2026-01-02T11:00:00Z"
  },
  {
    id: "ID0000000009TASK",
    name: "このタスク名は非常に長く設定されており、UIでの表示崩れや省略記号（...）が正しく機能するかを確認するためのテスト用データです。通常は改行されるか、truncate設定であれば省略されるはずです。",
    description: "長いタイトルの表示確認",
    dueDate: "2026-01-20",
    estimatedMin: 90,
    completedAt: null,
    createdAt: "2026-01-03T13:00:00Z"
  }
];

export async function getTasks() {
  return tasks;
}

// // ======= 将来（本番API版）=======
// export async function getTasks() {
//   const response = await fetch('/api/tasks');
//   return response.json();
// }