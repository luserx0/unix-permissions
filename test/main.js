'use strict'

const test = require('ava')

const {
  getType,
  convert: { symbolic, number, stat, octal, object },
  normalize,
  full,
  contains,
  set,
  unset,
  not,
  flip,
} = require('../localpack')

test('Dummy test', t => {
  ;[
    getType,
    symbolic,
    number,
    stat,
    octal,
    object,
    normalize,
    full,
    contains,
    set,
    unset,
    not,
    flip,
  ].forEach(
    // eslint-disable-next-line max-nested-callbacks
    func => t.is(typeof func, 'function'),
  )
})
