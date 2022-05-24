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
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import { SvgIcon } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
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
import Collapse from '@material-ui/core/Collapse'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import Fab from '@material-ui/core/Fab'
import * as config from '../config'
import { BuiltinEvents } from '../clients/context'
import { localize } from '../i18n'
import PlaceholderIcon from '../../static/images/placeholder.svg'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Chip from '@material-ui/core/Chip'

import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-balham.css'
import './styles/ag-tables-balham-theme.scss'

const routeDrawerWidth = 200
const dataViewDrawerWidth = 370

export const getDarkTheme =
  props => props.PangContext.settings.get(config.SETTINGS_VALUE_KEYS.darkTheme)
export const setDarkTheme =
  (props, value) => props.PangContext.settings.set(
    config.SETTINGS_VALUE_KEYS.darkTheme, value
  )

export const getBackgroundImageLoading =
  props => props.PangContext.settings.get(
    config.SETTINGS_VALUE_KEYS.backgroundImageLoading
  )
export const setBackgroundImageLoading =
  (props, value) => props.PangContext.settings.set(
    config.SETTINGS_VALUE_KEYS.backgroundImageLoading, value
  )

export const DARK_CONTRAST_COLOR = '255 255 255'
export const LIGHT_CONTRAST_COLOR = '50 50 50'
export const DARK_CONTRAST_BG_COLOR = '30 35 35'
export const LIGHT_CONTRAST_BG_COLOR = '255 255 255'

export const colorForTheme = (props, opacity = 100) => {
  let theme = LIGHT_CONTRAST_COLOR
  if (getDarkTheme(props)) {
    theme = DARK_CONTRAST_COLOR
  }
  return `rgba(${theme} / ${opacity}%)`
}

export const bgColorForTheme = (props, opacity = 100) => {
  let theme = LIGHT_CONTRAST_BG_COLOR
  if (getDarkTheme(props)) {
    theme = DARK_CONTRAST_BG_COLOR
  }
  return `rgba(${theme} / ${opacity}%)`
}

export const ITEM_RARITY_COLORS = {
  common: { display: 'Common', color: 'rgba(34 113 177 / 100%)' },
  rare: { display: 'Rare', color: 'rgba(0 170 0 / 100%)' },
  uncommon: { display: 'Uncommon', color: 'rgba(128 64 0 / 100%)' },
  unique: { display: 'Unique', color: 'rgba(210 0 0 / 100%)' },
  veryrare: { display: 'Very Rare', color: 'rgba(210 0 0 / 100%)' }
}

export const TABLE_FOREGROUND_COLOR_PROP_NAME = '--table-theme-foreground-color'
export const TABLE_HEADER_FOREGROUND_COLOR_PROP_NAME = '--table-theme-header-foreground-color'
export const TABLE_BORDER_COLOR_PROP_NAME = '--table-theme-border-color'
export const TABLE_ROW_BORDER_COLOR_PROP_NAME = '--table-theme-row-border-color'
export const TABLE_HEADER_COLUMN_SEPARATOR_COLOR_PROP_NAME = '--table-theme-header-column-separator-color'
export const TABLE_ROW_HOVER_COLOR_PROP_NAME = '--table-theme-row-hover-color'
export const TABLE_MODAL_OVERLAY_BACKGROUND_COLOR_PROP_NAME = '--table-theme-modal-overlay-background-color'

export const setDocumentRootCSSCustomProperty = (customProp, value) => {
  document.querySelector(':root').style.setProperty(customProp, value)
}

export const setDocumentElementCSSCustomProperty = (element, customProp, value) => {
  document.querySelector(element).style.setProperty(customProp, value)
}

export const toggleAGTableDarkMode = darkModeEnabled => {
  const color = darkModeEnabled ? DARK_CONTRAST_COLOR : LIGHT_CONTRAST_COLOR
  const bgColor = darkModeEnabled ? DARK_CONTRAST_BG_COLOR : LIGHT_CONTRAST_BG_COLOR
  setDocumentRootCSSCustomProperty(TABLE_FOREGROUND_COLOR_PROP_NAME, `rgba(${color} / 80%)`)
  setDocumentRootCSSCustomProperty(TABLE_HEADER_FOREGROUND_COLOR_PROP_NAME, `rgba(${color} / 80%)`)
  setDocumentRootCSSCustomProperty(TABLE_BORDER_COLOR_PROP_NAME, `rgba(${color} / 20%)`)
  setDocumentRootCSSCustomProperty(TABLE_ROW_BORDER_COLOR_PROP_NAME, `rgba(${color} / 20%)`)
  setDocumentRootCSSCustomProperty(TABLE_HEADER_COLUMN_SEPARATOR_COLOR_PROP_NAME, `rgba(${color} / 20%)`)
  setDocumentRootCSSCustomProperty(TABLE_ROW_HOVER_COLOR_PROP_NAME, `rgba(${color} / 20%)`)
  setDocumentRootCSSCustomProperty(TABLE_MODAL_OVERLAY_BACKGROUND_COLOR_PROP_NAME, `rgba(${bgColor} / 100%)`)
}

const darkThemeForProps = opacity => props => {
  const color =
    getDarkTheme(props) ? DARK_CONTRAST_COLOR : LIGHT_CONTRAST_COLOR
  return `rgba(${color} / ${opacity})`
}

const darkThemeForBGProps = opacity => props => {
  const color =
    getDarkTheme(props) ? DARK_CONTRAST_BG_COLOR : LIGHT_CONTRAST_BG_COLOR
  return `rgba(${color} / ${opacity})`
}

const useStyles = makeStyles(theme => ({
  routeDrawer: {
    flexShrink: 0,
    whiteSpace: 'nowrap',
    backgroundColor: 'rgba(0 0 0 / 0%)',
    borderColor: darkThemeForProps('20%')
  },
  routeDrawerOpen: {
    backgroundColor: 'rgba(0 0 0 / 0%)',
    width: routeDrawerWidth,
    overflowX: 'clip',
    overflowY: 'auto',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    }),
    borderColor: darkThemeForProps('20%')
  },
  routeDrawerClose: {
    backgroundColor: 'rgba(0 0 0 / 0%)',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    overflowX: 'clip',
    overflowY: 'auto',
    width: theme.spacing(5) + 1,
    [theme.breakpoints.up('xs')]: {
      width: theme.spacing(7) + 1
    },
    borderColor: darkThemeForProps('20%')
  },
  routeHeader: {
    flexShrink: 1
  },
  routeBody: {
    flexGrow: 1,
    overflowY: 'auto',
    overflowX: 'clip'
  },
  routeFooter: {
    flexShrink: 1
  },
  textColors: {
    color: darkThemeForProps('90%')
  },
  placeholder: {
    position: 'absolute'
  },
  dividerColors: {
    backgroundColor: darkThemeForProps('20%')
  },
  accordion: {
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    paddingLeft: theme.spacing(1)
  },
  dataViewDrawer: {
    // NOTE: need to unset the following to enable click through for drawer
    zIndex: 'unset !important',
    inset: 'unset !important',
    position: 'unset !important',
    width: dataViewDrawerWidth,
    flexShrink: 0,
    backgroundColor: 'rgba(0 0 0 / 0%)',
    borderColor: darkThemeForProps('20%')
  },
  dataViewDrawerPaper: {
    width: dataViewDrawerWidth,
    height: '-webkit-fill-available',
    backgroundColor: 'rgba(0 0 0 / 0%)',
    borderColor: darkThemeForProps('20%'),
    backdropFilter: 'blur(10px)'
  },
  dataViewDrawerOpenedEdge: {
    position: 'fixed',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'left',
    left: '50%',
    height: '-webkit-fill-available'
  },
  dataViewDrawerClosedEdge: {
    position: 'fixed',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    right: 0,
    paddingTop: theme.spacing(0.5)
  },
  dataViewDrawerOpenedEdgeButton: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    width: 20,
    height: 80,
    backgroundColor: darkThemeForBGProps('80%'),
    color: darkThemeForProps('50%'),
    '&:hover': {
      backgroundColor: 'rgba(100 100 100 / 50%)'
    }
  },
  dataViewDrawerClosedEdgeButton: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    width: 20,
    backgroundColor: darkThemeForBGProps('80%'),
    color: darkThemeForProps('50%'),
    '&:hover': {
      backgroundColor: 'rgba(100 100 100 / 50%)'
    }
  },
  dataViewDrawerContent: {
    width: '-webkit-fill-available',
    height: '-webkit-fill-available'
  },
  agTable: {
    height: '552px'
  },
  dataViewerGenericComponentWrapper: {
    flexGrow: 1,
    height: '100%'
  },
  dataViewContentContainerWrapper: {
    flexGrow: 1,
    height: '100%'
  },
  dataViewContentGenericContainerGrid: {
    height: '200px',
    marginBottom: 0
  },
  dataViewContentUniqueContainerGrid: {
    marginTop: 0
  },
  dataViewContentGenericGrid: {
  },
  dataViewContentGenericSection: {
    padding: theme.spacing(1),
    textAlign: 'center',
    color: props => colorForTheme(props, 80),
    backgroundColor: props => bgColorForTheme(props, 80),
    height: '100%'
  },
  dataViewContentIconGridContainer: {
    flexGrow: 1,
    height: 'inherit'
  },
  dataViewContentIconWrapper: {
    height: '100%'
  },
  dataViewContentIcon: {
    maxHeight: '175px'
  },
  dataViewContentIconCenter: {
    textAlign: 'center'
  },
  dataViewContentIconSection: {
    padding: theme.spacing(1),
    color: props => colorForTheme(props, 80),
    backgroundColor: props => bgColorForTheme(props, 80),
    height: '100%'
  },
  dataViewContentUniqueSection: {
    padding: theme.spacing(1),
    textAlign: 'center',
    color: props => colorForTheme(props, 80),
    backgroundColor: props => bgColorForTheme(props, 80),
    height: '100%'
  }
}))

const useBackdropStyles = makeStyles(theme => ({
  contentBackdrop: {
    backdropFilter: 'blur(10px)'
  }
}))

export const PangRouteDrawer = props => {
  const classes = useStyles(props)
  const [open, setOpen] = useState(!!props.startState)

  const handleRouteDrawer = () => {
    setOpen(!open)
    if (typeof props.onDrawerStateToggle === 'function') {
      props.onDrawerStateToggle(!open)
    }
  }

  return (
    <Drawer
      variant='permanent'
      className={clsx(classes.routeDrawer, {
        [classes.routeDrawerOpen]: open,
        [classes.routeDrawerClose]: !open
      })}
      classes={{
        paper: clsx({
          [classes.routeDrawerOpen]: open,
          [classes.routeDrawerClose]: !open
        })
      }}
    >
      <Tooltip title={open
        ? localize(props.PangContext, 'routeDrawer:button', 'collapse')
        : localize(props.PangContext, 'routeDrawer:button', 'expand')}
      >
        <IconButton
          onClick={handleRouteDrawer}
          className={`${classes.textColors} ${classes.routeHeader}`}
        >
          {!open
            ? <ChevronRightIcon className={classes.textColors} />
            : <ChevronLeftIcon className={classes.textColors} />}
        </IconButton>
      </Tooltip>

      <Divider className={classes.dividerColors} />

      <List className={`${classes.textColors} ${classes.routeBody}`}>
        {props.children}
      </List>

      <Divider className={classes.dividerColors} />

      <List className={`${classes.textColors} ${classes.routeFooter}`}>
        {props.settingsItem}
      </List>
    </Drawer>
  )
}

export const PangIcon = props => <SvgIcon viewBox='0 0 500 476.6' {...props} />

export const PangNavigationItem = props => {
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

export const PangNavigationAccordion = props => {
  const classes = useStyles(props)
  const [state, setState] = useState({
    openAccordion: !!props.startState
  })
  const handleItemClick = e => {
    switch (e.detail) {
      case 2:
        setState(prevState => {
          if (typeof props.onAccordionToggle === 'function') {
            props.onAccordionToggle(!prevState.openAccordion)
          }
          return {
            ...prevState,
            openAccordion: !prevState.openAccordion
          }
        })
        break
      default:
        return props._handleRoute(props.onClick)(e)
    }
  }

  const handleChevronClick = e => {
    e.stopPropagation()
    setState(prevState => {
      if (typeof props.onAccordionToggle === 'function') {
        props.onAccordionToggle(!prevState.openAccordion)
      }
      return {
        ...prevState,
        openAccordion: !prevState.openAccordion
      }
    })
  }

  return (
    <div>
      <Tooltip title={props.title}>
        <div>
          <ListItem
            button
            key={props.name}
            onClick={handleItemClick}
            className={classes.textColors}
          >
            <ListItemIcon className={classes.textColors}>
              <PangIcon component={props.icon} className={classes.textColors} />
            </ListItemIcon>
            <ListItemText primary={props.name} />
            {
              state.openAccordion
                ? <ExpandLess onClick={handleChevronClick} />
                : <ExpandMore onClick={handleChevronClick} />
            }
          </ListItem>
        </div>
      </Tooltip>
      <Collapse in={state.openAccordion} timeout='auto' unmountOnExit>
        {props.children}
      </Collapse>
    </div>
  )
}

export const PangNavigationAccordionItem = props => {
  const classes = useStyles(props)
  return (
    <Tooltip title={props.title}>
      <div>
        <ListItem
          button
          key={props.name}
          onClick={props._handleRoute(props.onClick)}
          className={`${classes.textColors} ${classes.accordion}`}
        >
          <ListItemIcon
            className={`${classes.textColors} ${classes.accordion}`}
          >
            <PangIcon
              component={props.icon}
              className={`${classes.textColors} ${classes.accordion}`}
            />
          </ListItemIcon>
          <ListItemText primary={props.name} />
        </ListItem>
      </div>
    </Tooltip>
  )
}

export const PangDataViewDrawer = props => {
  const classes = useStyles(props)
  const [open, setOpen] = useState(!!props.startState)

  const onStateToggle = v => {
    if (typeof props.onDrawerStateToggle === 'function') {
      props.onDrawerStateToggle(v)
    }
  }

  const handleDataViewDrawerOpen = () => {
    setOpen(true)
    onStateToggle(true)
  }

  const handleDataViewDrawerClose = e => {
    e.stopPropagation()
    setOpen(false)
    onStateToggle(false)
  }

  props.PangContext.on(BuiltinEvents.NAVIGATE_SINGLE_ITEM, () => {
    setOpen(true)
  })

  return (
    <div>
      {open
        ? (
          <div className={classes.dataViewDrawerOpenedEdge}>
            <Fab
              aria-label='chevron'
              size='small'
              onClick={handleDataViewDrawerClose}
              className={classes.dataViewDrawerOpenedEdgeButton}
            >
              <ChevronRightIcon />
            </Fab>
          </div>
          )
        : (
          <div className={classes.dataViewDrawerClosedEdge}>
            <Fab
              aria-label='chevron'
              size='small'
              onClick={handleDataViewDrawerOpen}
              className={classes.dataViewDrawerClosedEdgeButton}
            >
              <ChevronLeftIcon />
            </Fab>
          </div>
          )}
      <Drawer
        variant='temporary'
        anchor='right'
        open={open}
        BackdropProps={{ invisible: true }}
        className={classes.dataViewDrawer}
        classes={{ paper: classes.dataViewDrawerPaper }}
      >
        <div className={classes.dataViewDrawerContent}>
          {props.children}
        </div>
      </Drawer>
    </div>
  )
}

export const PangDataGrid = props => {
  const classes = useStyles(props)
  // eslint-disable-next-line
  const {
    PangContext,
    tableStyle,
    onGridReadyTrigger,
    rowData,
    ...rest
  } = props

  const [gridReady, setGridReady] = useState(false)

  const gridRef = useRef()
  const onGridReady = useCallback(() => {
    gridRef.current.api.sizeColumnsToFit()
    gridRef.current.columnApi.autoSizeAllColumns()
    if (typeof onGridReadyTrigger === 'function') {
      onGridReadyTrigger()
    }
    setGridReady(true)
  }, [])

  // NOTE: this effect is a HACK to get around a bug with AG where onGridReady
  // miss-fires on back-to-back re-renders
  useEffect(() => {
    if (!gridReady) {
      return
    }
    if (!rowData.length) {
      gridRef.current.api.showLoadingOverlay()
    } else {
      gridRef.current.api.hideOverlay()
    }
  }, [gridReady])

  const defaultColDef = useMemo(() => ({
    flex: 1,
    minWidth: 40,
    width: 100,
    hide: true,
    resizable: true
  }), [])

  return (
    <div
      className={`ag-theme-balham ${classes.agTable}`}
      style={tableStyle}
    >
      <AgGridReact
        defaultColDef={defaultColDef}
        {...rest}
        rowData={rowData}
        ref={gridRef}
        onGridReady={onGridReady}
        suppressRowClickSelection
        enableCellTextSelection
        ensureDomOrder
      />
    </div>
  )
}

// TODO: solution for broken image loads
export const PangImg = props => {
  const classes = useStyles(props)
  const { onload, onerror, ...rest } = props
  const [iconVisibility, setIconVisibility] = useState(true)
  const [imgVisibility, setImgVisibility] = useState(false)
  const handleOnError = () => {
    setImgVisibility(false)
    if (typeof onerror === 'function') {
      return onerror()
    }
  }
  const handleOnLoad = () => {
    setIconVisibility(false)
    setImgVisibility(true)
    if (typeof onload === 'function') {
      return onload()
    }
  }
  return (
    <div>
      {iconVisibility
        ? <PangIcon
            component={PlaceholderIcon}
            className={`${classes.textColors}`}
          />
        : null}
      <img
        {...rest}
        onerror={handleOnError}
        onload={handleOnLoad}
        style={imgVisibility ? {} : { display: 'none' }}
      />
    </div>
  )
}

export const PangContentBackdrop = props => {
  const classes = useBackdropStyles(props)
  return <div className={classes.contentBackdrop}>{props.children}</div>
}

export const DataViewerContentContainer = props => {
  const classes = useStyles(props)
  return (
    <div className={classes.dataViewContentContainerWrapper}>
      <Grid
        container
        spacing={1}
        className={classes.dataViewContentGenericContainerGrid}
      >
        <Grid item xs={5} className={classes.dataViewContentGenericGrid}>
          <Paper className={classes.dataViewContentGenericSection}>
            <Grid
              container
              spacing={1}
            >
              <Grid item xs={4}>
                <Grid
                  container
                  spacing={2}
                  direction='column'
                  alignItems='flex-start'
                  justifyContent='flex-start'
                >
                  <Grid item xs={12}>
                    <PangDataText bolder text='ID' />
                  </Grid>
                  <Grid item xs={12}>
                    <PangDataText bolder text='Name' />
                  </Grid>
                  <Grid item xs={12}>
                    <PangDataText bolder text='Type' />
                  </Grid>
                  <Grid item xs={12}>
                    <PangDataText bolder text='Level' />
                  </Grid>
                  <Grid item xs={12}>
                    <PangDataText bolder text='Rarity' />
                  </Grid>
                  <Grid item xs={12}>
                    <PangDataText bolder text='Class' />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={8}>
                {props.Generic}
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={7}>
          <Paper className={classes.dataViewContentIconSection}>
            <Grid
              container
              className={classes.dataViewContentIconGridContainer}
            >
              <Grid item xs={12}>
                <Grid
                  container
                  direction='row'
                  alignItems='center'
                  justifyContent='center'
                  className={classes.dataViewContentIconWrapper}
                >
                  <Grid item xs={12} className={classes.dataViewContentIcon}>
                    <div className={classes.dataViewContentIconCenter}>
                      {props.Icon}
                    </div>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      <Grid
        container
        spacing={1}
        className={classes.dataViewContentUniqueContainerGrid}
      >
        <Grid item xs={12}>
          <Paper className={classes.dataViewContentUniqueSection}>
            {props.children}
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}

export const DataViewerGenericComponent = props => (
  <Grid
    container
    spacing={2}
    direction='column'
    justifyContent='flex-start'
  >
    <Grid item xs={12}>{props.Id}</Grid>
    <Grid item xs={12}>{props.Name}</Grid>
    <Grid item xs={12}>{props.Type}</Grid>
    <Grid item xs={12}>{props.Level}</Grid>
    <Grid item xs={12}>{props.Rarity}</Grid>
    <Grid item xs={12}>{props.Class}</Grid>
  </Grid>
)

const overrideStyle = root => makeStyles({ root })

export const PangDataText = props => {
  const styleProps = {
    fontSize: '0.675rem'
  }
  if (props.bolder) {
    styleProps.fontWeight = 'bolder'
  }
  const style = overrideStyle(styleProps)()
  return (
    <Typography
      classes={{ root: style.root }}
    >
      {props.text}
    </Typography>
  )
}

export const PangNameChip = props => {
  const name = props.name || '[no name]'
  const styleProps = {
    fontSize: '0.675rem'
  }
  if (props.rarity) {
    styleProps.color = ITEM_RARITY_COLORS[props.rarity].color
  }
  const style = overrideStyle(styleProps)()
  const innerLabel = (
    <Typography
      classes={{ root: style.root }}
      variant='subtitle2'
    >
      {name}
    </Typography>
  )
  return (
    <Chip
      size='small'
      label={innerLabel}
      icon={props.leftIcon}
      onDelete={props.rightIcon ? () => {} : null}
      deleteIcon={props.rightIcon}
      {...props}
    />
  )
}

export const PangLevelChip = props => {
  const style = overrideStyle({
    fontSize: '0.675rem'
  })()
  const innerLabel = (
    <Typography
      classes={{ root: style.root }}
    >
      Lv {props.level}
    </Typography>
  )
  return (
    <Chip
      size='small'
      label={innerLabel}
      {...props}
    />
  )
}

export const PangDataViewIcon = props => {
  const classes = useStyles(props)
  return <img src={props.src} className={classes.dataViewContentIcon} />
}
