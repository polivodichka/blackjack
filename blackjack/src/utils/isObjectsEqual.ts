/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
type MyObject = Record<string, any>;

export const isObjectsEqual = (obj1: MyObject, obj2: MyObject): boolean => {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (const key of keys1) {
    const val1 = obj1[key];
    const val2 = obj2[key];
    const areObjects = isObject(val1) && isObject(val2);
    if (areObjects && !isObjectsEqual(val1, val2)) {
      return false;
    }
    if (!areObjects && val1 !== val2) {
      return false;
    }
  }
  return true;
};

const isObject = (obj: any) => {
  return obj === Object(obj);
};
