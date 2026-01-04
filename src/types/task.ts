export type Task = {
  id: string;
  name: string;                   // タスク名（必須）
  description?: string | null;    // 説明（任意）
  dueDate?: string | null;        // 期限（任意・日付文字列）c
  estimatedMin?: number | null;   // 見積り時間（任意・分単位）
  createdAt?: string;             // 作成日時は通常必須（DBで自動生成）
  completedAt?: string | null;    // 完了日時（DBで自動生成？）
};

export type TaskItem = {
  name: string;
  description?: string | null;
  dueDate?: string | null;
  estimatedMin?: number | null;
}