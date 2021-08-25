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

import { PangNavigationButton } from './common'
import EnlightenmentIcon from '../../static/images/enlightenment.svg'

export default class Skills extends React.Component {
  render () {
    return (
      <div>TODO Skills</div>
    )
  }
}

Skills.Button = class extends React.Component {
  constructor (...args) {
    super(...args)
    this._handleOnClick = this._handleOnClick.bind(this)
  }

  render () {
    return (
      <PangNavigationButton
        name="Skills"
        onClick={this._handleOnClick}
        {...this.props}
      >
        <SvgIcon component={EnlightenmentIcon} />
      </PangNavigationButton>
    )
  }

  _handleOnClick () {
    console.log('skills, yay!')
  }
}

Skills.NAVIGATION = 'skills'
