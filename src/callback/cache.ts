import { useCallback, useLayoutEffect, useRef } from 'react';

/**
 * replacement for useEvent
 * return unit callback
 */
export function useCacheFn<Args extends any[], Ret extends any>(
  callback?: (...args: Args) => Ret
): (...args: Args) => typeof callback extends undefined ? undefined : Ret {
  const cacheFn = useRef(callback);
  useLayoutEffect(() => {
    cacheFn.current = callback;
  });

  return useCallback((...args: Args) => {
    return cacheFn.current?.(...args) as any;
  }, []);
}
