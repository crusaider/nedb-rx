import * as Datastore from 'nedb';
import { bindNodeCallback, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RxCursors } from './rx-cursors';
import { RxUpdateResult } from './rx-update-result';

export class RxDatastore<T> {
  private ds: Datastore;
  // tslint:disable-next-line:variable-name
  private _cursors: RxCursors<T>;

  constructor(pathOrOptions?: string | Nedb.DataStoreOptions) {
    this.ds = new Datastore(pathOrOptions);
    this._cursors = new RxCursors<T>(this.ds);
  }

  get cursors(): RxCursors<T> {
    return this._cursors;
  }

  public loadDatabase(): Observable<void> {
    return bindNodeCallback(this.ds.loadDatabase)();
  }

  public ensureIndex(options: Datastore.EnsureIndexOptions): Observable<void> {
    return bindNodeCallback((o: Datastore.EnsureIndexOptions, cb: (e: Error) => void) => this.ds.ensureIndex(o, cb))(
      options,
    );
  }

  public insert(newDoc: T): Observable<T> {
    return bindNodeCallback((nd: T, cb: (err: Error, d: T) => void) => this.ds.insert(nd, cb))(newDoc);
  }

  public update(query: any, update: any, options?: Datastore.UpdateOptions): Observable<RxUpdateResult> {
    options = options ? options : {};
    return bindNodeCallback(
      (
        q: any,
        uq: any,
        o?: Nedb.UpdateOptions,
        cb?: (err: Error, numberOfUpdated: number, affectedDocuments: any, upsert: boolean) => void,
      ) => this.ds.update<T>(q, uq, o, cb),
    )(query, update, options).pipe(
      map(result => {
        if (result instanceof Array) {
          return {
            affectedDocuments: result[1],
            numberOfUpdated: result[0],
            upsert: result[2],
          };
        } else {
          return { numberOfUpdated: result };
        }
      }),
    );
  }

  public remove(query: any, options?: Datastore.RemoveOptions): Observable<number> {
    options = options ? options : { multi: false };

    return bindNodeCallback((q: any, o: Datastore.RemoveOptions, cb?: (err: Error, n: number) => void) =>
      this.ds.remove(q, o, cb),
    )(query, options);
  }

  public count(query: any): Observable<number> {
    return bindNodeCallback((q: any, cb: (err: Error, n: number) => void) => this.ds.count(q, cb))(query);
  }

  public find(query: any, projection?: any): Observable<T[]> {
    if (projection) {
      return bindNodeCallback((q: any, p: T, cb: (err: Error, documents: T[]) => void) => this.ds.find<T>(q, p, cb))(
        query,
        projection as T,
      );
    } else {
      return bindNodeCallback((q: any, cb: (err: Error, documents: T[]) => void) => this.ds.find<T>(q, cb))(query);
    }
  }

  public findOne(query: any, projection?: any): Observable<T> {
    if (projection) {
      return bindNodeCallback((q: any, p: T, cb: (err: Error, document: T) => void) => this.ds.findOne(q, p, cb))(
        query,
        projection,
      );
    } else {
      return bindNodeCallback((q: any, cb: (err: Error, document: T) => void) => this.ds.findOne(q, cb))(query);
    }
  }
}
