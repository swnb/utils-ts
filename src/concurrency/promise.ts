type Executor<T> = (
  resolve: (value: T | PromiseLike<T>) => void,
  reject: (reason: any) => void
) => void;

export class AbortAblePromise<T> extends Promise<T> {
  static AbortedError = new Error('promise aborted');

  constructor(executor: Executor<T>, abortedSignal?: AbortSignal) {
    super((resolve, reject) => {
      let isAborted = false;

      const onAbort = () => {
        isAborted = true;
        const reason = abortedSignal?.reason ?? AbortAblePromise.AbortedError;
        reject(reason);
        abortedSignal?.removeEventListener('abort', onAbort);
      };

      abortedSignal?.addEventListener('abort', onAbort);

      executor(
        value => {
          if (isAborted) return;
          resolve(value);
        },
        reason => {
          if (isAborted) return;
          reject(reason);
        }
      );
    });
  }
}
