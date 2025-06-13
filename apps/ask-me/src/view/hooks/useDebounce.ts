import { useCallback } from "hono/jsx/dom";

/**
 * Custom hook that returns a debounced version of the provided function
 * @param callback The function to debounce
 * @param delay The delay in milliseconds
 * @returns A debounced version of the callback
 */
export const useDebounce = <T extends (...args: any[]) => void>(
  callback: T,
  delay: number,
): T => {
  const debouncedCallback = useCallback(
    (() => {
      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      return ((...args: Parameters<T>) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => callback(...args), delay);
      }) as T;
    })(),
    [callback, delay],
  );

  return debouncedCallback;
};
