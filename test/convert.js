'use strict'

const { convert } = require('../localpack')

const { CONVERT_DATA, performChecks } = require('./helpers')

const check = function({ t, arg, type, typeA }) {
  if (isLossy(type, typeA)) {
    t.true(true)
    return
  }

  const argA = convert[typeA](arg)
  const argB = convert[type](argA)
  t.deepEqual(arg, argB)
}

// Conversion between some types loses information
const isLossy = function(type, typeA) {
  return LOSSY_CONVERSIONS.some(
    types => types[0] === type && types[1] === typeA,
  )
}

const LOSSY_CONVERSIONS = [
  ['symbolic', 'number'],
  ['symbolic', 'stat'],
  ['symbolic', 'octal'],
  ['object', 'number'],
  ['object', 'stat'],
  ['object', 'octal'],
  ['octal', 'number'],
  ['octal', 'stat'],
]

performChecks({
  name: "should have idempotent 'convert'",
  data: CONVERT_DATA,
  check,
})
