import { AsyncIterableX } from '../../asynciterable/asynciterablex';
import { generateTime as generateTimeStatic } from '../../asynciterable/generatetime';

/** @nocollapse */
AsyncIterableX.generateTime = generateTimeStatic;

declare module '../../asynciterable/asynciterablex' {
  namespace AsyncIterableX {
    export let generateTime: typeof generateTimeStatic;
  }
}
