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
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import ReactDOMServer from 'react-dom/server'
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
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import Fab from '@material-ui/core/Fab'
import * as config from '../config'
import * as utils from '../utils'
import * as uiutils from '../uiutils'
import { BuiltinEvents } from '../clients/context'
import { localize } from '../i18n'
import PlaceholderIcon from '../../static/images/placeholder.svg'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Chip from '@material-ui/core/Chip'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import TableContainer from '@material-ui/core/TableContainer'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import Input from '@material-ui/core/Input'
import Slider from '@material-ui/core/Slider'
import Avatar from '@material-ui/core/Avatar'
import ImpactPointIcon from '../../static/images/impact-point.svg'

import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-balham.css'
import './styles/ag-tables-balham-theme.scss'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer } from 'react-leaflet'
import { useMap, useMapEvents } from 'react-leaflet/hooks'
import { Marker } from 'react-leaflet/Marker'
import { Popup } from 'react-leaflet/Popup'

const tableBufferScale = 9

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
    maxWidth: '-webkit-fill-available'
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
    padding: theme.spacing(1.5),
    textAlign: 'center',
    color: props => colorForTheme(props, 80),
    backgroundColor: props => bgColorForTheme(props, 80),
    height: '100%'
  },
  dataViewAccordionContentSection: {
    paddingRight: theme.spacing(1.5),
    paddingLeft: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
    textAlign: 'center',
    color: props => colorForTheme(props, 80),
    backgroundColor: props => bgColorForTheme(props, 80),
    height: '100%'
  },
  dataViewAccordionDetails: {
    padding: 'unset',
  },
  dataViewAccordionExpandIcon: {
    color: props => colorForTheme(props, 80)
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
                ? <ExpandLessIcon onClick={handleChevronClick} />
                : <ExpandMoreIcon onClick={handleChevronClick} />
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


  useEffect(() => {
    const navigateHandler = () => {
      handleDataViewDrawerOpen()
      props.PangContext.askRerender()
    }
    props.PangContext.on(BuiltinEvents.NAVIGATE_SINGLE_ITEM, navigateHandler)
    return () => props.PangContext.off(
      BuiltinEvents.NAVIGATE_SINGLE_ITEM, navigateHandler
    )
  }, [])

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
        disableEnforceFocus
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
    if (!props.noSizeToFit) {
      gridRef.current.api.sizeColumnsToFit()
    }
    if (!props.noAutoSizeAll) {
      gridRef.current.columnApi.autoSizeAllColumns()
    }
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
    minWidth: 100,
    width: 100,
    filter: true,
    hide: false,
    resizable: true,
    sortable: true
  }), [])

  const bufferAreaHeight = (
    uiutils.ROOT_MAX_HEIGHT_PX - uiutils.ROOT_TOP_PADDING_PX
  ) * tableBufferScale
  const rowBuffer = Math.round(bufferAreaHeight / props.rowHeight)

  return (
    <div
      className={`ag-theme-balham ${classes.agTable}`}
      style={tableStyle}
    >
      <AgGridReact
        defaultColDef={defaultColDef}
        rowBuffer={rowBuffer}
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
        {props.Icon ? (
          <Grid item xs={12}>
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
        ) : null}
        <Grid item xs={12} className={classes.dataViewContentGenericGrid}>
          <Paper className={classes.dataViewContentGenericSection}>
            <Grid
              container
              spacing={1}
            >
              <Grid item xs={4} style={{ paddingLeft: 8 }}>
                <Grid
                  container
                  spacing={1}
                  direction='column'
                  alignItems='flex-start'
                  justifyContent='space-between'
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
                    {props.Generic.props.Rarity ? (
                      <PangDataText bolder text='Rarity/Rank' />
                    ) : (
                      <PangDataText bolder text='Scaler' />
                    )}
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
      </Grid>
      {props.children}
    </div>
  )
}

export const DataViewerGenericComponent = props => (
  <Grid
    container
    spacing={1}
    direction='column'
    justifyContent='space-between'
  >
    <Grid item xs={12}>{props.Id || <PangDataText text='-' />}</Grid>
    <Grid item xs={12}>{props.Name || <PangDataText text='-' />}</Grid>
    <Grid item xs={12}>{props.Type || <PangDataText text='-' />}</Grid>
    <Grid item xs={12}>{props.Level || <PangDataText text='-' />}</Grid>
    <Grid item xs={12}>
      {props.Rarity || props.Scaler || <PangDataText text='-' />}
    </Grid>
    <Grid item xs={12}>{props.Class || <PangDataText text='-' />}</Grid>
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
  if (props.littleBigger) {
    styleProps.fontSize = '0.875rem'
  }
  if (props.bigger) {
    styleProps.fontSize = '1.175rem'
  }
  if (props.smaller) {
    styleProps.fontSize = '0.625rem'
  }
  switch (props.color) {
    case 'green':
    case 'rare':
    case 'Rare':
      styleProps.color = uiutils.THEME_GREEN
      break
    case 'blue':
    case 'common':
    case 'Common':
      styleProps.color = uiutils.THEME_BLUE
      break
    case 'red':
    case 'unique':
    case 'Unique':
    case 'veryrare':
    case 'Very Rare':
      styleProps.color = uiutils.THEME_RED
      break
    case 'brown':
    case 'uncommon':
    case 'Uncommon':
      styleProps.color = uiutils.THEME_BROWN
      break
    case 'filldarkbrown':
    case 'giant':
    case 'Giant':
      styleProps.fill = uiutils.THEME_DARK_BROWN
      break
    case 'filldarkred':
    case 'super':
    case 'Super':
      styleProps.fill = uiutils.THEME_DARK_RED
      break
    case 'fillpurple':
    case 'purple':
    case 'violet':
      styleProps.fill = uiutils.THEME_VIOLET
      break
    case 'fillblue':
    case 'water':
    case 'Water':
      styleProps.fill = uiutils.THEME_BLUE
      break
    case 'fillred':
    case 'fire':
    case 'Fire':
      styleProps.fill = uiutils.THEME_RED
      break
    case 'yellow':
    case 'fillyellow':
    case 'electricity':
    case 'Electricity':
      styleProps.fill = uiutils.THEME_YELLOW
      break
    case 'filllightblue':
    case 'lightblue':
    case 'wind':
    case 'Wind':
      styleProps.fill = uiutils.THEME_LIGHT_BLUE
      break
    case 'filllightbrown':
    case 'lightbrown':
    case 'earth':
    case 'Earth':
      styleProps.fill = uiutils.THEME_LIGHT_BROWN
      break
  }
  const style = overrideStyle(styleProps)()
  return (
    <Typography
      classes={{ root: style.root }}
      variant={props.variant}
      style={props.innerTypographyStyle}
    >
      {props.text}
    </Typography>
  )
}

export const PangNameChip = props => {
  const name = props.name || '[no name]'
  const innerLabel = (
    <PangDataText
      bigger={props.bigger}
      littleBigger={props.littleBigger}
      smaller={props.smaller}
      bolder={props.bolder}
      text={name}
      color={props.rarity}
      innerTypographyStyle={props.innerTextStyle}
      variant='subtitle2'
    />
  )
  const styleRoot = {}
  const styleIcon = {}
  const styleIconSmall = {}
  if (props.smaller) {
    styleRoot.height = 20
    styleIconSmall.width = 10
  }
  if (props.bigger) {
    styleIcon.width = 24
  }
  const style = makeStyles({
    root: styleRoot,
    icon: styleIcon,
    iconSmall: styleIconSmall,
    deleteIcon: styleIconSmall,
    deleteIconSmall: styleIconSmall
  })()
  return (
    <Chip
      classes={style}
      size={props.bigger ? null : 'small'}
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
  return (
    <img
      src={props.src}
      className={classes.dataViewContentIcon}
      onClick={props.iconOnClick}
    />
  )
}

export const PangDataIcon = props => {
  const alt = props.alt || `Icon for ${props.title}.`
  return (
    <Avatar
      variant={props.variant || 'square'}
      classes={props.classes || makeStyles(() => ({
        root: {
          backgroundColor: 'rgba(0 0 0 / 0%)'
        }
      }))(props)}
    >
      <img
        src={props.src}
        onClick={props.iconOnClick}
        title={props.title}
        alt={alt}
      />
    </Avatar>
  )
}

export const PangDataViewPaperGroup = props => {
  const classes = useStyles(props)
  return (
    <Grid
      container
      spacing={1}
      className={classes.dataViewContentUniqueContainerGrid}
    >
      {props.children}
    </Grid>
  )
}

export const PangDataViewItem = props => (
  <Grid item xs={props.size}>
    {props.children}
  </Grid>
)

export const PangDataViewPaperItem = props => {
  const classes = useStyles(props)
  return (
    <PangDataViewItem size={props.size}>
      <Paper
        className={classes.dataViewContentUniqueSection}
        style={props.innerStyle}
      >
        {props.children}
      </Paper>
    </PangDataViewItem>
  )
}

export const PangDataViewAccordionItem = props => {
  const classes = useStyles(props)
  if (!props.children) {
    return null
  }
  if (Array.isArray(props.children) && !props.children.filter(c => c).length) {
    return null
  }
  return (
    <Grid item xs={props.size}>
      <Accordion
        defaultExpanded={!props.defaultCollapsed}
        className={classes.dataViewAccordionContentSection}
      >
        <AccordionSummary
          expandIcon={(
            <ExpandMoreIcon
              className={classes.dataViewAccordionExpandIcon}/>
          )}
          aria-controls='panel1a-content'
          id='panel1a-header'
        >
          {props.summary}
        </AccordionSummary>
        <AccordionDetails
          className={classes.dataViewAccordionDetails}
          style={props.flexColumn ? { flexDirection: 'column' } : {}}
        >
          {props.children}
        </AccordionDetails>
      </Accordion>
    </Grid>
  )
}

const usePrimitivesTableStyles = makeStyles(() => ({
  primitivesTable: {
    color: props => colorForTheme(props, 80)
  }
}))

const PrimitivesTable = props => {
  const classes = usePrimitivesTableStyles(props)
  return (
    <TableContainer>
      <Table className={classes.primitivesTable} size='small' {...props}>
        <TableBody>
          {props.primitives.map(primitive => (
            <TableRow key={primitive.name}>
              <TableCell
                className={classes.primitivesTable}
                component='th'
                scope='row'
              >
                <PangDataText
                  bolder
                  text={utils.camelToTextCase(primitive.name)}
                />
              </TableCell>
              <TableCell
                className={classes.primitivesTable}
                align='right'
              >
                <PangDataText
                  text={uiutils.textFromPrimitive(
                    primitive.value,
                    primitive.name
                  )}
                  {...props}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export const PangDataPrimitivesAccordion = props => (
  <PangDataViewAccordionItem
    size={12}
    summary={<PangDataText bolder text={props.title} />}
    {...props}
  >
    <PrimitivesTable {...props} />
  </PangDataViewAccordionItem>
)

export const PangDataPrimitivesPaper = props => (
  <PangDataViewPaperItem size={12} {...props}>
    <PangDataText bolder text={props.title} />
    <PrimitivesTable {...props} />
  </PangDataViewPaperItem>
)

const SliderValueLabelComponent = props => (
  <Tooltip
    placement='top'
    open={props.open}
    enterTouchDelay={0}
    title={props.value}
  >
    {props.children}
  </Tooltip>
)

const getSliderMarks = (min, max) => {
  if (!parseInt(max)) {
    return [
      { value: 0, label: '0' }
    ]
  }
  if (parseInt(max) === 1) {
    return [
      { value: 0, label: '0' },
      { value: 1, label: '1' }
    ]
  }
  const middleValue = Math.round(min + ((max - min) / 2))
  return [
    { value: min, label: min + '' },
    { value: middleValue, label: middleValue + '' },
    { value: max, label: max + '' }
  ]
}
export const PangSlider = props => {
  const sliderClasses = makeStyles(() => ({
    root: {
      color: props => colorForTheme(props, 80)
    },
    markLabelActive: {
      color: props => colorForTheme(props, 80)
    },
    markLabel: {
      color: props => colorForTheme(props, 80)
    },
  }))(props)
  const inputClasses = makeStyles(() => ({
    root: {
      color: props => colorForTheme(props, 80)
    },
    underline: {
      '&:before': {
        borderBottom: props => `1px solid ${colorForTheme(props, 80)}`
      },
      '&:after': {
        borderBottom: props => `2px solid ${colorForTheme(props, 80)}`
      }
    }
  }))(props)
  return (
    <Grid
      classes={makeStyles({
        'spacing-xs-2': {
          marginTop: -10,
          marginBottom: -15
        }
      })()}
      container
      spacing={2}
      alignItems='center'
    >
      <Grid item>
        <PangDataText smaller text={props.sliderLabel} />
      </Grid>
      <Grid item xs>
        <Slider
          PangContext={props.PangContext}
          classes={sliderClasses}
          value={props.value}
          min={props.min}
          max={props.max}
          marks={getSliderMarks(props.min, props.max)}
          onChange={props.sliderOnChange}
          ValueLabelComponent={SliderValueLabelComponent}
        />
      </Grid>
      <Grid item>
        <Input
          PangContext={props.PangContext}
          classes={inputClasses}
          margin='dense'
          value={props.value}
          inputProps={{
            min: props.min,
            max: props.max,
            step: props.inputStep,
            type: props.inputType
          }}
          onChange={props.inputOnChange}
          onBlur={props.inputOnBlur}
        />
      </Grid>
    </Grid>
  )
}

const DefaultMinZoomLevel = -4
const DefaultMaxZoomLevel = 1
const DefaultMapZoomLevel = -1
const DefaultMapZoomSnap = 0.25
const DefaultCanvasHeight = 552
const DataViewActiveShiftX = 180
const DataPointPanZoom = 0
const MapTilesBaseUrl = `${config.API_BASE_URL}/image/world`

const PangLatLng = (world, z, x) => {
  const lat = z - world.get('height')
  const lng = x
  return L.latLng(lat, lng)
}

const useMapStyles = makeStyles(() => ({
  navigateButtons: {},
  marker: {
    background: 'unset',
    border: 'unset',
    fill: `rgba(${LIGHT_CONTRAST_COLOR} / 80%)`,
    color: `rgba(${LIGHT_CONTRAST_COLOR} / 80%)`
  }
}))

const MapPanner = props => {
  const classes = useMapStyles(props)
  const map = useMap()
  map.flyTo(props.center, DataPointPanZoom)
  const iconHtml = ReactDOMServer.renderToString(<ImpactPointIcon />)
  const icon = L.divIcon({
    html: iconHtml,
    iconSize: [34, 34],
    className: classes.marker
  })
  return props.marker ? (
    <Marker position={props.marker} icon={icon}>
      <Popup>{props.markerLabel}</Popup>
    </Marker>
  ) : null
}

export const PangMap = props => {
  const world = props.world
  const worldLocationObj = props.locationObj
  const [lat, setLat] = useState(worldLocationObj.z)
  const [lng, setLng] = useState(worldLocationObj.x)
  useEffect(() => {
    setLat(worldLocationObj.z)
    setLng(worldLocationObj.x)
  })
  const mapZoomSnap = props.mapZoomSnap || DefaultMapZoomSnap
  const mapZoom = props.mapZoomLevel || DefaultMapZoomLevel
  const mapMinZoom = props.minZoomLevel || DefaultMinZoomLevel
  const mapMaxZoom = props.maxZoomLevel || DefaultMaxZoomLevel
  const mapStyle = {
    height: props.canvasHeight || DefaultCanvasHeight + 'px'
  }
  const tileRef = useRef(null)
  const tileName = world.get('tileName')
  const mapTilesUrl = MapTilesBaseUrl + `/${tileName}{x}-{y}-{z}.png`
  const shiftCenter = props.PangContext.dataViewerActive
  const placeMarker = PangLatLng(world, lat, lng)
  const mapCenter = PangLatLng(
    world,
    lat,
    shiftCenter ? lng + DataViewActiveShiftX : lng
  )
  useEffect(() => {
    if (tileRef.current) {
      tileRef.current.setUrl(MapTilesBaseUrl + `/${tileName}{x}-{y}-{z}.png`)
    }
  }, [tileName])

  const navWorlds = Array.from(props.PangContext.Worlds.iter())
  return (
    <MapContainer
      attributeControl
      crs={L.CRS.Simple}
      style={mapStyle}
      zoomSnap={mapZoomSnap}
      zoom={mapZoom}
      minZoom={mapMinZoom}
      maxZoom={mapMaxZoom}
      center={mapCenter}
    >
      <TileLayer
        ref={tileRef}
        attribution={config.API_MAP_ATTRIBUTION}
        url={mapTilesUrl}
        tileSize={world.get('tileSize')}
        minZoom={mapMinZoom}
        maxZoom={mapMaxZoom}
        minNativeZoom={0}
        maxNativeZoom={0}
        bounds={[[0, 0], [-world.get('height'), world.get('width')]]}
        noWrap
      />
      <MapPanner
        center={mapCenter}
        marker={props.showMarker ? placeMarker : null}
        markerLabel={props.markerLabel}
      />
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'space-evenly',
        padding: 4
      }}>
        {navWorlds.map((world, key) => (
          <Fab
            key={key}
            style={{ zIndex: 401 }}
            size='small'
            variant='extended'
            onClick={() => props.PangContext.reroute(uiutils.MAP_ROUTE, {
              worldId: world.id,
              locationObj:
                props.PangContext.GameSchemas.DefaultLocationObjectsById[
                  world.id
                ],
              hideMarker: true
            })}
          >
            <PangDataText
              smaller
              text={world.get('name').en /* TODO: localize */}
            />
          </Fab>
        ))}
      </div>
    </MapContainer>
  )
}
