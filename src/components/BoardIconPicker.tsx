import { useEffect, useRef, useState } from "react";
import type { Board } from "../shared/types";

const EMOJI_OPTIONS = [
  "📋", "🚀", "💡", "🎯", "📌", "🗂️", "✅", "🔥",
  "🎨", "🛠️", "📚", "💼", "🏠", "🎮", "🎵", "🌱",
];

interface BoardIconPickerProps {
  board: Board;
  onSetIcon: (id: number, icon: string) => void;
  onBrowseIcon: (id: number) => void;
}

export function BoardIconPicker({ board, onSetIcon, onBrowseIcon }: BoardIconPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const isCustomImage = board.icon?.startsWith("file://") ?? false;

  return (
    <div className="board-icon-picker" ref={ref}>
      <button
        type="button"
        className="board-icon-trigger"
        aria-label={`Change icon for ${board.name}`}
        onClick={() => setOpen((v) => !v)}
      >
        {isCustomImage ? (
          <img src={board.icon ?? undefined} alt="" className="board-icon-image" />
        ) : (
          <span>{board.icon ?? "📋"}</span>
        )}
      </button>
      {open && (
        <div className="board-icon-panel">
          <div className="board-icon-grid">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="board-icon-option"
                onClick={() => {
                  onSetIcon(board.id, emoji);
                  setOpen(false);
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn-secondary board-icon-browse"
            onClick={() => {
              onBrowseIcon(board.id);
              setOpen(false);
            }}
          >
            Custom image…
          </button>
        </div>
      )}
    </div>
  );
}
