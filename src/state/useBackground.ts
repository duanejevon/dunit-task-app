import { useCallback, useEffect, useState } from "react";
import { BUILTIN_BACKGROUNDS } from "../assets/backgrounds";
import type { BackgroundSelection } from "../shared/types";
import { toErrorMessage } from "./errorMessage";

function resolveUrl(selection: BackgroundSelection): string | null {
  if (selection.type === "custom") return selection.url;
  return BUILTIN_BACKGROUNDS.find((bg) => bg.id === selection.id)?.url ?? null;
}

function applyToDocument(selection: BackgroundSelection) {
  const url = resolveUrl(selection);
  document.documentElement.style.setProperty("--app-bg-image", url ? `url("${url}")` : "none");
}

export function useBackground() {
  const [selection, setSelection] = useState<BackgroundSelection | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const current = await window.taskApi.settings.getBackground();
    setSelection(current);
    applyToDocument(current);
    setError(null);
  }, []);

  useEffect(() => {
    refresh().catch((err) => setError(toErrorMessage(err)));
  }, [refresh]);

  const selectBuiltin = useCallback(async (id: string) => {
    try {
      const next = await window.taskApi.settings.setBuiltinBackground(id);
      setSelection(next);
      applyToDocument(next);
      setError(null);
    } catch (err) {
      setError(toErrorMessage(err));
    }
  }, []);

  const browseForImage = useCallback(async () => {
    try {
      const next = await window.taskApi.settings.browseForBackground();
      if (next) {
        setSelection(next);
        applyToDocument(next);
      }
      setError(null);
    } catch (err) {
      setError(toErrorMessage(err));
    }
  }, []);

  return { selection, error, selectBuiltin, browseForImage, retry: refresh };
}
