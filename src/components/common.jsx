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
import clsx from 'clsx'
import { SvgIcon } from '@material-ui/core'
import { makeStyles, styled } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import List from '@material-ui/core/List'
import Divider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Tooltip from '@material-ui/core/Tooltip'

const { localize } = require('../i18n')
const config = require('../clients/config')

const drawerWidth = 240

export const getDarkTheme = props =>
  props.PangContext.settings.get(config.SETTINGS_VALUE_KEYS.darkTheme)
export const setDarkTheme = (props, value) =>
  props.PangContext.settings.set(config.SETTINGS_VALUE_KEYS.darkTheme, value)
export const getBackgroundImageLoading = props =>
  props.PangContext.settings.get(config.SETTINGS_VALUE_KEYS.backgroundImageLoading)
export const setBackgroundImageLoading = (props, value) =>
  props.PangContext.settings.set(config.SETTINGS_VALUE_KEYS.backgroundImageLoading, value)

export const DARK_CONTRAST_COLOR = '255 255 255'
export const LIGHT_CONTRAST_COLOR = '50 50 50'

const useStyles = makeStyles((theme) => ({
  drawer: {
    flexShrink: 0,
    whiteSpace: 'nowrap',
    backgroundColor: 'rgba(0 0 0 / 0%)',
    borderColor: props => `rgba(${getDarkTheme(props) ? DARK_CONTRAST_COLOR : LIGHT_CONTRAST_COLOR} / 30%)`
  },
  drawerOpen: {
    backgroundColor: 'rgba(0 0 0 / 0%)',
    width: drawerWidth,
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    }),
    borderColor: props => `rgba(${getDarkTheme(props) ? DARK_CONTRAST_COLOR : LIGHT_CONTRAST_COLOR} / 30%)`
  },
  drawerClose: {
    backgroundColor: 'rgba(0 0 0 / 0%)',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    overflowX: 'hidden',
    width: theme.spacing(5) + 1,
    [theme.breakpoints.up('xs')]: {
      width: theme.spacing(7) + 1
    },
    borderColor: props => `rgba(${getDarkTheme(props) ? DARK_CONTRAST_COLOR : LIGHT_CONTRAST_COLOR} / 30%)`
  },
  textColors: {
    color: props => `rgba(${getDarkTheme(props) ? DARK_CONTRAST_COLOR : LIGHT_CONTRAST_COLOR} / 90%)`
  },
  dividerColors: {
    backgroundColor: props => `rgba(${getDarkTheme(props) ? DARK_CONTRAST_COLOR : LIGHT_CONTRAST_COLOR} / 30%)`
  }
}))

const NavigationFooterDiv = styled('div')(() => ({
  position: 'absolute',
  bottom: 0,
  width: '-webkit-fill-available'
}))

export function PangReactiveDrawer (props) {
  const classes = useStyles(props)
  const [open, setOpen] = React.useState(false)

  const handleDrawerOpen = () => {
    setOpen(true)
  }

  const handleDrawerClose = () => {
    setOpen(false)
  }

  return (
    <Drawer
      variant='permanent'
      className={clsx(classes.drawer, {
        [classes.drawerOpen]: open,
        [classes.drawerClose]: !open
      })}
      classes={{
        paper: clsx({
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open
        })
      }}
    >
      <Tooltip title={open
        ? localize(props.PangContext, 'drawer:button', 'collapse')
        : localize(props.PangContext, 'drawer:button', 'expand')}
      >
        <IconButton
          onClick={open ? handleDrawerClose : handleDrawerOpen}
          className={classes.textColors}
        >
          {!open
            ? <ChevronRightIcon className={classes.textColors} />
            : <ChevronLeftIcon className={classes.textColors} />}
        </IconButton>
      </Tooltip>
      <Divider className={classes.dividerColors} />
      <List className={classes.textColors}>
        {props.items}
      </List>
      <NavigationFooterDiv className={classes.textColors}>
        <Divider className={classes.dividerColors} />
        <List className={classes.textColors}>
          {props.settingsItem}
        </List>
      </NavigationFooterDiv>
    </Drawer>
  )
}

export function PangIcon (props) {
  return <SvgIcon viewBox='0 0 500 476.6' {...props} />
}

export function PangNavigationItem (props) {
  const classes = useStyles(props)
  return (
    <Tooltip title={props.title}>
      <div>
        <ListItem
          button
          key={props.name}
          onClick={props._handleRoute(props.onClick)}
          className={classes.textColors}
        >
          <ListItemIcon className={classes.textColors}>
            <PangIcon component={props.icon} className={classes.textColors} />
          </ListItemIcon>
          <ListItemText primary={props.name} />
        </ListItem>
      </div>
    </Tooltip>
  )
}
