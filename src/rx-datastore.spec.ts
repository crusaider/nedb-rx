import { combineLatest, Observable } from 'rxjs';
import { RxDatastore } from './rx-datastore';

// tslint:disable-next-line:interface-name
export interface Entity {
  _id?: string;
  content?: string;
}
export const testData: Entity[] = [{ content: 'data1' }, { content: 'data2' }];
const singleQuery = { content: 'data1' };

describe('RxDatastore', () => {
  let ds: RxDatastore<Entity>;

  beforeEach(() => {
    ds = new RxDatastore<Entity>({});
  });

  describe('insert', () => {
    it('should insert a object', done => {
      ds.insert({ content: 'data' }).subscribe(e => {
        expect(e._id).toBeDefined();
        done();
      });
    });
  });

  describe('with some data', () => {
    beforeEach(done => {
      const tasks: Array<Observable<Entity>> = [];
      testData.forEach(e => tasks.push(ds.insert(e)));
      combineLatest(tasks).subscribe(() => done());
    });

    describe('update', () => {
      it('update single', done => {
        ds.update(singleQuery, { content: 'new data' }).subscribe(res => {
          expect(res.numberOfUpdated).toBe(1);
          done();
        });
      });

      it('update multi', done => {
        ds.update({}, { content: 'new data' }, { multi: true }).subscribe(res => {
          expect(res.numberOfUpdated).toBe(2);
          done();
        });
      });

      it('update multi affected', done => {
        ds.update({}, { content: 'new data' }, { multi: true, returnUpdatedDocs: true }).subscribe(res => {
          expect(res.numberOfUpdated).toBe(2);
          expect(res.affectedDocuments.length).toBe(2);
          done();
        });
      });

      it('upsert', done => {
        ds.update({ _id: 'unknown' }, { content: 'Upserted' }, { upsert: true }).subscribe(res => {
          expect(res.numberOfUpdated).toBe(1);
          expect(res.upsert).toBeTruthy();
          expect(res.affectedDocuments).toBeDefined();
          done();
        });
      });
    });

    it('remove', done => {
      ds.remove({ content: 'data1' }, { multi: false }).subscribe(res => {
        expect(res).toBe(1);
        done();
      });
    });

    it('remove default options', done => {
      ds.remove({ content: 'data1' }).subscribe(res => {
        expect(res).toBe(1);
        done();
      });
    });

    it('ensureIndex', done => {
      ds.ensureIndex({ fieldName: 'content', unique: true }).subscribe(() => done());
    });

    it('count', done => {
      ds.count({}).subscribe(count => {
        expect(count).toEqual(2);
        done();
      });
    });

    it('find', done => {
      ds.find(singleQuery).subscribe(es => {
        expect(es.length).toBe(1);
        done();
      });
    });

    it('find with projection', done => {
      ds.find(singleQuery, { content: 0 }).subscribe(es => {
        expect(es.length).toBe(1);
        expect(es[0].content).toBeUndefined();
        done();
      });
    });

    it('findOne', done => {
      ds.findOne({ content: 'data1' }).subscribe(d => {
        expect(d).toBeTruthy();
        done();
      });
    });

    it('findOne with projection', done => {
      ds.findOne({ content: 'data1' }, { content: 0 }).subscribe(d => {
        expect(d).toBeTruthy();
        expect(d.content).toBeUndefined();
        done();
      });
    });
  });
});
