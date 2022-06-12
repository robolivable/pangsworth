/*
    Pangsworth Info Butler. At your service anywhere in Madrigal.
    Copyright (C) 2021  https://github.com/robolivable

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

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
