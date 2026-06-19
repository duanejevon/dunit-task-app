import { useCallback, useEffect, useState } from "react";
import type { Column } from "../shared/types";

export function useColumns(boardId: number | null) {
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (boardId == null) {
      setColumns([]);
      return [];
    }
    const list = await window.taskApi.columns.list(boardId);
    setColumns(list);
    return list;
  }, [boardId]);

  useEffect(() => {
    setLoading(true);
    refresh().then(() => setLoading(false));
  }, [refresh]);

  const createColumn = useCallback(
    async (name: string) => {
      if (boardId == null) return;
      await window.taskApi.columns.create(boardId, name);
      await refresh();
    },
    [boardId, refresh],
  );

  const renameColumn = useCallback(
    async (id: number, name: string) => {
      await window.taskApi.columns.rename(id, name);
      await refresh();
    },
    [refresh],
  );

  const deleteColumn = useCallback(
    async (id: number) => {
      await window.taskApi.columns.delete(id);
      await refresh();
    },
    [refresh],
  );

  return { columns, loading, createColumn, renameColumn, deleteColumn };
}
