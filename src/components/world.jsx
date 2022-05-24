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
import {
  PangDataGrid,
  PangContentBackdrop,
  PangNavigationAccordionItem
} from './common'
import { BuiltinEvents } from '../clients/context'
import MountainsIcon from '../../static/images/mountains.svg'
import CrossedSwordsIcon from '../../static/images/crossed-swords.svg'
import NoFlyZoneIcon from '../../static/images/no-fly-zone.svg'
import CaveEntranceIcon from '../../static/images/cave-entrance.svg'
import SpawnNodeIcon from '../../static/images/spawn-node.svg'
import { makeStyles } from '@material-ui/core/styles'
import Chip from '@material-ui/core/Chip'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles(theme => ({
  detailsWrapper: {
    display: 'flex',
    flexFlow: 'wrap'
  },
  lodestarsWrapper: {
    display: 'flex',
    flexFlow: 'wrap'
  }
}))

const overrideStyle = root => makeStyles(theme => ({ root }))

export const nameCellRenderer = navigateSingleItem => params => {
  const name = params.value || '[no name]'
  const style = overrideStyle({
    fontSize: '0.675rem'
  })()
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
      classes={{ root: style.root }}
      size='small'
      label={innerLabel}
      onClick={navigateSingleItem(params.data)}
    />
  )
}

const WorldPangDataGrid = props => {
  const classes = useStyles(props)
  const getLodeLocation = lode => {
    const loc = {
      x: lode.location.get('x'),
      y: lode.location.get('y'),
      z: lode.location.get('z')
    }
    if (!lode.location.continent) {
      return loc
    }
    loc.continent = {
      id: lode.location.continent.id,
      name: lode.location.continent.get('name').en // TODO: localize
    }
    return loc
  }
  const createRowFromGameObject = go => ({
    id: go.id,
    name: go.get('name').en, // TODO: localize
    details: JSON.stringify({
      pk: go.get('pk'),
      inDoor: go.get('inDoor'),
      flying: go.get('flying')
    }),
    type: go.get('type'),
    lodestars: JSON.stringify(Array.from(go.lodestars()).map(lode => ({
      key: lode.get('key'),
      location: getLodeLocation(lode)
    })))
  })

  const [rowData, setRowData] = useState([])

  useEffect(() => {
    ;(async () => {
      const data = []
      for await (const w of props.PangContext.Worlds.iterHydrated()) {
        data.push(w)
      }
      setRowData(data.map(createRowFromGameObject))
    })()
  }, [])

  useEffect(() => {
    const initializeHandler = async () => {
      const data = []
      for await (const w of props.PangContext.Worlds.iterHydrated()) {
        data.push(w)
      }
      setRowData(data.map(createRowFromGameObject))
    }
    props.PangContext.on(BuiltinEvents.INITIALIZE_COMPLETED, initializeHandler)
    return () => props.PangContext.off(
      BuiltinEvents.INITIALIZE_COMPLETED,
      initializeHandler
    )
  }, [])

  const navigateSingleItem = item => e => {
    console.log({ item, e })
  }

  const navigateMap = coordinates => e => {
    console.log({ coordinates, e })
  }

  const detailsCellRenderer = params => {
    const details = JSON.parse(params.value)
    const style = overrideStyle({
      margin: '1px',
      fontSize: '0.675rem'
    })()
    const getChip = (icon, label) => (
      <Chip
        classes={{ root: style.root }}
        icon={icon}
        size='small'
        label={label}
      />
    )
    const getLabel = text => (
      <Typography
        classes={{ root: style.root }}
        variant='subtitle2'
      >
        {text}
      </Typography>
    )
    return (
      <div className={classes.detailsWrapper}>
        {details.inDoor
          ? getChip(<CaveEntranceIcon />, getLabel('Indoor Zone'))
          : getChip(<MountainsIcon />, getLabel('Outdoor Zone'))}
        {details.pk
          ? getChip(<CrossedSwordsIcon />, getLabel('PK Zone'))
          : null}
        {details.flying
          ? null
          : getChip(<NoFlyZoneIcon />, getLabel('No Fly Zone'))}
      </div>
    )
  }
  const typeCellRenderer = params => params.value

  const lodestarsCellRenderer = params => {
    const lodestars = JSON.parse(params.value)
    const style = overrideStyle({
      fontSize: '0.675rem',
      margin: '1px'
    })()
    const innerLabel = name => (
      <Typography
        classes={{ root: style.root }}
        variant='subtitle2'
      >
        {name}
      </Typography>
    )
    return (
      <div className={classes.lodestarsWrapper}>
        {lodestars.map((lodestar, key) => (
          <Chip
            key={key}
            icon={<SpawnNodeIcon />}
            classes={{ root: style.root }}
            size='small'
            label={innerLabel(lodestar.key)}
            onClick={navigateMap(lodestar.location)}
          />
        ))}
      </div>
    )
  }

  const [columnDefs] = useState([
    {
      field: 'id',
      hide: false,
      width: 55,
      minWidth: 55,
      maxWidth: 55,
      filter: true,
      sortable: true
    },
    {
      field: 'name',
      hide: false,
      width: 150,
      minWidth: 150,
      filter: true,
      sortable: true,
      resizable: true,
      cellRenderer: nameCellRenderer(navigateSingleItem)
    },
    {
      field: 'details',
      hide: false,
      width: 150,
      minWidth: 150,
      maxWidth: 150,
      filter: true,
      sortable: true,
      resizable: true,
      cellRenderer: detailsCellRenderer
    },
    {
      field: 'type',
      hide: false,
      width: 85,
      minWidth: 85,
      maxWidth: 85,
      filter: true,
      sortable: true,
      cellRenderer: typeCellRenderer
    },
    {
      field: 'lodestars',
      hide: false,
      width: 110,
      minWidth: 110,
      filter: true,
      sortable: true,
      cellRenderer: lodestarsCellRenderer
    }
  ])

  return (
    <PangDataGrid
      PangContext={props.PangContext}
      rowHeight={100}
      rowData={rowData}
      columnDefs={columnDefs}
    />
  )
}

export default class World extends BaseComponent {
  render () {
    return (
      <PangContentBackdrop>
        <WorldPangDataGrid PangContext={this.props.PangContext} />
      </PangContentBackdrop>
    )
  }
}

World.Button = class extends BaseComponent {
  constructor (...args) {
    super(...args)
    this._handleOnClick = this._handleOnClick.bind(this)
    this.i18nKey = 'components:world:button'
  }

  render () {
    return (
      <PangNavigationAccordionItem
        name={this.displayName}
        title={this.displayName}
        onClick={this._handleOnClick}
        icon={MountainsIcon}
        {...this.props}
      />
    )
  }

  _handleOnClick () {}
}

World.SingleView = class extends BaseComponent {
  render () {
    return <div>TODO SINGLE VIEW World</div>
  }
}

World.ROUTE = 'World'
