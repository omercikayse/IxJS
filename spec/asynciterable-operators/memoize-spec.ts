import {
  as,
  concat,
  every,
  from,
  range,
  sequenceEqual,
  throwError,
  toArray,
  zip
} from 'ix/asynciterable';
import { map, memoize, take, tap } from 'ix/asynciterable';
import { hasNext, noNext } from '../asynciterablehelpers';

async function* tick(t: (x: number) => void | Promise<void>) {
  let i = 0;
  while (1) {
    await t(i);
    yield i++;
  }
}

test('AsyncIterable#memoize memoizes effects', async () => {
  let n = 0;
  const rng = as(
    tick(async i => {
      n += i;
    })
  ).pipe(memoize());

  const it1 = rng[Symbol.asyncIterator]();
  const it2 = rng[Symbol.asyncIterator]();

  await hasNext(it1, 0);
  expect(0).toBe(n);

  await hasNext(it1, 1);
  expect(1).toBe(n);

  await hasNext(it1, 2);
  expect(3).toBe(n);
  await hasNext(it2, 0);
  expect(3).toBe(n);

  await hasNext(it1, 3);
  expect(6).toBe(n);
  await hasNext(it2, 1);
  expect(6).toBe(n);

  await hasNext(it2, 2);
  expect(6).toBe(n);
  await hasNext(it2, 3);
  expect(6).toBe(n);

  await hasNext(it2, 4);
  expect(10).toBe(n);
  await hasNext(it1, 4);
  expect(10).toBe(n);
});

test('AsyncIterable#memoize single', async () => {
  const rng = range(0, 5).pipe(memoize());

  const it1 = rng[Symbol.asyncIterator]();

  await hasNext(it1, 0);
  await hasNext(it1, 1);
  await hasNext(it1, 2);
  await hasNext(it1, 3);
  await hasNext(it1, 4);
  await noNext(it1);
});

test('AsyncIterable#memoize order of operations', async () => {
  const rng = range(0, 5).pipe(memoize());

  const it1 = rng[Symbol.asyncIterator]();
  await hasNext(it1, 0);
  await hasNext(it1, 1);
  await hasNext(it1, 2);
  await hasNext(it1, 3);
  await hasNext(it1, 4);
  await noNext(it1);

  const it2 = rng[Symbol.asyncIterator]();
  await hasNext(it2, 0);
  await hasNext(it2, 1);
  await hasNext(it2, 2);
  await hasNext(it2, 3);
  await hasNext(it2, 4);
  await noNext(it2);
});

test('AsyncIterable#memoize second early', async () => {
  const rng = range(0, 5).pipe(memoize());

  const it1 = rng[Symbol.asyncIterator]();
  await hasNext(it1, 0);
  await hasNext(it1, 1);
  await hasNext(it1, 2);

  const it2 = rng[Symbol.asyncIterator]();
  await hasNext(it1, 3);
  await hasNext(it2, 0);
  await hasNext(it2, 1);
  await hasNext(it1, 4);
  await hasNext(it2, 2);
  await noNext(it1);

  await hasNext(it2, 3);
  await hasNext(it2, 4);
  await noNext(it2);
});

test('AsyncIterable#memoize max two readers', async () => {
  const rng = range(0, 5).pipe(memoize(2));

  const it1 = rng[Symbol.asyncIterator]();
  await hasNext(it1, 0);
  await hasNext(it1, 1);
  await hasNext(it1, 2);

  const it2 = rng[Symbol.asyncIterator]();
  await hasNext(it2, 0);
  await hasNext(it2, 1);
  await hasNext(it2, 2);

  const it3 = rng[Symbol.asyncIterator]();
  try {
    await it3.next();
  } catch (e) {
    expect(e != null).toBeTruthy();
  }
});

test('AsyncIterable#memoize concat with error', async () => {
  const error = new Error();
  const rng = concat(range(0, 2), throwError(error)).pipe(memoize());

  const it1 = rng[Symbol.asyncIterator]();
  const it2 = rng[Symbol.asyncIterator]();
  await hasNext(it1, 0);
  await hasNext(it1, 1);
  try {
    await it1.next();
  } catch (e) {
    expect(error).toEqual(e);
  }

  await hasNext(it2, 0);
  await hasNext(it2, 1);
  try {
    await it2.next();
  } catch (e) {
    expect(error).toEqual(e);
  }
});

function getRandom() {
  let min = 0,
    max = Math.pow(2, 53) - 1;
  return Math.floor(Math.random() * (max - min)) + min;
}

async function* rand() {
  while (1) {
    yield getRandom();
  }
}

test('AsyncIterable#memoize should share effects of random', async () => {
  const rnd = as(rand()).pipe(
    take(100),
    memoize()
  );
  expect(await every(zip(async ([l, r]) => l === r, rnd, rnd), async x => x)).toBeTruthy();
});

test('AsyncIterable#memoize with selector', async () => {
  let n = 0;
  const res = await toArray(
    memoize(
      tap(range(0, 4), {
        next: async () => {
          n++;
        }
      }),
      undefined,
      xs => take(zip(async ([l, r]) => l + r, xs, xs), 4)
    )
  );

  expect(await sequenceEqual(from(res), map(range(0, 4), async x => x * 2))).toBeTruthy();
  expect(4).toBe(n);
});

test('AsyncIterable#memoize limited with selector', async () => {
  let n = 0;
  const res = await toArray(
    memoize(
      tap(range(0, 4), {
        next: async () => {
          n++;
        }
      }),
      2,
      xs => take(zip(async ([l, r]) => l + r, xs, xs), 4)
    )
  );

  expect(await sequenceEqual(from(res), map(range(0, 4), async x => x * 2))).toBeTruthy();
  expect(4).toBe(n);
});
