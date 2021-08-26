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
import React from 'react'

import { SvgIcon } from '@material-ui/core'

import { PangNavigationItem } from './common'
import BagIcon from '../../static/images/swap-bag.svg'

export default class Items extends React.Component {
  render () {
    return (
      <div>TODO Items</div>
    )
  }
}

Items.Button = class extends React.Component {
  constructor (...args) {
    super(...args)
    this._handleOnClick = this._handleOnClick.bind(this)
  }

  render () {
    return (
      <PangNavigationItem
        name="Items"
        onClick={this._handleOnClick}
        {...this.props}
      >
        <SvgIcon component={BagIcon} />
      </PangNavigationItem>
    )
  }

  _handleOnClick () {
    console.log('items, yay!')
  }
}

Items.NAVIGATION = 'items'
