import * as Datastore from 'nedb';
import { RxCursor } from './rx-cursor';
import { RxCursorCount } from './rx-cursor-count';

export class RxCursors<T> {
  constructor(private ds: Datastore) {}

  public count(query: any): RxCursorCount {
    return new RxCursorCount(this.ds.count(query));
  }

  public find(query: any, projection?: any): RxCursor<T> {
    if (projection) {
      return new RxCursor<T>(this.ds.find<T>(query, projection));
    } else {
      return new RxCursor<T>(this.ds.find<T>(query));
    }
  }
}
