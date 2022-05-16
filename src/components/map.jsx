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
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
/* This code is needed to properly load the images in the Leaflet CSS */
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

/* eslint-disable react/jsx-handler-names */
import React, { useEffect, useState } from 'react'

import BaseComponent from './base-component'
import { PangNavigationItem } from './common'
import TreasureMapIcon from '../../static/images/treasure-map.svg'
import * as config from '../clients/config'
import { BuiltinEvents } from '../clients/context'

import { MapContainer, TileLayer } from 'react-leaflet'

const DEFAULT_WORLD_ID = 6063

const PangMap = props => {
  const [worldId, setWorldId] = useState(props.worldId || DEFAULT_WORLD_ID)
  const world = props.PangContext.Worlds.get(worldId)
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
  return (
    <MapContainer
      style={{ height: '552px' }}
      crs={L.CRS.Simple}
      center={L.latLng(3339.728 - world.get('height'), 6960.132)}
      zoomSnap={0.25}
      zoom={-1.75}
      minZoom={-4}
      maxZoom={1}
      attributeControl
    >
      <TileLayer
        attribution='&copy; 2021 Gala Lab Corp.'
        url={`${config.API_BASE_URL}/image/world/${world.get('tileName')}{x}-{y}-{z}.png`}
        tileSize={world.get('tileSize')}
        minZoom={-4}
        maxZoom={1}
        minNativeZoom={0}
        maxNativeZoom={0}
        bounds={[[0, 0], [-world.get('height'), world.get('width')]]}
        noWrap
      />
    </MapContainer>
  )
}

export default class Map extends BaseComponent {
  render () {
    return <PangMap PangContext={this.props.PangContext} />
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
