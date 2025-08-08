"use client";

import { useState, useEffect } from "react";

/**
 * useDebounce hook
 *
 * Returns a debounced version of the provided value that only updates
 * after the specified delay has elapsed without further changes. This is
 * useful for reducing the number of updates triggered by rapid input
 * changes, such as typing into a text field.
 *
 * @param value The value to debounce.
 * @param delay The debounce delay in milliseconds.
 * @returns The debounced value.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}