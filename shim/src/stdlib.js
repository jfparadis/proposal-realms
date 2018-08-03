import { getOwnPropertyDescriptor, getOwnPropertyNames } from './commons';
import { assert } from './utilities';
import { whitelist } from './metadata';

export function getSharedGlobalDescs(unsafeGlobal) {
  const descriptors = {};
  const sharedGlobalPropertyNames = getOwnPropertyNames(whitelist);

  for (const name of sharedGlobalPropertyNames) {
    const desc = getOwnPropertyDescriptor(unsafeGlobal, name);

    if (desc) {
      // Abort if an accessor is found on the unsafe global object instead of a
      // data property. We should never get into this non standard situation.
      assert('value' in desc, `unexpected accessor on global property: ${name}`);

      descriptors[name] = {
        value: desc.value,
        writable: true,
        configurable: true,
        enumerable: false
      };
    }
  }

  return descriptors;
}
