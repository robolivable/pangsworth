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

    You can contact the author by email at robolivable@gmail.com.
*/
import World from './world'
import Classes from './classes'
import Monsters from './monsters'
import Items from './items'
import EquipmentSet from './equipment-set'
import Skills from './skills'
import NPCs from './npcs'

const Navigation = {
  [World.NAVIGATION]: World,
  [Monsters.NAVIGATION]: Monsters,
  [Items.NAVIGATION]: Items,
  [EquipmentSet.NAVIGATION]: EquipmentSet,
  [Classes.NAVIGATION]: Classes,
  [Skills.NAVIGATION]: Skills,
  [NPCs.NAVIGATION]: NPCs,
}
Object.defineProperty(Navigation, 'default', { get: () => World.NAVIGATION })

export default Navigation
