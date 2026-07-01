import { closestCenter, DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, type FormEvent, type KeyboardEvent } from "react";
import type { Board } from "../shared/types";
import type { useBackground } from "../state/useBackground";
import { AppMenu } from "./AppMenu";
import { BoardIconPicker } from "./BoardIconPicker";

interface BoardSwitcherProps {
  boards: Board[];
  activeBoardId: number | null;
  onSwitch: (id: number) => void;
  onCreate: (name: string) => void;
  onRename: (id: number, name: string) => void;
  onDelete: (id: number) => void;
  onSetIcon: (id: number, icon: string) => void;
  onBrowseIcon: (id: number) => void;
  onReorder: (boardIds: number[]) => void;
  background: ReturnType<typeof useBackground>;
}

interface SortableBoardItemProps {
  board: Board;
  active: boolean;
  editing: boolean;
  editingName: string;
  onSwitch: (id: number) => void;
  onStartRename: (board: Board) => void;
  onEditingNameChange: (name: string) => void;
  onCommitRename: (id: number) => void;
  onRenameKeyDown: (e: KeyboardEvent<HTMLInputElement>, id: number) => void;
  onDelete: (board: Board) => void;
  onSetIcon: (id: number, icon: string) => void;
  onBrowseIcon: (id: number) => void;
}

function SortableBoardItem({
  board,
  active,
  editing,
  editingName,
  onSwitch,
  onStartRename,
  onEditingNameChange,
  onCommitRename,
  onRenameKeyDown,
  onDelete,
  onSetIcon,
  onBrowseIcon,
}: SortableBoardItemProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: board.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <li ref={setNodeRef} style={style} className={active ? "active" : ""}>
      <span className="board-drag-handle" aria-label="Drag to reorder" {...attributes} {...listeners}>
        ⠿
      </span>
      <BoardIconPicker board={board} onSetIcon={onSetIcon} onBrowseIcon={onBrowseIcon} />
      {editing ? (
        <input
          autoFocus
          className="board-name-input"
          value={editingName}
          onChange={(e) => onEditingNameChange(e.target.value)}
          onBlur={() => onCommitRename(board.id)}
          onKeyDown={(e) => onRenameKeyDown(e, board.id)}
        />
      ) : (
        <button
          type="button"
          className="board-name"
          onClick={() => onSwitch(board.id)}
          onDoubleClick={() => onStartRename(board)}
        >
          {board.name}
        </button>
      )}
      {confirmingDelete ? (
        // In-app confirmation instead of window.confirm(): a native modal can
        // interrupt an in-progress dnd-kit pointer interaction and leave text
        // inputs unusable. See CardItem for the full explanation.
        <div className="delete-confirm">
          <button
            type="button"
            className="delete-confirm-yes"
            aria-label={`Confirm delete ${board.name}`}
            onClick={() => onDelete(board)}
          >
            Delete
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setConfirmingDelete(false)}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="board-delete"
          aria-label={`Delete ${board.name}`}
          onClick={() => setConfirmingDelete(true)}
        >
          ×
        </button>
      )}
    </li>
  );
}

export function BoardSwitcher({
  boards,
  activeBoardId,
  onSwitch,
  onCreate,
  onRename,
  onDelete,
  onSetIcon,
  onBrowseIcon,
  onReorder,
  background,
}: BoardSwitcherProps) {
  const [newName, setNewName] = useState("");
  const [addingBoard, setAddingBoard] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    onCreate(name);
    setNewName("");
    setAddingBoard(false);
  }

  function cancelAddBoard() {
    setNewName("");
    setAddingBoard(false);
  }

  function startRename(board: Board) {
    setEditingId(board.id);
    setEditingName(board.name);
  }

  function commitRename(id: number) {
    const name = editingName.trim();
    if (name) onRename(id, name);
    setEditingId(null);
  }

  function handleRenameKeyDown(e: KeyboardEvent<HTMLInputElement>, id: number) {
    if (e.key === "Enter") commitRename(id);
    if (e.key === "Escape") setEditingId(null);
  }

  function handleDelete(board: Board) {
    onDelete(board.id);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeIndex = boards.findIndex((b) => b.id === active.id);
    const overIndex = boards.findIndex((b) => b.id === over.id);
    if (activeIndex === -1 || overIndex === -1) return;
    onReorder(arrayMove(boards, activeIndex, overIndex).map((b) => b.id));
  }

  return (
    <nav className="board-switcher">
      <div className="board-switcher-header">
        <AppMenu background={background} />
        <h2>Boards</h2>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={boards.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <ul>
            {boards.map((board) => (
              <SortableBoardItem
                key={board.id}
                board={board}
                active={board.id === activeBoardId}
                editing={editingId === board.id}
                editingName={editingName}
                onSwitch={onSwitch}
                onStartRename={startRename}
                onEditingNameChange={setEditingName}
                onCommitRename={commitRename}
                onRenameKeyDown={handleRenameKeyDown}
                onDelete={handleDelete}
                onSetIcon={onSetIcon}
                onBrowseIcon={onBrowseIcon}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      {addingBoard ? (
        <form onSubmit={handleCreate} className="board-create">
          <input
            autoFocus
            placeholder="Board name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && cancelAddBoard()}
          />
          <button type="submit">Add</button>
        </form>
      ) : (
        <button type="button" className="add-trigger" onClick={() => setAddingBoard(true)}>
          + New board
        </button>
      )}
    </nav>
  );
}
