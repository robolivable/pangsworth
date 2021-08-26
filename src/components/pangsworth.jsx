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
import { styled } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'

import Navigation from './index'
import { PangReactiveDrawer } from './common'

const RootDiv = styled('div')(() => ({
  display: 'flex'
}))

const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3)
}))

export default class Pangsworth extends React.Component {
  constructor (...args) {
    super(...args)
    this._handleNavigationChange = this._handleNavigationChange.bind(this)
    this.state = {
      navigation: Navigation.default
    }
  }

  render () {
    const items = Object.values(Navigation).map(
      Pangponent => ([Pangponent.Button, Pangponent.NAVIGATION])
    )
    return (
      <RootDiv>
        <CssBaseline />
        <PangReactiveDrawer
          items={items.map(([Pangponent, navigation]) => (
            <Pangponent
              key={navigation} _handleNavigationChange={
              this._handleNavigationChange(navigation)
            }
            />
          ))}
          settingsItem={React.createElement(Navigation.settings.Button, {
            _handleNavigationChange: this._handleNavigationChange(
              Navigation.settings.NAVIGATION
            )
          })}
        />
        <Main>
          {React.createElement(Navigation[this.state.navigation], {})}
        </Main>
      </RootDiv>
    )
  }

  _handleNavigationChange (navigation) {
    return (fn) => (e) => {
      this.setState({ navigation })
      if (typeof fn !== 'function') {
        return
      }
      return fn(e)
    }
  }
}
