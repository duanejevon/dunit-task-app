import { BoardSwitcher } from "./components/BoardSwitcher";
import { useBoards } from "./state/useBoards";

function App() {
  const { boards, activeBoardId, loading, createBoard, renameBoard, deleteBoard, switchBoard } =
    useBoards();
  const activeBoard = boards.find((b) => b.id === activeBoardId) ?? null;

  return (
    <div className="app-shell">
      <BoardSwitcher
        boards={boards}
        activeBoardId={activeBoardId}
        onSwitch={switchBoard}
        onCreate={createBoard}
        onRename={renameBoard}
        onDelete={deleteBoard}
      />
      <main className="board-content">
        {loading ? (
          <p>Loading…</p>
        ) : activeBoard ? (
          <h1>{activeBoard.name}</h1>
        ) : (
          <p>No boards yet — create one to get started.</p>
        )}
      </main>
    </div>
  );
}

export default App;
