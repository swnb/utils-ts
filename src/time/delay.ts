export async function delay(ms: number) {
  return new Promise<void>(res => {
    setTimeout(res, ms);
  });
}

const defaultTimeoutError = new Error('timeout');

export async function delayThrow(ms: number, error: any = defaultTimeoutError) {
  await delay(ms);
  throw error;
}
