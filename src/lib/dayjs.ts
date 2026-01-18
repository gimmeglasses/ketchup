import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import isBetween from "dayjs/plugin/isBetween";
import "dayjs/locale/ja";

// プラグインを拡張
dayjs.extend(relativeTime);
dayjs.extend(isBetween);

// 日本語ロケールを設定
dayjs.locale("ja");

export { dayjs };