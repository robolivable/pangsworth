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
import { styled } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import Breadcrumbs from '@material-ui/core/Breadcrumbs'
import Link from '@material-ui/core/Link'
import Typography from '@material-ui/core/Typography'

import BaseComponent from './base-component'
import Routes, { SubRoutes } from './index'
import {
  PangRouteDrawer,
  PangDataViewDrawer,
  getDarkTheme,
  DARK_CONTRAST_COLOR,
  LIGHT_CONTRAST_COLOR
} from './common'

import Context from '../clients/context'

import * as config from '../clients/config'

const AllRoutes = Object.assign(
  {},
  Routes,
  Object.values(SubRoutes).reduce(
    (prev, curr) => Object.assign(prev, curr), {}
  )
)

const BREADCRUMBS_MAX_ITEMS = 5

const RootDiv = styled('div')(props => ({
  display: 'flex',
  color: `rgba(${getDarkTheme(props) ? DARK_CONTRAST_COLOR : LIGHT_CONTRAST_COLOR} / 80%)`
}))

const BGImage = styled('div')(props => ({
  minHeight: '-webkit-fill-available',
  minWidth: '-webkit-fill-available',
  backgroundImage: `url('images/background-${getDarkTheme(props) ? 'dark' : 'light'}.jpg')`,
  position: 'fixed'
}))

const Main = styled('div')(() => ({
  width: '-webkit-fill-available',
  height: '-webkit-fill-available'
}))

const MainBreadcrumbs = styled('div')(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(1),
  position: 'fixed',
  zIndex: '1',
  overflowX: 'auto',
  backdropFilter: 'blur(5px)'
}))

const DataViewerBreadcrumbs = styled('div')(({ theme }) => ({
  display: 'flex',
  margin: theme.spacing(1),
  zIndex: '999',
  overflowX: 'auto',
  backdropFilter: 'blur(5px)',
  position: 'fixed',
  width: 'fit-content'
}))

const PangBreadcrumbs = styled(Breadcrumbs)(props => ({
  color: `rgba(${getDarkTheme(props) ? DARK_CONTRAST_COLOR : LIGHT_CONTRAST_COLOR} / 80%)`
}))

const MainContent = styled('main')(({ theme }) => ({
  padding: theme.spacing(3),
  paddingTop: theme.spacing(6),
  backdropFilter: 'blur(2px)',
  width: 'inherit',
  height: 'inherit'
}))

const DataViewerContent = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(3),
  position: 'fixed',
  height: '-webkit-fill-available',
  overflowY: 'auto'
}))

export default class Pangsworth extends BaseComponent {
  constructor (props, ...args) {
    super(props, ...args)
    this._handleRouteChange = this._handleRouteChange.bind(this)
    this._handleRouteDrawerStateToggle = this._handleRouteDrawerStateToggle.bind(this)
    this._handleDataViewerDrawerStateToggle = this._handleDataViewerDrawerStateToggle.bind(this)
    this.rerenderParent = this.rerenderParent.bind(this)
    this.PangContext = props.PangContext
    this.PangContext.on(Context.ASK_RERENDER, this.rerenderParent)
    const route = this.PangContext.settings.get(
      config.SETTINGS_VALUE_KEYS.states.tabRoute
    )
    this.state = {
      route: route || Routes.default
    }
  }

  rerenderParent () {
    this.forceUpdate()
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

        <PangRouteDrawer
          PangContext={this.PangContext}
          startState={this.PangContext.settings.get(config.SETTINGS_VALUE_KEYS.states.routeDrawer)}
          onDrawerStateToggle={this._handleRouteDrawerStateToggle}
          items={items.map(([Pangponent, route]) => (
            <Pangponent
              key={route}
              _handleRoute={this._handleRouteChange(route)}
              _handleRouteChangeRef={this._handleRouteChange}
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

        <Main>
          <MainBreadcrumbs>
            <PangBreadcrumbs
              PangContext={this.PangContext}
              aria-label='breadcrumb'
            >
              <Link color='inherit'>
                <Typography color='inherit'>
                  {this.state.route}
                </Typography>
              </Link>
            </PangBreadcrumbs>
          </MainBreadcrumbs>
          <MainContent>
            {React.createElement(
              // NOTE: Settings is exported as a getter in Routes
              AllRoutes[this.state.route] || Routes[this.state.route],
              { PangContext: this.PangContext }
            )}
          </MainContent>
        </Main>

        <PangDataViewDrawer
          PangContext={this.PangContext}
          startState={this.PangContext.settings.get(config.SETTINGS_VALUE_KEYS.states.dataViewerDrawer)}
          onDrawerStateToggle={this._handleDataViewerDrawerStateToggle}
        >
          <DataViewerBreadcrumbs>
            <PangBreadcrumbs
              PangContext={this.PangContext}
              maxItems={BREADCRUMBS_MAX_ITEMS}
              aria-label='breadcrumb'
            >
              {Array.from(this.PangContext.breadcrumbs?.iter() || []).map(crumb => (
                <Link
                  key={crumb.navigation.id}
                  crumb={crumb}
                  color={this.PangContext.breadcrumbs.isCurrent(crumb) ? 'textPrimary' : 'inherit'}
                  onClick={this.PangContext.breadcrumbs.jumpTo(crumb)}
                >
                  {crumb.navigation.name}
                </Link>
              ))}
            </PangBreadcrumbs>
          </DataViewerBreadcrumbs>
          <DataViewerContent />
        </PangDataViewDrawer>
      </RootDiv>
    )
  }

  _handleRouteChange (route) {
    return fn => e => {
      this.setState({ route })
      this.PangContext.settings.set(
        config.SETTINGS_VALUE_KEYS.states.tabRoute, route
      )
      this.PangContext.saveSettings()
      if (typeof fn !== 'function') {
        return
      }
      return fn(e)
    }
  }

  _handleRouteDrawerStateToggle (state) {
    this.PangContext.settings.set(
      config.SETTINGS_VALUE_KEYS.states.routeDrawer, state
    )
    this.PangContext.saveSettings()
  }

  _handleDataViewerDrawerStateToggle (state) {
    this.PangContext.settings.set(
      config.SETTINGS_VALUE_KEYS.states.dataViewerDrawer, state
    )
    this.PangContext.saveSettings()
  }
}
