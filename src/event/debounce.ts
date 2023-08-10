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
    const now = getCurrentTime();
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

  return useMemo(
    () => debounceWrapper(cacheFn, debounceTime),
    [cacheFn, debounceTime]
  );
}

export class PendingLocker<Args extends any[] = any[], Ret extends any = any> {
  private isLoading = false;

  private fn: (...args: Args) => Promise<Ret>;

  constructor(fn: (...args: Args) => Promise<Ret>) {
    this.fn = fn;
  }

  get loading() {
    return this.isLoading;
  }

  static wrap(fn: (...args: any[]) => Promise<any>) {
    const pendingLocker = new PendingLocker(fn);
    return pendingLocker.call;
  }

  call = async (...args: Args) => {
    if (this.isLoading) return;

    this.isLoading = true;
    try {
      const result = await this.fn(...args);
      return result;
    } finally {
      this.isLoading = false;
    }
  };
}

export function usePendingLock<
  Args extends any[] = any[],
  Ret extends any = any
>(fn: (...args: Args) => Promise<Ret>) {
  const cacheFn = useCacheFn(fn);
  return useMemo(() => new PendingLocker(cacheFn).call, [cacheFn]);
}
