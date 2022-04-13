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
import { SvgIcon } from '@material-ui/core'

import BaseComponent from './base-component'
import { PangNavigationItem } from './common'
import CogIconPath from '../../static/images/cog.svg'

import * as config from '../clients/config'

const LOADING_TOOLTIP_MSG = 'Indexing Flyff data...'

export default class Settings extends BaseComponent {
  render () {
    return (
      <div>TODO Settings</div>
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
    const result = await chrome.storage.local.get([config.STORAGE_VALUE_KEYS.cacheLoading])
    this.setState({ loading: result[config.STORAGE_VALUE_KEYS.cacheLoading] })
  }

  _handleLoadingListener (changes) {
    this.setState({
      loading: !!changes[config.STORAGE_VALUE_KEYS.cacheLoading]?.newValue
    })
  }

  render () {
    return (
      <PangNavigationItem
        name={this._getName()}
        onClick={this._handleOnClick}
        {...this.props}
      >
        <SvgIcon component={this.Cog} />
      </PangNavigationItem>
    )
  }

  _handleOnClick () {
    console.log('settings, yay!')
  }

  _getName () {
    return this.state.loading ? LOADING_TOOLTIP_MSG : this.displayName
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

Settings.NAVIGATION = 'settings'
