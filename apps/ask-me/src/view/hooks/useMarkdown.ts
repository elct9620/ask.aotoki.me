"use client";

import createDOMPurify from "dompurify";
import { useCallback } from "hono/jsx";
import { marked } from "marked";

let domPurify: ReturnType<typeof createDOMPurify> | null = null;

if (typeof window !== "undefined") {
  domPurify = createDOMPurify(window);
}

const sanitize = (dirty: string) => {
  if (domPurify) {
    return domPurify.sanitize(dirty);
  }

  return dirty; // Fallback to no sanitization if domPurify is not available
};

export function useMarkdown() {
  const render = useCallback((markdown: string) => {
    return { __html: sanitize(marked.parse(markdown, { async: false })) };
  }, []);

  return {
    render,
  };
}
