import { useState, useCallback } from "hono/jsx/dom";

/**
 * A custom hook for toggle state management
 * @param initialState Initial state value (default: false)
 * @returns Object containing state and functions to control it
 */
export function useToggle(initialState = false) {
  const [state, setState] = useState(initialState);

  const toggle = useCallback(() => {
    setState(prevState => !prevState);
  }, []);

  const on = useCallback(() => {
    setState(true);
  }, []);

  const off = useCallback(() => {
    setState(false);
  }, []);

  return {
    state,
    toggle,
    on,
    off
  };
}
