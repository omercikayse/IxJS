import '../asynciterablehelpers';
import { from } from 'ix/asynciterable';
import { Readable, ReadableOptions } from 'stream';
import { fromNodeStream } from 'ix/asynciterable/fromnodestream';

(() => {
  if (!fromNodeStream || process.env.TEST_NODE_STREAMS !== 'true') {
    return test('not testing node streams because process.env.TEST_NODE_STREAMS !== "true"', () => {
      /**/
    });
  }

  class Counter extends Readable {
    private _index: number;
    private _max: number;

    constructor(options?: ReadableOptions) {
      super(options);
      this._max = 3;
      this._index = 0;
    }

    _read() {
      this.push(++this._index > this._max ? null : `${this._index}`);
    }
  }

  const compare = (a: string, b: string) => Buffer.from(a).compare(Buffer.from(b)) === 0;

  describe(`AsyncIterable#fromNodeStream`, () => {
    test('objectMode: true', async () => {
      const c = new Counter({ objectMode: true });
      const xs = fromNodeStream(c) as AsyncIterable<string>;
      const expected = from(['1', '2', '3']);
      await expect(xs).toEqualStream(expected, compare);
    });

    test('objectMode: false', async () => {
      const c = new Counter({ objectMode: false });
      const xs = fromNodeStream(c) as AsyncIterable<string>;
      const expected = from(['123']);
      await expect(xs).toEqualStream(expected, compare);
    });
  });
})();
