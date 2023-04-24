import { useEffect } from 'react';
import { useCacheFn } from '../callback/cache';

/**
 * abortController accept AbortController, and use it's signal to abort async callback
 */
export class CancelAbleController {
  readonly #abortController: AbortController;

  readonly #promise: Promise<void>;

  constructor(abortController: AbortController) {
    this.#abortController = abortController;
    this.#promise = new Promise<void>((res) => {
      this.#abortController.signal.addEventListener('abort', () => {
        res();
      });
    });
  }

  get isAborted() {
    return this.#abortController.signal.aborted;
  }

  get signal() {
    return this.#abortController.signal;
  }

  get promise() {
    return this.#promise;
  }

  /**
   * listen abort event, return cancel callback
   */
  onAborted = (callback: VoidFunction): VoidFunction => {
    this.signal.addEventListener('abort', callback);
    return () => {
      this.signal.removeEventListener('abort', callback);
    };
  };
}

/**
 * extension for useEffect, use async function inside useEffect
 * watch abort use controller's signal or promise
 */
export function useAsyncEffect(
  callback: (cancelSignal: CancelAbleController) => Promise<void>
) {
  const callbackCache = useCacheFn(callback);
  useEffect(() => {
    const aborter = new AbortController();
    callbackCache(new CancelAbleController(aborter));
    return () => {
      aborter.abort();
    };
  }, [callbackCache]);
}
