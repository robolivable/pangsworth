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
  PangNavigationAccordionItem,
  DataViewerContentContainer,
  PangDataViewPaperGroup,
  PangDataPrimitivesAccordion,
  PangDataText,
  PangNameChip,
  PangDataViewPaperItem,
  PangDataViewAccordionItem,
  DataViewerGenericComponent
} from './common'
import { BuiltinEvents } from '../clients/context'
import MountainsIcon from '../../static/images/mountains.svg'
import CrossedSwordsIcon from '../../static/images/crossed-swords.svg'
import NoFlyZoneIcon from '../../static/images/no-fly-zone.svg'
import CaveEntranceIcon from '../../static/images/cave-entrance.svg'
import SpawnNodeIcon from '../../static/images/spawn-node.svg'
import ImpactPointIcon from '../../static/images/impact-point.svg'
import CompassIcon from '../../static/images/compass.svg'
import { makeStyles } from '@material-ui/core/styles'
import Chip from '@material-ui/core/Chip'
import Typography from '@material-ui/core/Typography'
import * as utils from '../utils'
import * as uiutils from '../uiutils'

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

export const nameCellRenderer = navigateSingleDataItem => params => {
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
      onClick={() => navigateSingleDataItem(params.data)}
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
    type: go.type,
    name: go.get('name').en, // TODO: localize
    details: JSON.stringify({
      pk: go.get('pk'),
      inDoor: go.get('inDoor'),
      flying: go.get('flying')
    }),
    worldType: go.get('type'),
    lodestars: Array.from(go.lodestars())
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
    const lodestars = params.value
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
            label={innerLabel(lodestar.get('key'))}
            onClick={() => props.PangContext.reroute(uiutils.MAP_ROUTE, {
              worldId: lodestar.location.world.id,
              locationObj: lodestar.location.toJSON(),
              markerLabel: lodestar.get('key')
            })}
          />
        ))}
      </div>
    )
  }

  const [columnDefs] = useState([
    { field: 'id', minWidth: 55, resizable: false },
    {
      field: 'name',
      minWidth: 150,
      cellRenderer: nameCellRenderer(props.PangContext.navigateSingleDataItem)
    },
    {
      field: 'details',
      minWidth: 150,
      resizable: false,
      cellRenderer: detailsCellRenderer
    },
    {
      field: 'worldType',
      minWidth: 85,
      resizable: false,
      cellRenderer: typeCellRenderer
    },
    { field: 'lodestars', minWidth: 110, cellRenderer: lodestarsCellRenderer }
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

const useSingleViewStyles = makeStyles(() => ({
}))

World.SingleView = props => {
  const classes = useSingleViewStyles(props)
  const world = props.PangContext.Worlds.get(props.Key)
  world.connectEdgesFromContext(props.PangContext)

  const worldPOIs = Array.from(world.places())
  const lodestarsRowData = Array.from(world.lodestars()).map(lodestar => ({
    continent: lodestar.location?.continent?.get('name').en, // TODO: localize
    locationObj: lodestar.location,
    lodestarName: lodestar.get('key')
  }))
  const [lodestarsColumnDefs] = useState([
    { field: 'continent', resizeable: false },
    {
      field: 'navigate',
      resizeable: false,
      sortable: false,
      filter: false,
      cellRenderer: params => (
        <PangNameChip
          littleBigger
          bolder
          leftIcon={<CompassIcon />}
          onClick={() => props.PangContext.reroute(uiutils.MAP_ROUTE, {
            worldId: params.data.locationObj.world.id,
            locationObj: params.data.locationObj.toJSON(),
            markerLabel: params.data.lodestarName
          })}
        />
      )
    }
  ])
  const lodestarsRowHeight = 150

  const getTableHeightForRowCount =
    (rowCount, rowHeight) => rowCount * rowHeight

  return (
    <DataViewerContentContainer
      Generic={(
        <DataViewerGenericComponent
          Id={<PangDataText text={world.id} />}
          Name={<PangDataText text={world.get('name').en /* TODO: localize */} />}
          Type={<PangDataText text={utils.camelToTextCase(world.type.name)} />}
        />
      )}
      Icon={<MountainsIcon />}
      {...props}
    >
      <PangDataViewPaperGroup {...props}>
        <PangDataViewPaperItem size={12} {...props}>
          <PangDataText bolder text='Zone Details' />
          <PangDataViewPaperGroup {...props}>
            {world.get('pk') ? (
              <PangDataViewPaperItem size={4} {...props}>
                <PangDataText text='PK (PvP)' />
                <PangDataText
                  bigger
                  bolder
                  color='fillred'
                  text={<CrossedSwordsIcon />}
                />
              </PangDataViewPaperItem>
            ) : null}
            {!world.get('flying') ? (
              <PangDataViewPaperItem size={4} {...props}>
                <PangDataText text='No Flying' />
                <PangDataText
                  bigger
                  bolder
                  color='lightblue'
                  text={<NoFlyZoneIcon />}
                />
              </PangDataViewPaperItem>
            ) : null}
            {world.get('inDoor') ? (
              <PangDataViewPaperItem size={4} {...props}>
                <PangDataText text='Inside' />
                <PangDataText
                  bigger
                  bolder
                  color='lightbrown'
                  text={<CaveEntranceIcon />}
                />
              </PangDataViewPaperItem>
            ) : null}
          </PangDataViewPaperGroup>
        </PangDataViewPaperItem>
        <PangDataViewAccordionItem
          defaultCollapsed
          size={12}
          summary={<PangDataText bolder text='Lodestars' />}
          {...props}
        >
          {lodestarsRowData.length ? (
            <div style={{
              flexDirection: 'column',
              width: '100%',
              height: getTableHeightForRowCount(
                lodestarsRowData.length, lodestarsRowHeight
              ),
              minHeight: 200,
              maxHeight: 480,
              textAlign: 'left'
            }}>
              <PangDataGrid
                PangContext={props.PangContext}
                noAutoSizeAll
                rowData={lodestarsRowData}
                columnDefs={lodestarsColumnDefs}
                rowHeight={lodestarsRowHeight}
                tableStyle={{
                  height: getTableHeightForRowCount(
                    lodestarsRowData.length, lodestarsRowHeight
                  ),
                  minHeight: 170,
                  maxHeight: 450
                }}
              />
            </div>
          ) : null}
        </PangDataViewAccordionItem>
        <PangDataViewAccordionItem
          defaultCollapsed
          size={12}
          summary={<PangDataText bolder text='Places' />}
          {...props}
        >
          {worldPOIs.length ? (
            <PangDataViewPaperGroup {...props}>
              {worldPOIs.map(place => (
                <PangDataViewPaperItem
                  size={12}
                  innerStyle={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-evenly',
                    alignItems: 'center'
                  }}
                  {...props}
                >
                  <PangNameChip
                    bolder
                    name={place.location.continent?.get('name').en /* TODO: localize */}
                    leftIcon={<ImpactPointIcon />}
                    onClick={() => props.PangContext.reroute(uiutils.MAP_ROUTE, {
                      worldId: place.location.world.id,
                      locationObj: place.location.toJSON(),
                      markerLabel: place.get('type')
                    })}
                  />
                </PangDataViewPaperItem>
              ))}
            </PangDataViewPaperGroup>
          ) : null}
        </PangDataViewAccordionItem>
        <PangDataPrimitivesAccordion
          title='Full Details'
          primitives={Array.from(world.primitives(['icon'])) || []}
          {...props}
        />
      </PangDataViewPaperGroup>
    </DataViewerContentContainer>
  )
}

World.ROUTE = 'World'
