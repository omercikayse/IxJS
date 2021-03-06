import { AsyncIterableX } from '../asynciterablex';
import { MonoTypeOperatorAsyncFunction } from '../../interfaces';

export class RepeatAsyncIterable<TSource> extends AsyncIterableX<TSource> {
  private _source: AsyncIterable<TSource>;
  private _count: number;

  constructor(source: AsyncIterable<TSource>, count: number) {
    super();
    this._source = source;
    this._count = count;
  }

  async *[Symbol.asyncIterator]() {
    if (this._count === -1) {
      while (1) {
        for await (let item of this._source) {
          yield item;
        }
      }
    } else {
      for (let i = 0; i < this._count; i++) {
        for await (let item of this._source) {
          yield item;
        }
      }
    }
  }
}

export function repeat<TSource>(count: number = -1): MonoTypeOperatorAsyncFunction<TSource> {
  return function repeatOperatorFunction(source: AsyncIterable<TSource>): AsyncIterableX<TSource> {
    return new RepeatAsyncIterable<TSource>(source, count);
  };
}
