import { SyncEvent } from '@swnb/event';

export class Locker {
  #isLocking = false;

  #syncEvent = SyncEvent.new<{
    unlock: VoidFunction;
  }>();

  get isLocking() {
    return this.#isLocking;
  }

  static new() {
    return new Locker();
  }

  waitUtilUnlock = async () => {
    if (!this.#isLocking) return;
    await this.#syncEvent.waitUtil('unlock');
  };

  lock = async () => {
    while (this.#isLocking) {
      await this.#syncEvent.waitUtil('unlock');
    }
    this.#isLocking = true;
  };

  tryLock = (): boolean => {
    if (this.#isLocking) return false;

    this.#isLocking = true;

    return true;
  };

  unlock = () => {
    this.#isLocking = false;
    this.#syncEvent.emit('unlock');
  };
}
