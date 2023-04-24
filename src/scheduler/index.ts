import { useMemo } from 'react'
import { useCacheFn } from '../callback/cache'

export function batchFunction<T, F>(fn: (value: T[]) => F): (value: T) => Promise<F> {
  let queue: T[] = []

  let timeID: number | undefined

  const resolveQueue: ((value: F) => void)[] = []

  return value => {
    if (timeID === undefined) {
      timeID = requestAnimationFrame(() => {
        const result = fn(queue)
        queue = []
        resolveQueue.forEach(res => {
          res(result)
        })
        timeID = undefined
      })
    }
    queue.push(value)
    return new Promise(res => {
      resolveQueue.push(res)
    })
  }
}

export function useBatchFunction<T, F>(_callback: (value: T[]) => F): (value: T) => Promise<F> {
  const callbackCache = useCacheFn(_callback)

  return useMemo(() => batchFunction(callbackCache), [callbackCache])
}
