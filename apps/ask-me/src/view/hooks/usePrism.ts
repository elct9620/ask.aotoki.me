"use client";

import { useCallback } from "hono/jsx";
import { useDebounce } from "./useDebounce";

export function usePrism(debounceTime = 10) {
  const prismHighlightAll = useCallback(() => {
    if (typeof window !== "undefined" && window.Prism) {
      window.Prism.highlightAll();
    }
  }, []);

  const highlightAll = useDebounce(prismHighlightAll, debounceTime);

  return {
    highlightAll,
  };
}
