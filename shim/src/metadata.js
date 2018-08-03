// Adapted from SES/Caja - Copyright (C) 2011 Google Inc.
// https://github.com/google/caja/blob/master/src/com/google/caja/ses/whitelist.js

/**
 * Each JSON record enumerates the disposition of the properties on
 * some corresponding primordial object, with the root record
 * representing the global object. For each such record, the values
 * associated with its property names can be:
 *
 *  => (missing): removes the property.
 *  => (another record): in which case this property is simply
 *     whitelisted and that next record represents the disposition of
 *     the object which is its value. For example, {@code "Object"}
 *     leads to another record explaining what properties {@code
 *     "Object"} may have and how each such property, if present,
 *     and its value should be tamed.
 *  => (whitelisted) in which case this property is simply whitelisted. The
 *     value associated with that property is still traversed and
 *     tamed, but only according to the taming of the objects that
 *     object inherits from. For example, {@code "Object.freeze"} leads
 *     to true, meaning that the {@code "freeze"} property of {@code
 *     Object} should be whitelisted and the value of the property (a
 *     function) should be further tamed only according to the
 *     markings of the other objects it inherits from, like {@code
 *     "Function.prototype"} and {@code "Object.prototype").
 *     If the property is an accessor property, it is not
 *     whitelisted (as invoking an accessor might not be meaningful,
 *     yet the accessor might return a value needing taming).
 *  => (all), in which case this property on this object is whitelisted,
 *     as is this property as inherited by all objects that inherit
 *     from this object. The values associated with all such properties
 *     are still traversed and tamed, but only according to the taming
 *     of the objects that object inherits from. For example, {@code
 *     "Object.prototype.constructor"} leads to ALL, meaning that we
 *     whitelist the {@code "constructor"} property on {@code
 *     Object.prototype} and on every object that inherits from {@code
 *     Object.prototype} that does not have a conflicting mark. Each
 *     of these is tamed as if with true, so that the value of the
 *     property is further tamed according to what other objects it
 *     inherits from.
 *  => (accessor) in which case this accessor property is simply
 *     whitelisted and its getter and/or setter are tamed according to
 *     inheritance. If the property is not an accessor property, its
 *     value is tamed according to inheritance.
 *  => (missing) which suppresses permission inherited.
 *
 * TODO: We want to do for constructor: something weaker than ALL,
 * but rather more like what we do for [[Prototype]] links, which is
 * that it is whitelisted only if it points at an object which is
 * otherwise reachable by a whitelisted path.
 *
 * The members of the whitelist are either
 *
 *  => (uncommented) defined by the ES5.1 normative standard text,
 *  => (questionable) provides a source of non-determinism, in
 *     violation of pure object-capability rules, but allowed anyway
 *     since we've given up on restricting JavaScript to _M_
 *     deterministic subset.
 *  => (ES5 Appendix B) common elements of de facto JavaScript
 *     described by the non-normative Appendix B.
 *  => (Harmless whatwg) extensions documented at
 *     <a href="http://wiki.whatwg.org/wiki/Web_ECMAScript"
 *     >http://wiki.whatwg.org/wiki/Web_ECMAScript</a> that seem to be
 *     harmless. Note that the RegExp constructor extensions on that
 *     page are <b>not harmless</b> and so must not be whitelisted.
 *  => (ES-Harmony proposal) accepted as "proposal" status for
 *     EcmaScript-Harmony.
 * </ul>
 *
 * With the above encoding, there are some sensible whitelists we
 * cannot express, such as marking a property both with s and a JSON
 * record. This is an expedient decision based only on not having
 * encountered such a need. Should we need this extra expressiveness,
 * we'll need to refactor to enable a different encoding.
 */
export const T = 1; // whitelisted if data property (most common)
export const _A_ = 2; // whitelisted if accesssor
export const _M_ = 3; // convert data property to accessor (make it mutable) and whitelist

export const T_T = 2; // whitelisted, and whitelisted on children, if data property
export const M_T = 4; // convert data property to accessor, whitelisted on children

export const whitelist = {
  // http://www.ecma-international.org/ecma-262

  // *** 18.1 Value Properties of the Global Object

  Infinity: T,
  NaN: T,
  undefined: T,

  // *** 18.2 Function Properties of the Global Object
  // eval // UNSAFE
  isFinite: T,
  isNaN: T,
  parseFloat: T,
  parseInt: T,
  decodeURI: T,
  decodeURIComponent: T,
  encodeURI: T,
  encodeURIComponent: T,

  // *** 18.3 Constructor Properties of the Global Object

  // *** 18.3.1 Array

  Array: {
    // 22.1.2 Properties of the Array Constructor
    from: T,
    isArray: T,
    of: T,

    prototype: {
      // 22.1.3 Properties of the Array Prototype Object
      concat: _M_,
      constructor: _M_,
      copyWithin: _M_,
      entries: _M_,
      every: _M_,
      fill: _M_,
      filter: _M_,
      find: _M_,
      findIndex: _M_,
      forEach: _M_,
      includes: _M_,
      indexOf: _M_,
      join: _M_,
      keys: _M_,
      lastIndexOf: _M_,
      map: _M_,
      pop: _M_,
      push: _M_,
      reduce: _M_,
      reduceRight: _M_,
      reverse: _M_,
      shift: _M_,
      slice: _M_,
      some: _M_,
      sort: _M_,
      splice: _M_,
      toLocaleString: _M_,
      totring: _M_,
      unshift: _M_,
      values: _M_,
      [Symbol.iterator]: T,
      [Symbol.unscopables]: T
    }
  },

  Object: {
    // 19.1
    assign: T,
    create: T,
    defineProperties: T,
    defineProperty: T,
    entries: T,
    freeze: T,
    getOwnPropertyDescriptor: T,
    getOwnPropertyDescriptors: T,
    getOwnPropertyNames: T,
    getOwnPropertySymbols: T,
    getPrototypeOf: T,
    is: T,
    isExtensible: T,
    isFrozen: T,
    isSealed: T,
    keys: T,
    preventExtensions: T,
    seal: T,
    setPrototypeOf: T,
    values: T,

    prototype: {
      // B.2.2
      __defineGetter__: T,
      __defineSetter__: T,
      __lookupGetter__: T,
      __lookupSetter__: T,

      constructor: M_T,
      hasOwnProperty: M_T,
      isPrototypeOf: M_T,
      propertyIsEnumerable: M_T,
      toLocaleString: M_T,
      toString: M_T,
      valueOf: M_T,

      // Generally allowed
      [Symbol.iterator]: _T_,
      [Symbol.toPrimitive]: _T_,
      [Symbol.toStringTag]: _T_,
      [Symbol.unscopables]: _T_
    }
  },

  Function: {
    // 19.2
    length: T,
    prototype: {
      apply: T,
      bind: T,
      call: T,
      [Symbol.hasInstance]: ALL,

      // 19.2.4 instances
      length: T_T,
      name: T_T,
      prototype: T_T,
      // arity // deprecated

      // Generally allowed
      [Symbol.species]: A
    }
  },

  Boolean: {
    // 19.3
    prototype: T
  },

  Symbol: {
    // 19.4
    asyncIterator: T,
    for: T,
    hasInstance: T,
    isConcatSpreadable: T,
    iterator: T,
    keyFor: T,
    match: T,
    replace: T,
    search: T,
    species: T,
    split: T,
    toPrimitive: T,
    toStringTag: T,
    unscopables: T,
    prototype: T
  },

  Error: {
    // 19.5
    prototype: {
      name: _M_,
      message: _M_
    }
  },
  // In ES6 the *Error "subclasses" of Error inherit from Error,
  // since constructor inheritance generally mirrors prototype
  // inheritance. As explained at
  // https://code.google.com/p/google-caja/issues/detail?id=1963 ,
  // debug.js hides away the Error constructor itself, and so needs
  // to rewire these "subclass" constructors. Until we have a more
  // general mechanism, please maintain this list of whitelisted
  // subclasses in sync with the list in debug.js of subclasses to
  // be rewired.
  EvalError: {
    prototype: T
  },
  RangeError: {
    prototype: T
  },
  ReferenceError: {
    prototype: T
  },
  SyntaxError: {
    prototype: T
  },
  TypeError: {
    prototype: T
  },
  URIError: {
    prototype: T
  },

  // 20 Numbers and Dates

  Number: {
    // 20.1
    EPSILON: T,
    isFinite: T,
    isInteger: T,
    isNaN: T,
    isSafeInteger: T,
    MAX_SAFE_INTEGER: T,
    MAX_VALUE: T,
    MIN_SAFE_INTEGER: T,
    MIN_VALUE: T,
    NaN: T,
    NEGATIVE_INFINITY: T,
    parseFloat: T,
    parseInt: T,
    POSITIVE_INFINITY: T,
    prototype: {
      toExponential: T,
      toFixed: T,
      toPrecision: T
    }
  },

  Math: {
    // 20.2
    E: T,
    LN10: T,
    LN2: T,
    LOG10E: T,
    LOG2E: T,
    PI: T,
    SQRT1_2: T,
    SQRT2: T,

    abs: T,
    acos: T,
    acosh: T,
    asin: T,
    asinh: T,
    atan: T,
    atanh: T,
    atan2: T,
    cbrt: T,
    ceil: T,
    clz32: T,
    cos: T,
    cosh: T,
    exp: T,
    expm1: T,
    floor: T,
    fround: T,
    hypot: T,
    imul: T,
    log: T,
    log1p: T,
    log10: T,
    log2: T,
    max: T,
    min: T,
    pow: T,
    random: T, // questionable
    round: T,
    sign: T,
    sin: T,
    sinh: T,
    sqrt: T,
    tan: T,
    tanh: T,
    trunc: T
  },

  // no-arg Date constructor is questionable
  Date: {
    // 20.3
    now: T, // questionable
    parse: T,
    UTC: T,
    prototype: {
      // Note: coordinate this list with maintanence of repairES5.js
      getDate: T,
      getDay: T,
      getFullYear: T,
      getHours: T,
      getMilliseconds: T,
      getMinutes: T,
      getMonth: T,
      getSeconds: T,
      getTime: T,
      getTimezoneOffset: T,
      getUTCDate: T,
      getUTCDay: T,
      getUTCFullYear: T,
      getUTCHours: T,
      getUTCMilliseconds: T,
      getUTCMinutes: T,
      getUTCMonth: T,
      getUTCSeconds: T,
      setDate: T,
      setFullYear: T,
      setHours: T,
      setMilliseconds: T,
      setMinutes: T,
      setMonth: T,
      setSeconds: T,
      setTime: T,
      setUTCDate: T,
      setUTCFullYear: T,
      setUTCHours: T,
      setUTCMilliseconds: T,
      setUTCMinutes: T,
      setUTCMonth: T,
      setUTCSeconds: T,
      toDateString: T,
      toISOString: T,
      toJSON: T,
      toLocaleDateString: T,
      toLocaleString: T,
      toLocaleTimeString: T,
      toTimeString: T,
      toUTCString: T,

      // B.2.4
      getYear: T,
      setYear: T,
      toGMTString: T
    }
  },

  // 21 Text Processing

  String: {
    // 21.2
    fromCharCode: T,
    fromCodePoint: T,
    raw: T,
    prototype: {
      charAt: T,
      charCodeAt: T,
      codePointAt: T,
      concat: T,
      endsWith: T,
      includes: T,
      indexOf: T,
      lastIndexOf: T,
      localeCompare: T,
      match: T,
      normalize: T,
      padEnd: T,
      padStart: T,
      repeat: T,
      replace: T,
      search: T,
      slice: T,
      split: T,
      startsWith: T,
      substring: T,
      toLocaleLowerCase: T,
      toLocaleUpperCase: T,
      toLowerCase: T,
      toUpperCase: T,
      trim: T,

      // B.2.3
      substr: T,
      anchor: T,
      big: T,
      blink: T,
      bold: T,
      fixed: T,
      fontcolor: T,
      fontsize: T,
      italics: T,
      link: T,
      small: T,
      strike: T,
      sub: T,
      sup: T,

      trimLeft: T, // non-standard
      trimRight: T, // non-standard

      // 21.1.4 instances
      length: ALL
    }
  },

  RegExp: {
    // 21.2
    prototype: {
      exec: T,
      flags: _A_,
      global: _A_,
      ignoreCase: _A_,
      [Symbol.match]: _A_,
      multiline: _A_,
      [Symbol.replace]: T_T,
      [Symbol.search]: T_T,
      source: _A_,
      [Symbol.split]: T_T,
      sticky: _A_,
      test: T,
      unicode: _A_,
      dotAll: _A_,

      // 21.2.6 instances
      lastIndex: T_T,
      // options // non-std
    }
  },

  // 22 Indexed Collections

  // 22.2 Typed Array stuff

  Int8Array: TypedArrayWhitelist,
  Uint8Array: TypedArrayWhitelist,
  Uint8ClampedArray: TypedArrayWhitelist,
  Int16Array: TypedArrayWhitelist,
  Uint16Array: TypedArrayWhitelist,
  Int32Array: TypedArrayWhitelist,
  Uint32Array: TypedArrayWhitelist,
  Float32Array: TypedArrayWhitelist,
  Float64Array: TypedArrayWhitelist,

  // 23 Keyed Collections          all ES-Harmony

  Map: {
    // 23.1
    prototype: {
      clear: T,
      delete: T,
      entries: T,
      forEach: T,
      get: T,
      has: T,
      keys: T,
      set: T,
      size: _A_,
      values: T
    }
  },

  Set: {
    // 23.2
    prototype: {
      add: T,
      clear: T,
      delete: T,
      entries: T,
      forEach: T,
      has: T,
      keys: T,
      size: _A_,
      values: T
    }
  },

  WeakMap: {
    // 23.3
    prototype: {
      // Note: coordinate this list with maintenance of repairES5.js
      delete: T,
      get: T,
      has: T,
      set: T
    }
  },

  WeakSet: {
    // 23.4
    prototype: {
      add: T,
      delete: T,
      has: T
    }
  },

  // 24 Structured Data

  ArrayBuffer: {
    // 24.1
    isView: T,
    length: T, // does not inherit from Function.prototype on Chrome
    name: T, // ditto
    prototype: {
      byteLength: _A_,
      slice: T
    }
  },

  // 24.2 TODO: Omitting SharedArrayBuffer for now

  DataView: {
    // 24.3
    length: T, // does not inherit from Function.prototype on Chrome
    name: T, // ditto
    // BYTES_PER_ELEMENT // non-standard
    prototype: {
      buffer: _A_,
      byteOffset: _A_,
      byteLength: _A_,
      getFloat32: T,
      getFloat64: T,
      getInt8: T,
      getInt16: T,
      getInt32: T,
      getUint8: T,
      getUint16: T,
      getUint32: T,
      setFloat32: T,
      setFloat64: T,
      setInt8: T,
      setInt16: T,
      setInt32: T,
      setUint8: T,
      setUint16: T,
      setUint32: T
    }
  },

  // 24.4 TODO: Omitting Atomics for now

  JSON: {
    // 24.5
    parse: T,
    stringify: T
  },

  // 25 Control Abstraction Objects

  Promise: {
    // 25.4
    all: T,
    race: T,
    reject: T,
    resolve: T,
    prototype: {
      catch: T,
      then: T,
      finally: T, // proposed ES-Harmony

      // nanoq.js
      get: T,
      put: T,
      del: T,
      post: T,
      invoke: T,
      fapply: T,
      fcall: T,

      // Temporary compat with the old makeQ.js
      send: T,
      delete: T,
      end: T
    }
  },

  // 26 Reflection

  Reflect: {
    // 26.1
    apply: T,
    construct: T,
    defineProperty: T,
    deleteProperty: T,
    get: T,
    getOwnPropertyDescriptor: T,
    getPrototypeOf: T,
    has: T,
    isExtensible: T,
    ownKeys: T,
    preventExtensions: T,
    set: T,
    setPrototypeOf: T
  },

  Proxy: {
    // 26.2
    revocable: T
  },

  // Appendix B

  // B.2.1
  escape: T,
  unescape: T,

  // Other

  StringMap: {
    // A specialized approximation of ES-Harmony's Map.
    prototype: {} // Technically, the methods should be on the prototype,
    // but doing so while preserving encapsulation will be
    // needlessly expensive for current usage.
  }
};
