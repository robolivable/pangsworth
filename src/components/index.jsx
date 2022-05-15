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
import Search from './search'
import Map from './map'
import World from './world'
import Classes from './classes'
import Monsters from './monsters'
import Items from './items'
import EquipmentSet from './equipment-set'
import Skills from './skills'
import NPCs from './npcs'
import Quests from './quests'
import Achievements from './achievements'
import Settings from './settings'

const Routes = {
  [Search.ROUTE]: Search,
  [Map.ROUTE]: Map
}

const SubRoutes = {
  [Search.ROUTE]: {
    [World.ROUTE]: World,
    [Monsters.ROUTE]: Monsters,
    [Items.ROUTE]: Items,
    [EquipmentSet.ROUTE]: EquipmentSet,
    [Classes.ROUTE]: Classes,
    [Skills.ROUTE]: Skills,
    [NPCs.ROUTE]: NPCs,
    [Quests.ROUTE]: Quests,
    [Achievements.ROUTE]: Achievements
  }
}

// NOTE: defining default prop differently to avoid module.exports conflicts
Object.defineProperty(Routes, 'default', { get: () => Search.ROUTE })

// NOTE: settings component exported differently to bypass dynamic
// loading
Object.defineProperty(Routes, Settings.ROUTE, { get: () => Settings })
// NOTE: HACK: we access this route through code in lowercase
Object.defineProperty(Routes, 'settings', { get: () => Settings })

export default Routes
export {
  SubRoutes
}
