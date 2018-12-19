/* eslint-disable max-lines */
'use strict'

const {
  VALUES_MAP,
  PERMISSION_CATEGORIES,
  CATEGORIES,
  PERMISSIONS,
} = require('../values')

const name = 'symbolic'

const test = function(perm) {
  return perm.split(COMMA_REGEXP).every(testGroup)
}

const testGroup = function(group) {
  return GROUP_REGEXP.test(group)
}

const COMMA_REGEXP = /\s*,\s*/gu
const GROUP_REGEXP = /^\s*([augo]*)\s*([=+-]?)\s*([xwrXst]*)\s*$/u

const parse = function(symbolic) {
  // eslint-disable-next-line fp/no-mutating-methods
  const tokens = symbolic
    .split(COMMA_REGEXP)
    .map(parseGroup)
    .map(addDefaults)
    .map(normalizeX)
    .flatMap(splitCategories)
    .flatMap(splitAll)
    .flatMap(normalizeOperator)
    .flatMap(splitPermissions)
    .filter(filterInvalidFlag)
    .map(addValue)
    .filter(isUnique)
    .sort(compareTokens)
  return tokens
}

const parseGroup = function(group) {
  const [, categories, operator, permissions] = GROUP_REGEXP.exec(group)
  return { categories, operator, permissions }
}

const addDefaults = function({ categories, operator, permissions }) {
  return {
    categories: ifEmpty(categories, DEFAULT_CATEGORIES),
    operator: ifEmpty(operator, DEFAULT_OPERATOR),
    permissions,
  }
}

const ifEmpty = function(string, defaultValue) {
  return string === '' ? defaultValue : string
}

const DEFAULT_CATEGORIES = 'a'
const DEFAULT_OPERATOR = '='

const normalizeX = function({ categories, operator, permissions }) {
  const permissionsA = permissions.replace(X_REGEXP, 'x')
  return { categories, operator, permissions: permissionsA }
}

const X_REGEXP = /X/gu

const splitCategories = function({ categories, operator, permissions }) {
  return categories
    .split('')
    .map(category => ({ category, operator, permissions }))
}

const splitAll = function({ category, operator, permissions }) {
  if (category !== 'a') {
    return { category, operator, permissions }
  }

  return CATEGORIES.map(categoryA => ({
    category: categoryA,
    operator,
    permissions,
  }))
}

const normalizeOperator = function({ category, operator, permissions }) {
  if (operator === '+') {
    return { category, permissions, add: true }
  }

  if (operator === '-') {
    return { category, permissions, add: false }
  }

  return PERMISSIONS.map(permission => ({
    category,
    permissions: permission,
    add: permissions.includes(permission),
  }))
}

const splitPermissions = function({ category, permissions, add }) {
  if (permissions === '') {
    return []
  }

  return permissions
    .split('')
    .map(permission => ({ category, permission, add }))
}

const filterInvalidFlag = function({ category, permission }) {
  return PERMISSION_CATEGORIES[permission].includes(category)
}

const addValue = function({ category, permission, add }) {
  const value = getValue({ category, permission })
  return { category, permission, add, value }
}

const getValue = function({ category, permission }) {
  return VALUES_MAP[`${category} ${permission}`].value
}

const isUnique = function(value, index, array) {
  return !array.slice(index + 1).some(valueB => hasSameValue(value, valueB))
}

const hasSameValue = function(valueA, valueB) {
  return valueA.value === valueB.value
}

const compareTokens = function(tokenA, tokenB) {
  const attributeA = ATTRIBUTES.find(
    attribute => compare(tokenA, tokenB, attribute) !== 0,
  )

  if (attributeA === undefined) {
    return 0
  }

  return compare(tokenA, tokenB, attributeA)
}

const ATTRIBUTES = ['add', 'value']

const compare = function(tokenA, tokenB, attribute) {
  if (tokenA[attribute] > tokenB[attribute]) {
    return 1
  }

  if (tokenA[attribute] < tokenB[attribute]) {
    return -1
  }

  return 0
}

const serialize = function(tokens) {
  return tokens.flatMap(joinAll)
}

const joinAll = function(token, index, tokens) {
  const sameTokens = Object.entries(tokens).filter(([, tokenB]) =>
    canJoinTokens(token, tokenB),
  )

  if (!shouldJoin(sameTokens, token)) {
    return token
  }

  if (Number(sameTokens[0][0]) !== index) {
    return []
  }

  return { ...token, category: 'a' }
}

const canJoinTokens = function(tokenA, tokenB) {
  return tokenA.permission === tokenB.permission && tokenA.add === tokenB.add
}

const shouldJoin = function(tokens, { permission }) {
  const categories = PERMISSION_CATEGORIES[permission]
  return categories.every(category => hasCategory({ tokens, category }))
}

const hasCategory = function({ tokens, category }) {
  return tokens.some(([, token]) => token.category === category)
}

module.exports = {
  name,
  test,
  parse,
  serialize,
}
/* eslint-enable max-lines */
