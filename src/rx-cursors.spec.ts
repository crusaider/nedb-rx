import { combineLatest, Observable } from 'rxjs';
import { RxDatastore } from './rx-datastore';
import { Entity, testData } from './rx-datastore.spec';

const singleQuery = { content: 'data1' };

describe('RxDatastore.cursors', () => {
  let ds: RxDatastore<Entity>;

  beforeEach(done => {
    ds = new RxDatastore<Entity>({});
    const tasks: Array<Observable<Entity>> = [];
    testData.forEach(e => tasks.push(ds.insert(e)));
    combineLatest(tasks).subscribe(() => done());
  });

  it('count', done => {
    ds.cursors
      .count({})
      .exec()
      .subscribe(count => {
        expect(count).toEqual(2);
        done();
      });
  });

  it('find', done => {
    ds.cursors
      .find(singleQuery)
      .exec()
      .subscribe(es => {
        expect(es.length).toBe(1);
        done();
      });
  });

  it('find with projection', done => {
    ds.cursors
      .find(singleQuery, { content: 0 })
      .exec()
      .subscribe(es => {
        expect(es.length).toBe(1);
        expect(es[0].content).toBeUndefined();
        done();
      });
  });
});
