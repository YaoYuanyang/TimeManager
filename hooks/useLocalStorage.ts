
import React, { useState, useEffect } from 'react';

// FIX: Removed the explicit return type annotation which was causing the in-browser
// Babel parser to fail. The return type is now correctly inferred by TypeScript
// from the return statement, solving the root compilation error.
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    // FIX: The catch block was missing curly braces, causing a syntax error.
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export default useLocalStorage;
