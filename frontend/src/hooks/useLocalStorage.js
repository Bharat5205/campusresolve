/**
 * hooks/useLocalStorage.js
 * -------------------------
 * Typed hook for reading/writing localStorage with JSON serialization.
 * Falls back to initialValue if the key doesn't exist or parsing fails.
 */

import { useState } from "react";

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (err) {
      console.warn(`useLocalStorage: Failed to write key "${key}"`, err);
    }
  };

  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (err) {
      console.warn(`useLocalStorage: Failed to remove key "${key}"`, err);
    }
  };

  return [storedValue, setValue, removeValue];
}
