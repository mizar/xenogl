import { FLOAT, SHORT, UNSIGNED_SHORT, BYTE, UNSIGNED_BYTE, HALF_FLOAT } from './constants';

export function getBytesPerElementByGlType(type: number): number | null {
  if (type === FLOAT) {
    return 4;
  }
  if (type === BYTE || type === UNSIGNED_BYTE) {
    return 1;
  }
  if (type === SHORT || type === UNSIGNED_SHORT || type === HALF_FLOAT) {
    return 2;
  }
  return null;
}
