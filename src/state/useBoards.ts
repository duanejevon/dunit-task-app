import { useCallback, useEffect, useState } from "react";
import type { Board } from "../shared/types";

const ACTIVE_BOARD_KEY = "taskapp:activeBoardId";

export function useBoards() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<number | null>(() => {
    const stored = localStorage.getItem(ACTIVE_BOARD_KEY);
    return stored ? Number(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const list = await window.taskApi.boards.list();
    setBoards(list);
    return list;
  }, []);

  useEffect(() => {
    refresh().then((list) => {
      setLoading(false);
      setActiveBoardId((current) =>
        current != null && list.some((b) => b.id === current) ? current : list[0]?.id ?? null,
      );
    });
  }, [refresh]);

  useEffect(() => {
    if (activeBoardId != null) {
      localStorage.setItem(ACTIVE_BOARD_KEY, String(activeBoardId));
    } else {
      localStorage.removeItem(ACTIVE_BOARD_KEY);
    }
  }, [activeBoardId]);

  const createBoard = useCallback(
    async (name: string) => {
      const board = await window.taskApi.boards.create(name);
      await refresh();
      setActiveBoardId(board.id);
    },
    [refresh],
  );

  const renameBoard = useCallback(
    async (id: number, name: string) => {
      await window.taskApi.boards.rename(id, name);
      await refresh();
    },
    [refresh],
  );

  const deleteBoard = useCallback(
    async (id: number) => {
      await window.taskApi.boards.delete(id);
      const list = await refresh();
      setActiveBoardId((current) => (current !== id ? current : list[0]?.id ?? null));
    },
    [refresh],
  );

  const switchBoard = useCallback((id: number) => {
    setActiveBoardId(id);
  }, []);

  return { boards, activeBoardId, loading, createBoard, renameBoard, deleteBoard, switchBoard };
}
