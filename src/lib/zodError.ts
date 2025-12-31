import { z, type ZodError } from "zod";

type TreeNode = {
  errors: string[];
  properties?: Record<string, TreeNode>;
  items?: (TreeNode | null)[];
};

/**
 * ZodError をフィールド別のエラーメッセージ配列に変換します。
 *
 * @param err Zod バリデーションエラーオブジェクト
 * @returns フィールド名をキー、エラーメッセージ配列を値にしたマップ
 */
export function toFieldErrors(err: ZodError): Record<string, string[]> {
  const tree = z.treeifyError(err) as TreeNode;
  const result: Record<string, string[]> = {};

  if (tree.properties) {
    for (const [key, val] of Object.entries(tree.properties)) {
      if (val.errors.length > 0) {
        result[key] = val.errors;
      }
    }
  }

  return result;
}
