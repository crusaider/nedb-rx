import { bindNodeCallback, Observable } from 'rxjs';

export class RxCursor<T> {
  constructor(private c: Nedb.Cursor<T>) {}

  public sort(query: any): RxCursor<T> {
    return new RxCursor<T>(this.c.sort(query));
  }
  public skip(n: number): RxCursor<T> {
    return new RxCursor<T>(this.c.skip(n));
  }
  public limit(n: number): RxCursor<T> {
    return new RxCursor<T>(this.c.limit(n));
  }
  public projection(query: any): RxCursor<T> {
    return new RxCursor<T>(this.c.projection(query));
  }
  public exec(): Observable<T[]> {
    return bindNodeCallback((cb: (err: Error, documents: T[]) => void) => this.c.exec(cb))();
  }
}
