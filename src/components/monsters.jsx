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
/* eslint-disable object-property-newline */
import React, { useEffect, useState } from 'react'

import BaseComponent from './base-component'
import {
  PangDataGrid,
  PangContentBackdrop,
  PangNavigationAccordionItem,
  DataViewerContentContainer,
  DataViewerGenericComponent,
  PangDataText,
  PangDataViewIcon,
  PangDataViewPaperGroup,
  PangDataViewPaperItem,
  PangDataPrimitivesAccordion,
  PangDataViewAccordionItem,
  PangNameChip
} from './common'
import MimicChestIcon from '../../static/images/mimic-chest.svg'
import SpikedDragonHeadIcon from '../../static/images/spiked-dragon-head.svg'
import DeathSkullIcon from '../../static/images/death-skull.svg'
import FluffyWingIcon from '../../static/images/fluffy-wing.svg'
import VioletAuraIcon from '../../static/images/violet-aura.svg'
import FireElementIcon from '../../static/images/element-fire.svg'
import WaterElementIcon from '../../static/images/element-water.svg'
import WindElementIcon from '../../static/images/element-wind.svg'
import ElectricityElementIcon from '../../static/images/element-electricity.svg'
import EarthElementIcon from '../../static/images/element-earth.svg'
import { makeStyles } from '@material-ui/core/styles'
import { BuiltinEvents } from '../clients/context'
import Typography from '@material-ui/core/Typography'
import Chip from '@material-ui/core/Chip'
import * as utils from '../utils'
import * as uiutils from '../uiutils'

const useStyles = makeStyles(theme => ({
  monsterIcons: {
    backgroundColor: 'rgba(0 0 0 / 0%)',
    height: '100px',
    width: '100px',
    objectFit: 'contain'
  }
}))

const overrideTypography = root => makeStyles(theme => ({ root }))

export const nameCellRenderer = navigateSingleDataItem => params => {
  const name = params.value || '[no name]'
  const style = overrideTypography({
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
  const getRankIcon = rank => {
    switch (rank) {
      case 'super':
        return <SpikedDragonHeadIcon />
      case 'giant':
        return <DeathSkullIcon />
      default:
        return null
    }
  }
  const getFlyingIcon = flying => {
    switch (flying) {
      case 'Yes':
        return <FluffyWingIcon />
      default:
        return null
    }
  }
  return (
    <Chip
      icon={getRankIcon(params.data.rank)}
      size='small'
      label={innerLabel}
      onClick={() => navigateSingleDataItem(params.data)}
      onDelete={getFlyingIcon(params.data.flying) ? () => {} : null}
      deleteIcon={getFlyingIcon(params.data.flying)}
    />
  )
}

export const iconCellRenderer = classes => params => {
  const alt = `Icon for the ${params.data.name} monster.`
  return (
    <img className={classes.monsterIcons} src={params.value} alt={alt} />
  )
}

const MonstersPangDataGrid = props => {
  const classes = useStyles(props)
  const formatFlying = isFlying => isFlying ? 'Yes' : 'No'
  const createRowFromGameObject = go => ({
    id: go.id,
    type: go.type,
    icon: go.icon,
    name: go.get('name').en, // TODO: localize
    lv: go.get('level'),
    hp: go.get('hp'),
    experience: go.get('experience'),
    flying: formatFlying(go.get('flying')),
    rank: go.get('rank'),
    area: go.get('area'),
    defense: go.get('defense'),
    dex: go.get('dex'),
    element: go.get('element'),
    experienceSharing: go.get('experienceSharing'),
    hitRate: go.get('hitRate'),
    resourceId: go.get('id'),
    int: go.get('int'),
    magicDefense: go.get('magicDefense'),
    maxAttack: go.get('maxAttack'),
    maxDropGold: go.get('maxDropGold'),
    minAttack: go.get('minAttack'),
    minDropGold: go.get('minDropGold'),
    mp: go.get('mp'),
    parry: go.get('parry'),
    runaway: go.get('runaway'),
    speed: go.get('speed'),
    sta: go.get('sta'),
    str: go.get('str')
  })

  const [rowData, setRowDataState] = useState(
    Array.from(props.PangContext.Monsters.iter()).map(createRowFromGameObject)
  )

  useEffect(() => {
    const initializeHandler = () => setRowDataState(
      Array.from(props.PangContext.Monsters.iter()).map(createRowFromGameObject)
    )
    props.PangContext.on(BuiltinEvents.INITIALIZE_COMPLETED, initializeHandler)
    return () => props.PangContext.off(
      BuiltinEvents.INITIALIZE_COMPLETED,
      initializeHandler
    )
  }, [])

  const [columnDefs] = useState([
    {
      field: 'id',
      width: 55,
      minWidth: 55,
      maxWidth: 55,
      sortable: true,
      filter: true,
      hide: false,
      resizable: true
    },
    {
      field: 'icon',
      width: 140,
      minWidth: 140,
      maxWidth: 140,
      hide: false,
      cellRenderer: iconCellRenderer(classes)
    },
    {
      field: 'name',
      width: 160,
      minWidth: 160,
      sortable: true,
      resizable: true,
      filter: true,
      hide: false,
      cellRenderer: nameCellRenderer(props.PangContext.navigateSingleDataItem)
    },
    {
      field: 'lv',
      width: 55,
      minWidth: 55,
      maxWidth: 55,
      sortable: true,
      filter: true,
      resizable: true,
      hide: false
    },
    {
      field: 'hp',
      sortable: true,
      resizable: true,
      filter: true,
      hide: false
    },
    {
      field: 'rank',
      sortable: true,
      resizable: true,
      filter: true,
      hide: false
    },
    {
      field: 'flying',
      resizable: true,
      filter: true,
      hide: false
    },
    {
      field: 'experience',
      sortable: true,
      resizable: true,
      filter: true
    },
    {
      field: 'area',
      sortable: true,
      filter: true,
      resizable: true
    },
    {
      field: 'defense',
      sortable: true,
      filter: true,
      resizable: true
    },
    {
      field: 'dex',
      sortable: true,
      filter: true,
      resizable: true
    },
    {
      field: 'element',
      sortable: true,
      filter: true,
      resizable: true
    },
    {
      field: 'experienceSharing',
      sortable: true,
      filter: true,
      resizable: true
    },
    {
      field: 'hitRate',
      sortable: true,
      filter: true,
      resizable: true
    },
    {
      field: 'resourceId',
      sortable: true,
      filter: true,
      resizable: true
    },
    {
      field: 'int',
      sortable: true,
      filter: true,
      resizable: true
    },
    {
      field: 'magicDefense',
      sortable: true,
      filter: true,
      resizable: true
    },
    {
      field: 'maxAttack',
      sortable: true,
      filter: true,
      resizable: true
    },
    {
      field: 'maxDropGold',
      sortable: true,
      filter: true,
      resizable: true
    },
    {
      field: 'minAttack',
      sortable: true,
      filter: true,
      resizable: true
    },
    {
      field: 'minDropGold',
      sortable: true,
      filter: true,
      resizable: true
    },
    {
      field: 'mp',
      sortable: true,
      filter: true,
      resizable: true
    },
    {
      field: 'parry',
      sortable: true,
      filter: true,
      resizable: true
    },
    {
      field: 'runaway',
      sortable: true,
      filter: true,
      resizable: true
    },
    {
      field: 'speed',
      sortable: true,
      filter: true,
      resizable: true
    },
    {
      field: 'sta',
      sortable: true,
      filter: true,
      resizable: true
    },
    {
      field: 'str',
      sortable: true,
      filter: true,
      resizable: true
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

export default class Monsters extends BaseComponent {
  render () {
    return (
      <PangContentBackdrop>
        <MonstersPangDataGrid PangContext={this.props.PangContext} />
      </PangContentBackdrop>
    )
  }
}

Monsters.Button = class extends BaseComponent {
  constructor (...args) {
    super(...args)
    this._handleOnClick = this._handleOnClick.bind(this)
    this.i18nKey = 'components:monsters:button'
  }

  render () {
    return (
      <PangNavigationAccordionItem
        name={this.displayName}
        title={this.displayName}
        onClick={this._handleOnClick}
        icon={MimicChestIcon}
        {...this.props}
      />
    )
  }

  _handleOnClick () {}
}

const useSingleViewStyles = makeStyles(() => ({
  itemIcons: {
    backgroundColor: 'rgba(0 0 0 / 0%)',
    height: 32,
    width: 32,
    objectFit: 'contain'
  }
}))

Monsters.SingleView = props => {
  const classes = useSingleViewStyles(props)

  const monster = props.PangContext.Monsters.get(props.Key)
  const monsterDescription = monster.get('description')?.en // TODO: localize
  monster.connectEdgesFromContext(props.PangContext)

  // Mosnter specific data objects
  let rankIcon = null
  switch (monster.get('rank')) {
    case 'super':
      rankIcon = <SpikedDragonHeadIcon />
      break
    case 'giant':
      rankIcon = <DeathSkullIcon />
      break
    case 'violet':
      rankIcon = <VioletAuraIcon />
      break
  }

  let elementIcon = null
  switch (monster.get('element')) {
    case 'fire':
      elementIcon = <FireElementIcon />
      break
    case 'water':
      elementIcon = <WaterElementIcon />
      break
    case 'electricity':
      elementIcon = <ElectricityElementIcon />
      break
    case 'wind':
      elementIcon = <WindElementIcon />
      break
    case 'earth':
      elementIcon = <EarthElementIcon />
      break
  }
  const isSignificant = !!rankIcon || !!elementIcon || monster.get('flying')

  const [dropsColumnDefs] = useState([
    {
      field: 'name',
      minWidth: 100,
      width: 100,
      cellRenderer: params => (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-evenly',
          height: '100px',
        }}>
          <PangNameChip
            bolder
            smaller
            name={params.value}
            innerTextStyle={{ fontSize: '1.1vw' }}
            rarity={params.data.rarity}
            onClick={() => props.PangContext.navigateSingleItem(
              params.data.item
            )}
          />
          <img className={classes.itemIcons} src={params.data.icon} />
        </div>
      )
    },
    {
      field: 'droprate',
      comparator: (valueA, valueB) => {
        if (valueA[1] === valueB[1]) {
          return 0
        }
        return (valueA[1] > valueB[1]) ? 1 : -1
      },
      cellRenderer: params => (
        <PangDataText
          bolder
          littleBigger
          text={params.value.map(
            r => r + '%'
          ).join(' - ')}
        />
      )
    },
    { field: 'sellPrice' },
    {
      field: 'class',
      cellRenderer: params => params.data.classObject ? (
        <PangNameChip
          bolder
          smaller
          name={params.value}
          innerTextStyle={{ fontSize: '1.1vw' }}
          onClick={() => props.PangContext.navigateSingleItem(
            params.data.classObject
          )}
        />
      ) : params.data.class
    },
    { field: 'category' },
    { field: 'subcategory' },
    { field: 'rarity' },
  ])

  const dropsRowData = Array.from(monster.drops()).map(drop => {
    let classObject = null
    let className = 'Any'
    if (drop.item.class?.id) {
      classObject = props.PangContext.Classes.get(drop.item.class.id)
      className = classObject.get('name').en // TODO: localize
    }
    return ({
      name: drop.item.get('name').en, // TODO: localize
      icon: drop.item.icon,
      droprate: drop.probabilityRange,
      class: className,
      classObject,
      item: drop.item,
      category: drop.item.get('category'),
      subcategory: drop.item.get('subcategory'),
      sellPrice: drop.item.get('sellPrice'),
      rarity: drop.item.get('rarity'),
    })
  })
  const dropsRowHeight = 100

  const getTableHeightForRowCount =
    (rowCount, rowHeight) => rowCount * rowHeight

  return (
    <DataViewerContentContainer
      Generic={(
        <DataViewerGenericComponent
          Id={<PangDataText text={monster.id} />}
          Name={<PangDataText
            text={monster.get('name')?.en || '[no name]' /* TODO: localize */}
          />}
          Type={<PangDataText
            text={utils.camelToTextCase(monster.type.name)}
          />}
          Level={<PangDataText text={monster.get('level')} />}
          Rarity={<PangDataText
            text={utils.camelToTextCase(monster.get('rank'))}
          />}
          Class={<PangDataText text='Any' />}
          {...props}
        />
      )}
      Icon={<PangDataViewIcon src={monster.icon} {...props} />}
      {...props}
    >
      <PangDataViewPaperGroup {...props}>
        <PangDataViewPaperItem size={12} {...props}>
          <PangDataText bolder text='HP' />
          <PangDataViewPaperGroup {...props}>
            <PangDataViewPaperItem
              size={12}
              innerStyle={{
                backgroundColor: uiutils.THEME_RED,
                height: 24,
                paddingTop: 4,
                paddingBottom: 4,
                color: 'white',
              }}
              {...props}
            >
              <PangDataText
                bolder
                text={utils.intToLocalizedString(monster.get('hp'))}
              />
            </PangDataViewPaperItem>
          </PangDataViewPaperGroup>
        </PangDataViewPaperItem>
        {isSignificant ? (
          <PangDataViewPaperItem size={12} {...props}>
            <PangDataText bolder text='Major Attributes' />
            <PangDataViewPaperGroup {...props}>
              {rankIcon ? (
                <PangDataViewPaperItem size={4} {...props}>
                  <PangDataText
                    text={utils.camelToTextCase(monster.get('rank'))}
                  />
                  <PangDataText
                    bigger
                    bolder
                    color={monster.get('rank')}
                    text={rankIcon}
                  />
                </PangDataViewPaperItem>
              ) : null}
              {monster.get('flying') ? (
                <PangDataViewPaperItem size={4} {...props}>
                  <PangDataText text='Aerial' />
                  <PangDataText
                    bigger
                    bolder
                    text={<FluffyWingIcon />}
                  />
                </PangDataViewPaperItem>
              ) : null}
              {elementIcon ? (
                <PangDataViewPaperItem size={4} {...props}>
                  <PangDataText
                    text={utils.camelToTextCase(monster.get('element'))}
                  />
                  <PangDataText
                    bigger
                    bolder
                    color={monster.get('element')}
                    text={elementIcon}
                  />
                </PangDataViewPaperItem>
              ) : null}
            </PangDataViewPaperGroup>
          </PangDataViewPaperItem>
        ) : null}
        <PangDataViewAccordionItem
          size={12}
          summary={<PangDataText bolder text='Drops' />}
          flexColumn
          {...props}
        >
          {dropsRowData.length ? (
            <div style={{
              flexDirection: 'column',
              width: '100%',
              height: getTableHeightForRowCount(
                dropsRowData.length, dropsRowHeight
              ),
              minHeight: 200,
              maxHeight: 480,
              textAlign: 'left'
            }}>
              <PangDataText bolder text='Items' />
              <div style={{ width: '100%' }}>
                <PangDataGrid
                  PangContext={props.PangContext}
                  rowData={dropsRowData}
                  columnDefs={dropsColumnDefs}
                  rowHeight={dropsRowHeight}
                  tableStyle={{
                    height: getTableHeightForRowCount(
                      dropsRowData.length, dropsRowHeight
                    ),
                    minHeight: 170,
                    maxHeight: 450
                  }}
                />
              </div>
            </div>
          ) : null}
        </PangDataViewAccordionItem>
        <PangDataPrimitivesAccordion
          title='Full Details'
          primitives={Array.from(monster.primitives(['icon'])) || []}
          {...props}
        />
      </PangDataViewPaperGroup>
    </DataViewerContentContainer>
  )
}

Monsters.ROUTE = 'Monsters'
