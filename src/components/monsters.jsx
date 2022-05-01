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
import { PangNavigationAccordionItem } from './common'
import MimicChestIcon from '../../static/images/mimic-chest.svg'

export default class Monsters extends BaseComponent {
  render () {
    return (
      <div>TODO Monsters</div>
    )
  }
}

Monsters.Button = class extends BaseComponent {
  constructor (...args) {
    super(...args)
    this._handleOnClick = this._handleOnClick.bind(this)
    this.i18nKey = 'components:monsters:button'
  }

  render () {
    return (
      <PangNavigationAccordionItem
        name={this.displayName}
        title={this.displayName}
        onClick={this._handleOnClick}
        icon={MimicChestIcon}
        {...this.props}
      />
    )
  }

  _handleOnClick () {
    console.log('monsters, yay!')
  }
}

Monsters.ROUTE = 'Monsters'
