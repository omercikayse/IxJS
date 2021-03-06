import '../asynciterablehelpers';
import { range, throwError } from 'ix/asynciterable';
import { tap } from 'ix/asynciterable/operators';

test('AsyncItearble#tap next', async () => {
  let n = 0;
  let source = range(0, 10).pipe(
    tap({
      next: async x => {
        n += x;
      }
    })
  );

  // tslint:disable-next-line:no-empty
  for await (let _ of source) {
  }

  expect(45).toBe(n);
});

test('AsyncIterable#tap next complete', async () => {
  let n = 0;
  let source = range(0, 10).pipe(
    tap({
      next: async x => {
        n += x;
      },
      complete: async () => {
        n *= 2;
      }
    })
  );

  // tslint:disable-next-line:no-empty
  for await (let _ of source) {
  }

  expect(90).toBe(n);
});

test('AsyncIterable#tap with error', async () => {
  let err = new Error();
  let ok = false;

  try {
    const source = throwError<number>(err).pipe(
      tap({
        error: async e => {
          expect(err).toEqual(e);
          ok = true;
        }
      })
    );

    // tslint:disable-next-line:no-empty
    for await (let _ of source) {
    }
  } catch (e) {
    expect(err).toEqual(e);
  }

  expect(ok).toBeTruthy();
});

test('AsyncItearble#tap with next function', async () => {
  let n = 0;
  let source = range(0, 10).pipe(tap(async x => (n += x)));

  // tslint:disable-next-line:no-empty
  for await (let _ of source) {
  }

  expect(45).toBe(n);
});

class MyObserver {
  public sum: number = 0;
  public done: boolean = false;

  async next(value: number) {
    this.sum += value;
  }

  async complete() {
    this.done = true;
  }
}

test('AsyncItearble#tap with observer class', async () => {
  const obs = new MyObserver();
  const source = range(0, 10).pipe(tap(obs));

  // tslint:disable-next-line:no-empty
  for await (let _ of source) {
  }

  expect(obs.done).toBeTruthy();
  expect(45).toBe(obs.sum);
});
