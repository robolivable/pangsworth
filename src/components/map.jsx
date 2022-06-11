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
import React, { useEffect, useState } from 'react'

import BaseComponent from './base-component'
import { PangNavigationItem, PangWorldMap } from './common'
import TreasureMapIcon from '../../static/images/treasure-map.svg'
import * as config from '../config'
import { BuiltinEvents } from '../clients/context'

const PangMap = props => {
  const [worldId, setWorldId] = useState(props.worldId)

  // NOTE: need to FORCE UPDATE THIS EVERY TIME!!!!!!!
  useEffect(() => { setWorldId(props.worldId) })

  const world = props.PangContext.Worlds.get(worldId)

  // eslint-disable-next-line
  const [isTransparent, setIsTransparent] = useState(world.isTransparent)
  useEffect(() => {
    const initializeHandler = () => {
      const w = props.PangContext.Worlds.get(worldId)
      setIsTransparent(w.isTransparent)
    }
    props.PangContext.on(BuiltinEvents.INITIALIZE_COMPLETED, initializeHandler)
    return () => props.PangContext.off(
      BuiltinEvents.INITIALIZE_COMPLETED,
      initializeHandler
    )
  }, [])

  if (world?.isTransparent) {
    return null
  }

  const worldLocationObj = props.worldLocationObj
    || props.PangContext.getDefaultLocationForWorld(world).toJSON()
  const showMarker = !!props.worldLocationObj
  return (
    <PangWorldMap
      PangContext={props.PangContext}
      world={world}
      locationObj={worldLocationObj}
      showMarker={showMarker}
      markerLabel={props.markerLabel}
    />
  )
}

export default class Map extends BaseComponent {
  render () {
    const worldId = this.props.PangContext.routeOptions?.worldId
      || this.props.PangContext.GameSchemas.DEFAULT_WORLD_ID
    const worldLocationObj = this.props.PangContext.routeOptions?.locationObj
    const markerLabel = this.props.PangContext.routeOptions?.markerLabel
    return <PangMap
      PangContext={this.props.PangContext}
      worldId={worldId}
      worldLocationObj={worldLocationObj}
      markerLabel={markerLabel}
    />
  }
}

Map.Button = class extends BaseComponent {
  constructor (...args) {
    super(...args)
    this._handleOnClick = this._handleOnClick.bind(this)
    this.i18nKey = 'components:map:button'
  }

  render () {
    return (
      <PangNavigationItem
        name={this.displayName}
        title={this.displayName}
        onClick={this._handleOnClick}
        icon={TreasureMapIcon}
        {...this.props}
      />
    )
  }

  _handleOnClick () {}
}

Map.ROUTE = 'Map'
