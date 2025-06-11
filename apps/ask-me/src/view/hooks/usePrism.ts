"use client";

import { useCallback } from "hono/jsx";
import { useDebounce } from "./useDebounce";

export function usePrism() {
  const prismHighlightAll = useCallback(() => {
    if (typeof window !== "undefined" && window.Prism) {
      window.Prism.highlightAll();
    }
  }, []);

  const highlightAll = useDebounce(prismHighlightAll, 100);

  return {
    highlightAll,
  };
}
