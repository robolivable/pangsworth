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
import Typography from '@material-ui/core/Typography'
import PlaceholderIcon from '../../static/images/placeholder.svg'

import BaseComponent from './base-component'
import Routes, { SubRoutes } from './index'
import {
  PangIcon,
  PangDataText,
  PangNameChip,
  PangLevelChip,
  PangRouteDrawer,
  PangDataViewIcon,
  PangDataViewDrawer,
  DataViewerContentContainer,
  DataViewerGenericComponent,
  getDarkTheme,
  colorForTheme,
  toggleAGTableDarkMode
} from './common'

import Context from '../clients/context'

import * as config from '../config'

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
  color: colorForTheme(props, 80),
  width: 'inherit',
  height: 'inherit'
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
  padding: theme.spacing(1.5),
  position: 'fixed',
  zIndex: '1',
  overflowX: 'auto',
  overflowY: 'clip'
}))

const DataViewerBreadcrumbs = styled('div')(({ theme }) => ({
  display: 'flex',
  margin: theme.spacing(1),
  zIndex: '999',
  overflowX: 'auto',
  overflowY: 'clip',
  backdropFilter: 'blur(5px)',
  position: 'fixed',
  width: 'fit-content'
}))

const PangBreadcrumbs = styled(Breadcrumbs)(props => ({
  color: colorForTheme(props, 80)
}))

const MainContentWrapper = styled('main')(({ theme }) => ({
  paddingTop: theme.spacing(6),
  width: '-webkit-fill-available',
  height: '-webkit-fill-available',
  marginLeft: '-1px' // NOTE: this is to squeeze main content up against nav bar
}))

const MainContent = styled('div')(({ theme }) => ({
  height: 'fit-content'
}))

const DataViewerContentWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(3),
  position: 'fixed',
  width: '-webkit-fill-available',
  height: '-webkit-fill-available',
  overflowY: 'auto',
  overflowX: 'clip'
}))

const useStyles = makeStyles(theme => ({
  pangsworthIcon: {
    width: 170,
    height: 170,
    top: 33,
    left: 188,
    position: 'absolute',
    color: props => colorForTheme(props, 50)
  }
}))

const DataViewerEmptyView = props => {
  const classes = useStyles(props)
  return (
    <DataViewerContentContainer
      Generic={(
        <DataViewerGenericComponent
          Id={(<PangDataText text={'0'} />)}
          Name={<PangDataText text={'Pangsworth'} />}
          Type={<PangDataText text={'Mascot'} />}
          Level={<PangDataText text={'120'} />}
          Rarity={<PangDataText text={'Unique'} />}
          Class={<PangDataText text={'Civilian'} />}
          {...props}
        />
      )}
      Icon={(
        <PangIcon
          component={PlaceholderIcon}
          className={classes.pangsworthIcon}
          viewBox='0 0 975 975'
        />
      )}
      {...props}
    >
      Test children
    </DataViewerContentContainer>
  )
}

// NOTE: Settings is exported as a getter in Routes
const getRoutedPangponent = route => AllRoutes[route] || Routes[route]

export default class Pangsworth extends BaseComponent {
  constructor (props, ...args) {
    super(props, ...args)
    this._handleRouteChange = this._handleRouteChange.bind(this)
    this.handleRouteDrawerStateToggle =
      this.handleRouteDrawerStateToggle.bind(this)
    this.handleDataViewerDrawerStateToggle =
      this.handleDataViewerDrawerStateToggle.bind(this)
    this.rerenderParent = this.rerenderParent.bind(this)
    this.PangContext = props.PangContext
    this.PangContext.on(Context.ASK_RERENDER, this.rerenderParent)
    toggleAGTableDarkMode(getDarkTheme(props))
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
          startState={this.PangContext.settings.get(
            config.SETTINGS_VALUE_KEYS.states.routeDrawer
          )}
          onDrawerStateToggle={this.handleRouteDrawerStateToggle}
          settingsItem={React.createElement(Routes.settings.Button, {
            _handleRoute: this._handleRouteChange(
              Routes.settings.ROUTE
            ),
            PangContext: this.PangContext
          })}
        >
          {items.map(([Pangponent, route]) => (
            <Pangponent
              key={route}
              _handleRoute={this._handleRouteChange(route)}
              _handleRouteChangeRef={this._handleRouteChange}
              PangContext={this.PangContext}
            />
          ))}
        </PangRouteDrawer>

        <Main>
          <MainBreadcrumbs>
            <PangBreadcrumbs
              PangContext={this.PangContext}
              aria-label='breadcrumb'
            >
              <Typography color='inherit'>
                {this.state.route}
              </Typography>
            </PangBreadcrumbs>
          </MainBreadcrumbs>
          <MainContentWrapper>
            <MainContent>
              {React.createElement(
                getRoutedPangponent(this.state.route),
                { PangContext: this.PangContext }
              )}
            </MainContent>
          </MainContentWrapper>
        </Main>

        <PangDataViewDrawer
          PangContext={this.PangContext}
          startState={this.PangContext.settings.get(
            config.SETTINGS_VALUE_KEYS.states.dataViewerDrawer
          )}
          onDrawerStateToggle={this.handleDataViewerDrawerStateToggle}
        >
          <DataViewerBreadcrumbs>
            <PangBreadcrumbs
              PangContext={this.PangContext}
              maxItems={BREADCRUMBS_MAX_ITEMS}
              aria-label='breadcrumb'
            >
              <Typography color='inherit'> > </Typography>
              {Array.from(this.PangContext.breadcrumbs?.iter() || []).map(
                crumb => (
                  <Link
                    key={crumb.navigation.id}
                    crumb={crumb}
                    color={this.PangContext.breadcrumbs.isCurrent(crumb)
                      ? 'textPrimary'
                      : 'inherit'}
                    onClick={this.PangContext.breadcrumbs.jumpTo(crumb)}
                  >
                    {crumb.navigation.name}
                  </Link>
                )
              )}
            </PangBreadcrumbs>
          </DataViewerBreadcrumbs>
          <DataViewerContentWrapper>
            {this.PangContext.currentNavitation
              ? React.createElement(
                getRoutedPangponent(
                  this.PangContext.currentNavigation.route
                ).SingleView,
                {
                  PangContext: this.PangContext,
                  Key: this.PangContext.currentNavigation.key
                }
              ) : <DataViewerEmptyView PangContext={this.PangContext} />}
          </DataViewerContentWrapper>
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

  handleRouteDrawerStateToggle (state) {
    this.PangContext.settings.set(
      config.SETTINGS_VALUE_KEYS.states.routeDrawer, state
    )
    this.PangContext.saveSettings()
  }

  handleDataViewerDrawerStateToggle (state) {
    this.PangContext.settings.set(
      config.SETTINGS_VALUE_KEYS.states.dataViewerDrawer, state
    )
    this.PangContext.saveSettings()
  }
}
