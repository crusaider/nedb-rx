import { combineLatest, Observable } from 'rxjs';
import { RxCursor } from './rx-cursor';
import { RxDatastore } from './rx-datastore';
import { Entity, testData } from './rx-datastore.spec';

describe('RxCursor', () => {
  let ds: RxDatastore<Entity>;
  let c: RxCursor<Entity>;

  beforeEach(done => {
    ds = new RxDatastore<Entity>({});
    const tasks: Array<Observable<Entity>> = [];
    testData.forEach(e => tasks.push(ds.insert(e)));
    combineLatest(tasks).subscribe(() => {
      c = ds.cursors.find({});
      done();
    });
  });

  it('sort', done => {
    c.sort({ content: -1 })
      .exec()
      .subscribe(es => {
        expect(es.length).toBe(2);
        expect(es[1].content).toBe('data1');
        done();
      });
  });

  it('exec', done => {
    c.exec().subscribe(es => {
      expect(es.length).toBe(2);
      done();
    });
  });

  it('limit', done => {
    c.limit(1)
      .exec()
      .subscribe(es => {
        expect(es.length).toBe(1);
        done();
      });
  });

  it('skip', done => {
    c.skip(1)
      .exec()
      .subscribe(es => {
        expect(es.length).toBe(1);
        done();
      });
  });

  it('projection', done => {
    c.projection({ content: 0 })
      .exec()
      .subscribe(es => {
        expect(es.length).toBe(2);
        expect(es[0].content).toBeUndefined();
        done();
      });
  });
});
