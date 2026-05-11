import { DiaryRow } from "../types";
import { dateKey } from "./date";

export type DiaryMap = Record<string, Record<string, { id?: number; title: string; body: string }>>;

export function rowsToDiaryMap(rows: DiaryRow[]): DiaryMap {
  return rows.reduce<DiaryMap>((map, row) => {
    map[row.user_id] ||= {};
    map[row.user_id][row.entry_date] = {
      id: row.id,
      title: row.title,
      body: row.body,
    };
    return map;
  }, {});
}

export function getEntry(diaries: DiaryMap, userId: string | null, date: Date) {
  if (!userId) return undefined;
  return diaries[userId]?.[dateKey(date)];
}