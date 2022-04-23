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
/* eslint-disable react/jsx-handler-names */
import React from 'react'

import BaseComponent from './base-component'
import { PangNavigationItem } from './common'
import BattleGear from '../../static/images/battle-gear.svg'

export default class EquipmentSet extends BaseComponent {
  render () {
    return (
      <div>TODO Equipment set</div>
    )
  }
}

EquipmentSet.Button = class extends BaseComponent {
  constructor (...args) {
    super(...args)
    this._handleOnClick = this._handleOnClick.bind(this)
    this.i18nKey = 'components:equipments:button'
  }

  render () {
    return (
      <PangNavigationItem
        name={this.displayName}
        title={this.displayName}
        onClick={this._handleOnClick}
        icon={BattleGear}
        {...this.props}
      />
    )
  }

  _handleOnClick () {
    console.log('equipment set, yay!')
  }
}

EquipmentSet.ROUTE = 'Equipment Set'
