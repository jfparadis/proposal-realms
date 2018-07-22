import test from 'tape-async';
import sinon from 'sinon';

test('createNewUnsafeRec - browser', async t => {
  t.plan(5);

  const vm = await import('vm');
  const window = vm.runInNewContext(`(0, eval)("'use strict'; this")`);

  const iframe = {
    contentWindow: window,
    style: {}
  };
  const document = {
    createElement() {
      return iframe;
    },
    body: {
      appendChild() {}
    }
  };

  sinon.stub(global, 'document').callsFake(document);

  const { getSharedGlobalDescs } = await import('../../src/stdlib');
  const sharedGlobalDescs = getSharedGlobalDescs(window);

  const allShims = [];
  const { createNewUnsafeRec } = await import('../../src/unsafeRec');
  const actualUnsafeRec = createNewUnsafeRec(allShims);

  t.equal(actualUnsafeRec.unsafeGlobal, window);
  t.deepEqual(Object.keys(actualUnsafeRec.sharedGlobalDescs), Object.keys(sharedGlobalDescs));
  t.equal(actualUnsafeRec.unsafeEval, window.eval);
  t.equal(actualUnsafeRec.unsafeFunction, window.Function);
  t.equal(actualUnsafeRec.allShims, allShims);

  global.restore();
});
