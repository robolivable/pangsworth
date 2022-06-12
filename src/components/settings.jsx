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
import React, { useState, useEffect } from 'react'

import BaseComponent from './base-component'
import {
  PangNavigationItem,
  PangContentBackdrop,
  getDarkTheme,
  setDarkTheme,
  getBackgroundImageLoading,
  setBackgroundImageLoading,
  DARK_CONTRAST_COLOR,
  LIGHT_CONTRAST_COLOR,
  toggleAGTableDarkMode,
  PangDataText
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
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Grid from '@material-ui/core/Grid'

import { grey } from '@material-ui/core/colors'

import * as config from '../config'
import * as terms from '../terms.json'
import { LICENSES } from '../licenses'
import { LicenseName, LicenseBody } from '../license'
import { GalaLicenseName, GalaLicenseBody } from '../gala-license'

const LOADING_TOOLTIP_MSG = 'Indexing Flyff data...'

const useStyles = makeStyles(theme => ({
  root: {
    color: props =>
      `rgba(${getDarkTheme(props) ? DARK_CONTRAST_COLOR : LIGHT_CONTRAST_COLOR} / 80%)`,
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3)
  },
  settingsLeftPad: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1)
  },
  settingsEnableDarkTheme: {
    backgroundColor: props =>
      `rgba(${getDarkTheme(props) ? LIGHT_CONTRAST_COLOR : DARK_CONTRAST_COLOR} / 50%)`,
    color: props =>
      `rgba(${getDarkTheme(props) ? DARK_CONTRAST_COLOR : LIGHT_CONTRAST_COLOR} / 80%)`
  },
  appearanceSettings: {
    flexGrow: '1',
    marginBottom: theme.spacing(2)
  },
  dataSettings: {
    flexGrow: '1',
    marginBottom: theme.spacing(2)
  },
  prefetchButton: {
    margin: theme.spacing(1)
  },
  disabledPrefetchButton: {
    color: 'inherit !important'
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
  const [state, setState] = useState({
    darkModeEnabled: getDarkTheme(props)
  })

  useEffect(() => {
    toggleAGTableDarkMode(getDarkTheme(props))
  }, [state.darkModeEnabled])

  const handleDarkModeSettingUpdate = async e => {
    setDarkTheme(props, e.target.checked)
    await props.PangContext.saveSettings()
    setState(prevState => ({
      ...prevState,
      darkModeEnabled: getDarkTheme(props)
    }))
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
  const [state, setState] = useState({
    showBackgroundImageLoadConfirm: false,
    isBackgroundImageLoading: !!props.PangContext.isBackgroundImageLoading,
    isBackgroundImageDone: true,
    backgroundLoadingProgress: 0,
    backgroundLoadingTimeRemaining: '00:00:00',
    settingBackgroundImageLoading: getBackgroundImageLoading(props),
    disableBackgroundImageLoadConfirm: false
  })
  const handleBackgroundImageLoadingSettingUpdate = async e => {
    setBackgroundImageLoading(props, e.target.checked)
    await props.PangContext.saveSettings()
    setState(prevState => ({
      ...prevState,
      settingBackgroundImageLoading: getBackgroundImageLoading(props)
    }))
  }

  useEffect(() => {
    props.PangContext.isBackgroundImageLoading = state.isBackgroundImageLoading
    const preloadImagesListener = ({ type, limiter }, _, respond) => {
      if (
        type !== config.MESSAGE_VALUE_KEYS.preloadImagesProgress &&
        type !== config.MESSAGE_VALUE_KEYS.preloadImagesCompleted
      ) {
        return
      }
      setState(prevState => ({
        ...prevState,
        backgroundLoadingProgress: limiter.progress,
        backgroundLoadingTimeRemaining: limiter.timeRemaining,
        isBackgroundImageLoading: !limiter.done,
        isBackgroundImageDone: limiter.done
      }))
      if (type === config.MESSAGE_VALUE_KEYS.preloadImagesCompleted) {
        chrome.runtime.onMessage.removeListener(preloadImagesListener)
      }
      chrome.runtime.sendMessage({ type: config.MESSAGE_VALUE_KEYS.heartbeat })
      respond()
    }
    chrome.runtime.onMessage.addListener(preloadImagesListener)
  }, [state.isBackgroundImageLoading])

  const refreshCacheButtonOnclickHandler = () => {
    setState(prevState => ({
      ...prevState,
      showBackgroundImageLoadConfirm: !state.showBackgroundImageLoadConfirm
    }))
  }

  const downloadButtonOnclickHandler = async e => {
    const lastImageCacheCompletedAt =
      await props.PangContext.getLastCacheDownloadCompletedAt()
    const cacheMissDelta = Date.now() - lastImageCacheCompletedAt
    const forceFetch = lastImageCacheCompletedAt &&
      (cacheMissDelta > config.BG_IMG_PRELOAD.manualCacheDownloadCheckExpireMs)
    await chrome.runtime.sendMessage({
      type: config.MESSAGE_VALUE_KEYS.preloadImages,
      forceFetch
    })
    setState(prevState => ({
      ...prevState,
      disableBackgroundImageLoadConfirm: true // double click prevent
    }))
    setTimeout(() => setState(prevState => ({
      ...prevState,
      showBackgroundImageLoadConfirm: !state.showBackgroundImageLoadConfirm,
      disableBackgroundImageLoadConfirm: false
    })), config.BG_IMG_PRELOAD.progressTickMs * 2)
  }

  const confirmButton = () => (
    <Button
      variant='contained'
      color='default'
      className={classes.prefetchButton}
      onClick={downloadButtonOnclickHandler}
      disabled={state.disableBackgroundImageLoadConfirm}
    >
      Confirm download?
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
        <Typography variant='caption' component='div' color='inherit'>
          {`${state.backgroundLoadingProgress}%`}
        </Typography>
      </Box>
    </Box>
  )

  const refreshImageCacheButton = state => (
    <Button
      variant='contained'
      color='default'
      className={classes.prefetchButton}
      classes={{ disabled: classes.disabledPrefetchButton }}
      startIcon={
        !state.isBackgroundImageDone && state.isBackgroundImageLoading
          ? progressIndicator(state)
          : <CloudDownloadIcon />
      }
      onClick={refreshCacheButtonOnclickHandler}
      disabled={
        (!state.isBackgroundImageDone && state.isBackgroundImageLoading) ||
        state.settingBackgroundImageLoading
      }
    >
      {
        !state.isBackgroundImageDone && state.isBackgroundImageLoading
          ? `Downloading... (Est. time remaining: ${state.backgroundLoadingTimeRemaining})`
          : 'Download image cache'
      }
    </Button>
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
              checked={state.settingBackgroundImageLoading}
              onChange={handleBackgroundImageLoadingSettingUpdate}
            />
          }
          label='Prefetch images on start'
        />
        {state.showBackgroundImageLoadConfirm
          ? confirmButton()
          : refreshImageCacheButton(state)}
      </Paper>
    </Grow>
  )
}

const LicensesDialog = props => {
  const classes = useStyles(props)
  const [open, setOpen] = useState(false)
  const handleClose = () => {
    setOpen(false)
  }
  const handleClickOpen = () => {
    setOpen(true)
  }
  const PrettyTerms = props => {
    const [termsLeft, termsRight] = props.text.split('%LICENSE_NAME%')
    return (
      <div>
        {termsLeft}
        <span style={{ fontWeight: 'bold' }}>{props.licenseName}</span>
        {termsRight}
      </div>
    )
  }
  return (
    <Grow in style={{ transformOrigin: '0 0 0' }} {...{ timeout: 250 }}>
      <Paper
        elevation={2}
        PangContext={props.PangContext}
        className={`${classes.dataSettings} ${classes.settingsLeftPad} ${classes.settingsEnableDarkTheme}`}
      >
        <Typography variant='subtitle1' gutterBottom>About</Typography>
        <Button
          variant='contained'
          color='default'
          className={classes.prefetchButton}
          onClick={handleClickOpen}
        >
          Licenses
        </Button>
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby='alert-dialog-title'
          aria-describedby='alert-dialog-description'
        >
          <DialogTitle id='alert-dialog-title'>
            {'Pangsworth Info Butler Licenses'}
          </DialogTitle>
          <DialogContent id='alert-dialog-description'
            style={{
              minHeight: '300px'
            }}
          >
            <Grid
              container
              spacing={4}
              direction='column'
              alignItems='flex-start'
              justifyContent='space-evenly'
            >
              <Grid container item xs={12} spacing={1}>
                <PangDataText text={
                  <PrettyTerms
                    licenseName={LicenseName}
                    text={'Pangsworth is distributed under the %LICENSE_NAME%:'}
                  />
                } />
              </Grid>
              <Grid container item xs={12} spacing={1}>
                <Paper
                  elevation={4}
                  style={{
                    maxHeight: 300,
                    width: '100%',
                    overflowY: 'auto',
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    padding: 2
                  }}
                >
                  {LicenseBody.split('\n\n').map((paragraph, key) => (
                    <PangDataText
                      key={key}
                      smaller
                      bolder
                      text={paragraph}
                      innerTypographyStyle={{ paddingBottom: 12 }}
                    />
                  ))}
                </Paper>
              </Grid>
              <Grid container item xs={12} spacing={1}>
                <PangDataText text={
                  <PrettyTerms
                    licenseName={GalaLicenseName}
                    text={'Pangsworth uses data and assets fetched from the Flyff Universe API provided by %LICENSE_NAME%:'}
                  />
                } />
              </Grid>
              <Grid container item xs={12} spacing={1}>
                <Paper
                  elevation={4}
                  style={{
                    maxHeight: 300,
                    width: '100%',
                    overflowY: 'auto',
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    padding: 2
                  }}
                >
                  {GalaLicenseBody.split('\n\n').map((paragraph, key) => (
                    <PangDataText
                      key={key}
                      smaller
                      bolder
                      text={paragraph}
                      innerTypographyStyle={{ paddingBottom: 12 }}
                    />
                  ))}
                </Paper>
              </Grid>
              <Grid container item xs={12} spacing={1}>
                <PangDataText
                  text='Pangsworth uses various third party libraries with the following respective licenses:'
                  innerTypographyStyle={{ paddingBottom: 12 }}
                />
              </Grid>
              <Grid container item xs={12} spacing={1}>
                <Paper
                  elevation={4}
                  style={{
                    maxHeight: 300,
                    width: '100%',
                    overflowY: 'auto',
                    padding: 2
                  }}
                >
                  {LICENSES.split('\n\n').map((paragraph, key) => (
                    <PangDataText
                      key={key}
                      smaller
                      bolder
                      text={paragraph}
                      innerTypographyStyle={{ paddingBottom: 12 }}
                    />
                  ))}
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              variant='contained'
              color='default'
              className={classes.prefetchButton}
              onClick={handleClose}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
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
      <LicensesDialog {...props} />
    </div>
  )
}

export default class Settings extends BaseComponent {
  render () {
    return (
      <PangContentBackdrop>
        <SettingsContainer PangContext={this.props.PangContext} />
      </PangContentBackdrop>
    )
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

  _handleOnClick () {}

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
