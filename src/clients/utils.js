const stripArrayDuplicates = a => {
  const o = {}
  for (const v of a) {
    o[v] = true
  }
  return Object.keys(o)
}

const isObject = o => typeof o === 'object' && !Array.isArray(o) && o !== null
const isArrayOfObjects = a => Array.isArray(a) && isObject(a[0])

module.exports = {
  stripArrayDuplicates,
  isObject,
  isArrayOfObjects
}
