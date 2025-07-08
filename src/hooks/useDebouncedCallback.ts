import { useEffect, useMemo, useRef } from 'react';
import { debounce } from '../utils/debounce';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebouncedCallback<A extends any[]>(
  callback: (...args: A) => void,
  delay: number
): (...args: A) => void {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useMemo(() => debounce((...args: A) => callbackRef.current(...args), delay), [delay]);
}
