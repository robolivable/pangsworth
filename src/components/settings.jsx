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

import BaseComponent from './base-component'
import {
  PangNavigationItem,
  getDarkTheme,
  setDarkTheme,
  getBackgroundImageLoading,
  setBackgroundImageLoading,
  DARK_CONTRAST_COLOR,
  LIGHT_CONTRAST_COLOR
} from './common'
import CogIconPath from '../../static/images/cog.svg'

import { makeStyles, withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grow from '@material-ui/core/Grow'
import Typography from '@material-ui/core/Typography'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import Button from '@material-ui/core/Button'
import CloudDownloadIcon from '@material-ui/icons/CloudDownload'
import Box from '@material-ui/core/Box'
import CircularProgress from '@material-ui/core/CircularProgress'

import { grey } from '@material-ui/core/colors'

import * as config from '../clients/config'

const LOADING_TOOLTIP_MSG = 'Indexing Flyff data...'

const useStyles = makeStyles(theme => ({
  root: {
    color: props => `rgba(${getDarkTheme(props) ? DARK_CONTRAST_COLOR : LIGHT_CONTRAST_COLOR} / 80%)`,
    display: 'flex',
    flexDirection: 'column'
  },
  settingsLeftPad: {
    paddingLeft: theme.spacing(1)
  },
  settingsEnableDarkTheme: {
    backgroundColor: props => `rgba(${getDarkTheme(props) ? LIGHT_CONTRAST_COLOR : DARK_CONTRAST_COLOR} / 50%)`,
    color: props => `rgba(${getDarkTheme(props) ? DARK_CONTRAST_COLOR : LIGHT_CONTRAST_COLOR} / 80%)`
  },
  appearanceSettings: {
    flexGrow: '1',
    marginBottom: theme.spacing(2)
  },
  dataSettings: {
    flexGrow: '1'
  },
  prefetchButton: {
    margin: theme.spacing(1)
  }
}))

const GreyCheckbox = withStyles({
  root: {
    color: grey[400],
    '&$checked': {
      color: grey[600]
    }
  },
  checked: {}
})(props => <Checkbox color='default' {...props} />)

const AppearanceSettings = props => {
  const classes = useStyles(props)
  const [state, setState] = React.useState({
    darkModeEnabled: getDarkTheme(props)
  })
  const handleDarkModeSettingUpdate = async e => {
    setDarkTheme(props, e.target.checked)
    await props.PangContext.saveSettings()
    setState({ ...state, darkModeEnabled: getDarkTheme(props) })
    props.PangContext.askRerender()
  }
  return (
    <Grow in>
      <Paper
        elevation={2}
        className={`${classes.appearanceSettings} ${classes.settingsLeftPad} ${classes.settingsEnableDarkTheme}`}
        PangContext={props.PangContext}
      >
        <Typography variant='subtitle1' gutterBottom>Appearance</Typography>
        <FormControlLabel
          control={
            <GreyCheckbox
              checked={state.darkModeEnabled}
              onChange={handleDarkModeSettingUpdate}
            />
          }
          label='Dark Theme'
        />
      </Paper>
    </Grow>
  )
}

const DataSettings = props => {
  const classes = useStyles(props)
  const [state, setState] = React.useState({
    showBackgroundImageLoadConfirm: false,
    isBackgroundImageLoading: false,
    isBackgroundImageDone: false,
    backgroundLoadingProgress: 0,
    backgroundLoadingTimeRemaining: '00:00:00',
    backgroundImageLoading: getBackgroundImageLoading(props)
  })
  const handleBackgroundImageLoadingSettingUpdate = async e => {
    setBackgroundImageLoading(props, e.target.checked)
    await props.PangContext.saveSettings()
    setState({
      ...state,
      backgroundImageLoading: getBackgroundImageLoading(props)
    })
  }

  React.useEffect(() => {
    if (state.isBackgroundImageDone) {
      return
    }
    chrome.runtime.onMessage.addListener(({ type, limiter }, _, respond) => {
      if (type !== config.MESSAGE_VALUE_KEYS.preloadImagesProgress) {
        return
      }
      setState({
        ...state,
        backgroundLoadingProgress: limiter.progress,
        backgroundLoadingTimeRemaining: limiter.timeRemaining,
        isBackgroundImageLoading: !limiter.done,
        isBackgroundImageDone: limiter.done
      })
      respond()
    })
  }, [state.isBackgroundImageLoading])

  const refreshCacheButtonOnclickHandler = () => {
    setState({
      ...state,
      showBackgroundImageLoadConfirm: !state.showBackgroundImageLoadConfirm
    })
  }

  const downloadButtonOnclickHandler = async e => {
    await chrome.runtime.sendMessage({
      type: config.MESSAGE_VALUE_KEYS.preloadImages
    })
    setState({
      ...state,
      showBackgroundImageLoadConfirm: !state.showBackgroundImageLoadConfirm
    })
  }

  const confirmButton = () => (
    <Button
      variant='contained'
      color='default'
      className={classes.prefetchButton}
      onClick={downloadButtonOnclickHandler}
    >
      Confirm download?
    </Button>
  )
  const refreshImageCacheButton = state => (
    <Button
      variant='contained'
      color='default'
      className={classes.prefetchButton}
      startIcon={<CloudDownloadIcon />}
      onClick={refreshCacheButtonOnclickHandler}
      disabled={state.isBackgroundImageLoading || state.backgroundImageLoading}
    >
      Download image cache
    </Button>
  )

  const progressIndicator = state => (
    <Box position='relative' display='inline-flex'>
      <CircularProgress
        variant='determinate'
        value={state.backgroundLoadingProgress}
        color='inherit'
      />
      <Box
        top={0}
        bottom={0}
        left={0}
        right={0}
        position='absolute'
        display='flex'
        alignItems='center'
        justifyContent='center'
      >
        <Typography variant='caption' component='div' color='textSecondary'>
          {`${state.backgroundLoadingProgress}%`}
        </Typography>
      </Box>
    </Box>
  )

  const progressTimeRemaining = state => (
    <Typography variant='caption' component='div' color='textSecondary'>
      {state.backgroundLoadingTimeRemaining}
    </Typography>
  )

  return (
    <Grow in style={{ transformOrigin: '0 0 0' }} {...{ timeout: 250 }}>
      <Paper
        elevation={2}
        PangContext={props.PangContext}
        className={`${classes.dataSettings} ${classes.settingsLeftPad} ${classes.settingsEnableDarkTheme}`}
      >
        <Typography variant='subtitle1' gutterBottom>Data</Typography>
        <FormControlLabel
          control={
            <GreyCheckbox
              checked={state.backgroundImageLoading}
              onChange={handleBackgroundImageLoadingSettingUpdate}
            />
          }
          label='Prefetch images on start'
        />
        {state.showBackgroundImageLoadConfirm
          ? confirmButton()
          : refreshImageCacheButton(state)}
        {state.isBackgroundImageLoading
          ? progressIndicator(state)
          : null}
        {state.isBackgroundImageLoading
          ? progressTimeRemaining(state)
          : null}
      </Paper>
    </Grow>
  )
}

const SettingsContainer = props => {
  const classes = useStyles(props)
  return (
    <div className={classes.root}>
      <AppearanceSettings {...props} />
      <DataSettings {...props} />
    </div>
  )
}

export default class Settings extends BaseComponent {
  render () {
    return <SettingsContainer PangContext={this.props.PangContext} />
  }
}

Settings.Button = class extends BaseComponent {
  constructor (...args) {
    super(...args)
    this._handleOnClick = this._handleOnClick.bind(this)
    this._handleLoadingListener = this._handleLoadingListener.bind(this)
    this._getName = this._getName.bind(this)
    this._getFirstLoadingState = this._getFirstLoadingState.bind(this)
    this.Cog = this.Cog.bind(this)
    this.i18nKey = 'components:settings:button'
    chrome.storage.onChanged.addListener(this._handleLoadingListener)
    this.state = {
      loading: false
    }
    this._getFirstLoadingState()
  }

  async _getFirstLoadingState () {
    const result = await chrome.storage.local.get([
      config.STORAGE_VALUE_KEYS.local.cacheLoading
    ])
    this.setState({
      loading: result[config.STORAGE_VALUE_KEYS.local.cacheLoading]
    })
  }

  _handleLoadingListener (changes) {
    this.setState({
      loading: !!changes[config.STORAGE_VALUE_KEYS.local.cacheLoading]?.newValue
    })
  }

  render () {
    return (
      <PangNavigationItem
        name={this._getName()}
        title={this._getTitle()}
        onClick={this._handleOnClick}
        icon={this.Cog}
        {...this.props}
      />
    )
  }

  _handleOnClick () {
    console.log('settings, yay!', { props: this.props })
  }

  _getName () {
    return this.displayName
  }

  _getTitle () {
    return this.state.loading ? LOADING_TOOLTIP_MSG : this._getName()
  }

  Cog (props) {
    return (
      <svg {...props} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'>
        <CogIconPath />
        {this.state.loading ? <Rotation /> : null}
      </svg>
    )
  }
}

const Rotation = props => {
  return (
    <animateTransform
      {...props}
      attributeName='transform'
      attributeType='XML'
      type='rotate'
      dur='2s'
      from='0 0 0'
      to='360 0 0'
      repeatCount='indefinite'
    />
  )
}

Settings.ROUTE = 'Settings'
