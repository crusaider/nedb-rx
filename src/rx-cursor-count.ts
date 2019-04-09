import { bindNodeCallback, Observable } from 'rxjs';

export class RxCursorCount {
  constructor(private c: Nedb.CursorCount) {}
  public exec(): Observable<number> {
    return bindNodeCallback((cb: (err: Error, count: number) => void) => this.c.exec(cb))();
  }
}
