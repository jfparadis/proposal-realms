// Adapted from SES/Caja - Copyright (C) 2011 Google Inc.
// https://github.com/google/caja/blob/master/src/com/google/caja/ses/startSES.js
// https://github.com/google/caja/blob/master/src/com/google/caja/ses/repairES5.js

// To repair an object is to:
// - Remove non-whitelisted properties
// - Replace data properties with accessors

export function repairProperties(metadata) {
  const {
    getOwnPropertyDescriptors,
    getPrototypeOf,
    prototype: { hasOwnProperty }
  } = Object;
  const { apply, ownKeys } = Reflect;
  const hasOwn = (obj, prop) => apply(hasOwnProperty, obj, [prop]);

  const { T, T_T, A, A_T, whitelist } = metadata;

  /**
   * The whiteTable should map from each path-accessible primordial
   * object to the permit object that describes how it should be
   * cleaned.
   *
   * We initialize the whiteTable only so that getPermit can
   * process "*" inheritance using the whitelist, by walking actual
   * inheritance chains.
   */
  const whiteTable = new Map();

  function register(value, permit) {
    if (value !== Object(value)) {
      return;
    }
    if (whiteTable.has(value)) {
      throw new Error('primordial reachable through multiple paths');
    }
    whiteTable.set(value, permit);
    const descs = getOwnPropertyDescriptors(value);
    ownKeys(permit).forEach(name => {
      // Use gopd to avoid invoking an accessor property.
      // Accessor properties for which permit !== 'maybeAccessor'
      // are caught later by clean().
      if (hasOwn(descs, name)) {
        const desc = descs[name];
        if (hasOwn(desc, 'value')) {
          register(desc.value, permit[name]);
        }
      }
    });
  }

  /**
   * Should the property be whitelisted on the base object,
   * and if so, what is the permit?
   *
   * If it should be permitted, return the permit, which
   * is truthy. If it should not be permitted, return false.
   */
  function getPermit(base, name) {
    let permit = whiteTable.get(base);
    if (permit && hasOwn(permit, name)) {
      return permit[name];
    }
    for (;;) {
      base = getPrototypeOf(base);
      if (base === null) {
        return false;
      }
      permit = whiteTable.get(base);
      if (permit && hasOwn(permit, name)) {
        permit = permit[name];
        if (permit === T_T || permit === M_T) {
          return T;
        }
        return false;
      }
    }
  }

  const cleaningSet = new Set();

  function enqueue(value) {
    if (value !== Object(value)) {
      // Ignore primitives
      return;
    }
    if (cleaningSet.has(value)) {
      throw new Error('primordial reachable through multiple paths');
    }
    cleaningSet.set(value);
  }

  /**
   * Removes all non-whitelisted properties found by recursively and
   * reflectively walking own property chains.
   *
   * <p>Inherited properties are not checked, because we require that
   * inherited-from objects are otherwise reachable by this traversal.
   */
  function doClean(permit, value) {
    const proto = getPrototypeOf(value);
    if (proto !== null && !whiteTable.has(proto)) {
      throw new Error(`unexpected intrinsic ${value}.__proto__`);
    }

    const descs = getOwnPropertyDescriptors(value);
    ownKeys(descs).forEach(name => {
      const desc = descs[name];
      const permit = getPermit(value, name);
      if (permit) {
        if (hasOwn(permit, 'value')) {
          if (permit === T) {
            enqueue(desc.value);
          } else if (permit === M) {
            beMutable(value, desc);
          } else {
            // No accessor allowed
            delete value[name];
          }
        } else {
          if (permit === A) {
            enqueue(desc.get);
            enqueue(desc.set);
          } else {
            // No accessor allowed
            delete value[name];
          }
        }
      } else {
        // No permit
        delete value[name];
      }
    });
  }

  function dequeue() {
    // New values added before forEach() has finished will be visited.
    cleaningSet.forEach(doClean);
  }

  register(whitelist);
  const unsafeGlobal = (0, eval)('"use strict"; this');
  enqueue(unsafeGlobal);
  dequeue();
}
