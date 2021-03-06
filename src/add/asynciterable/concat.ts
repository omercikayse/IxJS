import { AsyncIterableX } from '../../asynciterable/asynciterablex';
import { concat as concatStatic } from '../../asynciterable/concat';

/** @nocollapse */
AsyncIterableX.concat = concatStatic;

export declare namespace asynciterable {
  let concat: typeof concatStatic;
}

declare module '../../asynciterable/asynciterablex' {
  namespace AsyncIterableX {
    export let concat: typeof concatStatic;
  }
}
