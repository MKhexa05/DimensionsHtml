import { makeAutoObservable } from 'mobx';

export type LockedAxis = 'none' | 'x' | 'y';

export class Dimension {
  offset: number = 0.5;
  lockedAxis: LockedAxis = 'none';

  constructor() {
    makeAutoObservable(this);
  }

  setOffset(offset: number) {
    this.offset = offset;
  }

  setLockedAxis(axis: LockedAxis) {
    this.lockedAxis = axis;
  }
}
