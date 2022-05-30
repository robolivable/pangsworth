import Routes, { SubRoutes } from './index'

const RoutesImport = {}
Object.getOwnPropertyNames(Routes).map(name => {
  const _name = name.toLowerCase()
  RoutesImport[name] = Routes[name]
  RoutesImport[_name] = Routes[name]
})
const SubRoutesImport = {}
Object.getOwnPropertyNames(SubRoutes).map(name => {
  const _name = name.toLowerCase()
  SubRoutesImport[name] = SubRoutes[name]
  SubRoutesImport[_name] = SubRoutes[name]
})

const AllRoutes = Object.assign(
  {},
  RoutesImport,
  Object.values(SubRoutesImport).reduce(
    (prev, curr) => Object.assign(prev, curr), {}
  )
)

const RoutesDirectory = {}
for (const r in Object.getOwnPropertyDescriptors(RoutesImport)) {
  const t = (r + '').toLowerCase()
  RoutesDirectory[t] = RoutesImport[r]
}
for (const r in Object.getOwnPropertyDescriptors(AllRoutes)) {
  const t = (r + '').toLowerCase()
  RoutesDirectory[t] = AllRoutes[r]
}

console.debug('Routes Directory =>', RoutesDirectory)
export const getRoutedPangponent = route => {
  const t = (route + '').toLowerCase()
  return RoutesDirectory[t]
}

export { RoutesDirectory as default }
