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
import React from 'react'
import { makeStyles, styled } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import Breadcrumbs from '@material-ui/core/Breadcrumbs'
import Link from '@material-ui/core/Link'

import BaseComponent from './base-component'
import Routes from './index'
import {
  PangReactiveDrawer,
  getDarkTheme,
  DARK_CONTRAST_COLOR,
  LIGHT_CONTRAST_COLOR
} from './common'

import Context from '../clients/context'

const BREADCRUMBS_MAX_ITEMS = 5

const RootDiv = styled('div')(props => ({
  display: 'flex',
  color: `rgba(${getDarkTheme(props) ? DARK_CONTRAST_COLOR : LIGHT_CONTRAST_COLOR} / 80%)`
}))

const MainDiv = styled('div')(() => ({}))

const HeaderBreadcrumbs = styled('div')(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(1),
  position: 'fixed',
  zIndex: '1',
  overflowX: 'auto',
  backdropFilter: 'blur(5px)'
}))

const Main = styled('main')(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(3),
  paddingTop: theme.spacing(6),
  backdropFilter: 'blur(2px)'
}))

const pangStyles = makeStyles({
  textColor: {
    color: props => `rgba(${getDarkTheme(props) ? DARK_CONTRAST_COLOR : LIGHT_CONTRAST_COLOR} / 80%)`
  },
  bgImage: {
    minHeight: '-webkit-fill-available',
    minWidth: '-webkit-fill-available',
    backgroundImage: props => `url('images/background-${getDarkTheme(props) ? 'dark' : 'light'}.jpg')`,
    position: 'fixed'
  }
})

const BGImage = props => {
  const PangStyledClasses = pangStyles(props)
  return <div className={PangStyledClasses.bgImage} />
}

const PangBreadcrumbs = styled(Breadcrumbs)(props => ({
  color: `rgba(${getDarkTheme(props) ? DARK_CONTRAST_COLOR : LIGHT_CONTRAST_COLOR} / 80%)`
}))

export default class Pangsworth extends BaseComponent {
  constructor (...args) {
    super(...args)
    this._handleRouteChange = this._handleRouteChange.bind(this)
    this.PangContext = new Context(Routes.default)
    this.state = {
      route: this.PangContext.currentNavigation.route
    }
  }

  async componentDidMount () {
    await this.PangContext.initialize()
  }

  render () {
    const items = Object.values(Routes).map(
      Pangponent => ([Pangponent.Button, Pangponent.ROUTE])
    )
    return (
      <RootDiv PangContext={this.PangContext}>
        <CssBaseline />
        <BGImage PangContext={this.PangContext} />
        <PangReactiveDrawer
          PangContext={this.PangContext}
          items={items.map(([Pangponent, route]) => (
            <Pangponent
              key={route}
              _handleRoute={this._handleRouteChange(route)}
              PangContext={this.PangContext}
            />
          ))}
          settingsItem={React.createElement(Routes.settings.Button, {
            _handleRoute: this._handleRouteChange(
              Routes.settings.ROUTE
            ),
            PangContext: this.PangContext
          })}
        />
        <MainDiv PangContext={this.PangContext}>
          <HeaderBreadcrumbs PangContext={this.PangContext}>
            <PangBreadcrumbs
              PangContext={this.PangContext}
              maxItems={BREADCRUMBS_MAX_ITEMS}
              aria-label='breadcrumb'
            >
              {Array.from(this.PangContext.breadcrumbs.iter()).map(crumb => (
                <Link key={crumb.navigation.route} underline='hover' color='inherit'>
                  {crumb.navigation.route}
                </Link>
              ))}
            </PangBreadcrumbs>
          </HeaderBreadcrumbs>
          <Main PangContext={this.PangContext}>
            {React.createElement(
              Routes[this.state.route],
              { PangContext: this.PangContext }
            )}
          </Main>
        </MainDiv>
      </RootDiv>
    )
  }

  _handleRouteChange (route) {
    return (fn) => (e) => {
      this.setState({ route })
      this.PangContext.breadcrumbs.resetWith(route)
      if (typeof fn !== 'function') {
        return
      }
      return fn(e)
    }
  }
}
