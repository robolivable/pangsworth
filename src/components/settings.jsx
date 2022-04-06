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
import { SvgIcon } from '@material-ui/core'

import BaseComponent from './base-component'
import { PangNavigationItem } from './common'
import CogIcon from '../../static/images/cog.svg'

export default class Settings extends BaseComponent {
  render () {
    return (
      <div>TODO Settings</div>
    )
  }
}

Settings.Button = class extends BaseComponent {
  constructor (...args) {
    super(...args)
    this._handleOnClick = this._handleOnClick.bind(this)
    this.i18nKey = 'components:settings:button'
  }

  render () {
    return (
      <PangNavigationItem
        name={this.displayName}
        onClick={this._handleOnClick}
        {...this.props}
      >
        <SvgIcon component={CogIcon} />
      </PangNavigationItem>
    )
  }

  _handleOnClick () {
    console.log('settings, yay!')
  }
}

Settings.NAVIGATION = 'settings'
