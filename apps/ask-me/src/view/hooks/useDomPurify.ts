"use client";

import createDOMPurify from "dompurify";

let domPurify: ReturnType<typeof createDOMPurify> | null = null;

if (typeof window !== "undefined") {
  domPurify = createDOMPurify(window);
}

export function useDomPurify() {
  if (domPurify) {
    return {
      sanitize: (dirty: string) => domPurify.sanitize(dirty),
    };
  }

  return {
    sanitize: (dirty: string) => dirty, // Fallback to no sanitization if domPurify is not available
  };
}
