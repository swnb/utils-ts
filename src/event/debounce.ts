import { useMemo } from 'react';
import { useCacheFn } from '../callback';

const defaultGetCurrentTime = () => {
  return Date.now();
};

export function throttleWrapper<Args extends any[] = [], Ret extends any = any>(
  f: (...args: Args) => Ret,
  maxEmitTimeGap: number,
  getCurrentTime: () => number = defaultGetCurrentTime
): (...args: Args) => Ret | undefined {
  let lastEmitTime = getCurrentTime();
  return (...args) => {
    let now = getCurrentTime();
    if (now - lastEmitTime >= maxEmitTimeGap) {
      lastEmitTime = now;
      return f(...args);
    }
    return undefined;
  };
}

export function debounceWrapper<Args extends any[] = [], Ret extends any = any>(
  f: (...args: Args) => Ret,
  debounceTime: number
): (...args: Args) => void {
  let timeId: any | undefined;
  return (...args) => {
    if (timeId) clearTimeout(timeId);
    timeId = setTimeout(() => {
      f(...args);
    }, debounceTime);
  };
}

export function useThrottleWrapper<
  Args extends any[] = [],
  Ret extends any = any
>(
  f: (...args: Args) => Ret,
  maxEmitTimeGap: number,
  getCurrentTime: () => number = defaultGetCurrentTime
): (...args: Args) => Ret | undefined {
  const cacheFn = useCacheFn(f);

  const getCurrentTimeCache = useCacheFn(getCurrentTime);

  return useMemo(
    () => throttleWrapper(cacheFn, maxEmitTimeGap, getCurrentTimeCache),
    [cacheFn, maxEmitTimeGap, getCurrentTimeCache]
  );
}

export function useDebounceWrapper<
  Args extends any[] = [],
  Ret extends any = any
>(f: (...args: Args) => Ret, debounceTime: number): (...args: Args) => void {
  const cacheFn = useCacheFn(f);

  return useMemo(() => debounceWrapper(cacheFn, debounceTime), [
    cacheFn,
    debounceTime,
  ]);
}
