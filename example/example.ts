import { combineLatest, Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { RxDatastore } from './../src/rx-datastore';

// tslint:disable:no-console
// tslint:disable:interface-name

// The types we will use for documents
interface Planet {
  _id: string;
  planet: string;
  system: string;
  inhabited: boolean;
  humans?: { genders: number; eyes?: boolean };
}

const data = [
  {
    _id: 'id1',
    inhabited: false,
    planet: 'Mars',
    satellites: ['Phobos', 'Deimos'],
    system: 'solar',
  },
  {
    _id: 'id2',
    humans: { eyes: true, genders: 2 },
    inhabited: true,
    planet: 'Earth',
    system: 'solar',
  },
  { _id: 'id3', planet: 'Jupiter', system: 'solar', inhabited: false },
  {
    _id: 'id4',
    humans: { genders: 7 },
    inhabited: true,
    planet: 'Omicron Persei 8',
    system: 'futurama',
  },
];

// Create a in memory data store, the constructor accepts the same options
// as the nedb Datastore constructor.
const ds = new RxDatastore<Planet>({});

// Create a insert observable for every element in the data.
const inserts = new Array<Observable<Planet>>();
data.forEach(planet => inserts.push(ds.insert(planet)));

// Execute the inserts concurrently
const insert$ = combineLatest(inserts).pipe(tap(documents => console.log(`${documents.length} planets inserted`)));

// Find inhabited planets
const findInhabited$ = ds
  .find({ inhabited: true })
  .pipe(tap(planets => printPlanets(planets, 'Find inhabited planets')));

// Find planets in the solar system, use a cursor to project only the planet
// name.
const findInSolarSystem$ = ds.cursors
  .find({ system: 'solar' })
  .projection({ planet: 1, _id: 0 })
  .exec()
  .pipe(tap(planets => printPlanets(planets, 'Find in solar system')));

insert$
  .pipe(
    switchMap(() => findInhabited$),
    switchMap(() => findInSolarSystem$),
  )
  .subscribe(() => console.log('\nDone!'));

function printPlanets(planets: Planet[], headline: string) {
  console.log('');
  console.info(headline);
  planets.forEach(planet => console.info(planet));
}
