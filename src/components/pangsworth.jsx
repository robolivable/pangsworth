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
import React, { useEffect } from 'react'
import { makeStyles, styled } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import Breadcrumbs from '@material-ui/core/Breadcrumbs'
import Link from '@material-ui/core/Link'
import Typography from '@material-ui/core/Typography'
import PlaceholderIcon from '../../static/images/placeholder.svg'
import Button from '@material-ui/core/Button'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import Popper from '@material-ui/core/Popper'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'

import BaseComponent from './base-component'
import Routes from './index'
import RoutesDirectory, { getRoutedPangponent } from './directory'
import {
  PangIcon,
  PangRouteDrawer,
  PangDataViewDrawer,
  PangDataViewPaperGroup,
  PangDataViewPaperItem,
  DataViewerContentContainer,
  DataViewerGenericComponent,
  getDarkTheme,
  colorForTheme,
  bgColorForTheme,
  toggleAGTableDarkMode
} from './common'

import Context from '../clients/context'

import * as config from '../config'

console.debug('Routes =>', {RoutesDirectory, Routes})

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
  margin: theme.spacing(2),
  marginLeft: theme.spacing(3),
  marginRight: theme.spacing(3),
  zIndex: '999',
  overflowX: 'auto',
  overflowY: 'clip',
  backdropFilter: 'blur(10px)',
  position: 'fixed',
  width: 'inherit'
}))

const PangBreadcrumbs = styled(Breadcrumbs)(props => ({
  color: colorForTheme(props, 80),
  fontSize: '0.9rem'
}))

const useStylesLinks = makeStyles(themes => ({
  root: {
    color: props => colorForTheme(props, 80),
    fontSize: '0.9rem'
  },
  colorTextPrimary: {
    color: props => colorForTheme(props, 100),
    fontWeight: 'bold'
  }
}))

const PangLink = props => {
  const classes = useStylesLinks(props)
  return (
    <Link TypographyClasses={classes} {...props}>{props.children}</Link>
  )
}

const useStylesButtonGroup = makeStyles(() => ({
  root: {
    flexGrow: 1,
    display: 'flex',
    width: '-webkit-fill-available',
  },
  groupedOutlinedHorizontal: {
    '&:not(:last-child)': {
      // HACK: only way to disable this setting is to override it
      borderRightColor: props => colorForTheme(props, 50)
    }
  }
}))

const useStylesBreadcrumbs = makeStyles(themes => ({
  popper: {
    zIndex: 9999,
    width: 350,
    maxHeight: 545,
    backdropFilter: 'blur(50px)',
    overflowY: 'auto',
    border: '1px solid',
    borderColor: props => colorForTheme(props, 50),
    padding: 4
  }
}))

const useStyleButtonSide = makeStyles(themes => ({
  root: {
    flexShrink: 1,
    color: props => colorForTheme(props, 80),
    backgroundColor: props => bgColorForTheme(props, 80),
    borderColor: props => colorForTheme(props, 50),
    '&:disabled': {
      color: props => colorForTheme(props, 20),
      backgroundColor: props => bgColorForTheme(props, 50),
      borderColor: props => colorForTheme(props, 10)
    }
  }
}))

const useStyleButtonMain = makeStyles(themes => ({
  root: {
    flexGrow: 1,
    color: props => colorForTheme(props, 80),
    backgroundColor: props => bgColorForTheme(props, 80),
    borderColor: props => colorForTheme(props, 50),
    '&:disabled': {
      color: props => colorForTheme(props, 20),
      backgroundColor: props => bgColorForTheme(props, 50),
      borderColor: props => colorForTheme(props, 10)
    }
  },
  label: {
    fontSize: '1.5vw',
    whiteSpace: 'nowrap',
    contain: 'content'
  }
}))

const PangBreadcrumbButtons = props => {
  const classes = useStylesBreadcrumbs(props)
  const classesButtonSide = useStyleButtonSide(props)
  const classesButtonMain = useStyleButtonMain(props)
  const classesButtonGroup = useStylesButtonGroup(props)
  const [anchorEl, setAnchorEl] = React.useState(null)

  const handleClick = e => {
    setAnchorEl(anchorEl ? null : e.currentTarget)
  }

  const open = !!anchorEl
  const id = open ? 'simple-popper' : null

  const iconSrc = props.PangContext.currentNavigation?.icon
  const name = props.PangContext.currentNavigation?.name
  const nameColor = props.PangContext.currentNavigation?.nameColor
  const style = { fontWeight: 'bold' }
  if (nameColor) {
    style.color = nameColor
  }

  const handleBackButtonOnClick = () => {
    if (!props.PangContext.breadcrumbs.current.prev) {
      return
    }
    props.PangContext.breadcrumbs.jumpTo(
      props.PangContext.breadcrumbs.current.prev
    )
    props.PangContext.askRerender()
  }

  const handleForwardButtonOnClick = () => {
    if (!props.PangContext.breadcrumbs.current.next) {
      return
    }
    props.PangContext.breadcrumbs.jumpTo(
      props.PangContext.breadcrumbs.current.next
    )
    props.PangContext.askRerender()
  }

  useEffect(() => {
    const mouseClickEventListener = e => {
      if (typeof e !== 'object') {
        return
      }
      switch (e.button) {
        case 3:
          handleBackButtonOnClick()
          break
        case 4:
          handleForwardButtonOnClick()
          break
        default:
          break
      }
    }
    document.addEventListener('mousedown', mouseClickEventListener)
    return () => {
      document.removeEventListener('mousedown', mouseClickEventListener)
    }
  }, [])

  return (
    <ButtonGroup classes={classesButtonGroup} {...props}>
      <Button
        classes={classesButtonSide}
        disabled={!props.PangContext.breadcrumbs?.current.prev}
        onClick={handleBackButtonOnClick}
        {...props}
      >
        <ChevronLeftIcon className={classes.breadbrumbButtons} {...props} />
      </Button>
      <Button
        style={style}
        aria-describedby={id}
        classes={classesButtonMain}
        disabled={!props.PangContext.breadcrumbs?.current}
        onClick={handleClick}
        startIcon={iconSrc ? <CrumbIcon src={iconSrc} /> : null}
        {...props}
      >
        {name || '-'}
      </Button>
      <Popper
        id={id}
        open={open}
        anchorEl={anchorEl}
        className={classes.popper}
        {...props}
      >
        <PangBreadcrumbs
          PangContext={props.PangContext}
          aria-label='breadcrumb'
          separator='›'
          maxItems={Infinity}
        >
          {Array.from(props.PangContext.breadcrumbs?.iter() || []).map(
            crumb => crumb
              ? (
                  <PangLink
                    PangContext={props.PangContext}
                    key={crumb.navigation.id}
                    crumb={crumb}
                    color={props.PangContext.breadcrumbs.isCurrent(crumb)
                      ? 'textPrimary'
                      : 'inherit'}
                    onClick={() => {
                      props.PangContext.breadcrumbs.jumpTo(crumb)
                      props.PangContext.askRerender()
                      handleClick()
                    }}
                    href='#'
                  >
                    <CrumbIcon
                      src={crumb.navigation.icon}
                      style={{ marginBottom: -4 }}
                    />
                    {crumb.navigation.name}
                  </PangLink>
                )
              : null
          )}
        </PangBreadcrumbs>
      </Popper>
      <Button
        classes={classesButtonSide}
        disabled={!props.PangContext.breadcrumbs?.current.next}
        onClick={handleForwardButtonOnClick}
        {...props}
      >
        <ChevronRightIcon className={classes.breadbrumbButtons} {...props} />
      </Button>
    </ButtonGroup>
  )
}

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
  paddingTop: theme.spacing(8),
  position: 'fixed',
  width: '-webkit-fill-available',
  height: '-webkit-fill-available',
  overflowY: 'overlay',
  overflowX: 'clip'
}))

const useStyles = makeStyles(theme => ({
  pangsworthIcon: {
    width: 270,
    height: 170,
    color: props => colorForTheme(props, 15)
  }
}))

const CrumbIcon = styled('img')(({ theme }) => ({
  marginRight: theme.spacing(0.5),
  width: 20,
  height: 20
}))

const DataViewerEmptyView = props => {
  const classes = useStyles(props)
  return (
    <DataViewerContentContainer
      Generic={<DataViewerGenericComponent {...props} />}
      Icon={(
        <PangIcon
          component={PlaceholderIcon}
          className={classes.pangsworthIcon}
          viewBox='-100 0 975 975'
        />
      )}
      {...props}
    >
      <PangDataViewPaperGroup {...props}>
        <PangDataViewPaperItem size={12} {...props}>
          Click on a row to view details
        </PangDataViewPaperItem>
      </PangDataViewPaperGroup>
    </DataViewerContentContainer>
  )
}

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
      route: route || RoutesDirectory.default
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
      Pangponent => Pangponent.ROUTE && ([Pangponent.Button, Pangponent.ROUTE])
    ).filter(o => o)

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
          settingsItem={React.createElement(RoutesDirectory.settings.Button, {
            _handleRoute: this._handleRouteChange(
              RoutesDirectory.settings.ROUTE
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
            <PangBreadcrumbButtons PangContext={this.PangContext} />
          </DataViewerBreadcrumbs>
          <DataViewerContentWrapper>
            {this.PangContext.currentNavigation
              ? (
                  React.createElement(
                    getRoutedPangponent(
                      this.PangContext.currentNavigation.Route
                    ).SingleView,
                    {
                      PangContext: this.PangContext,
                      Key: this.PangContext.currentNavigation.key
                    }
                  )
                )
              : <DataViewerEmptyView PangContext={this.PangContext} />}
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
