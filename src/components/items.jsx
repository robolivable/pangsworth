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
  PangDataText,
  PangDataViewIcon,
  PangNameChip,
  PangContentBackdrop,
  PangNavigationAccordionItem,
  DataViewerContentContainer,
  DataViewerGenericComponent,
  PangDataViewPaperGroup,
  PangDataViewPaperItem,
  PangDataViewAccordionItem,
  PangDataPrimitivesAccordion,
  colorForTheme
} from './common'
import BagIcon from '../../static/images/swap-bag.svg'
import SpikedDragonHeadIcon from '../../static/images/spiked-dragon-head.svg'
import DeathSkullIcon from '../../static/images/death-skull.svg'
import FluffyWingIcon from '../../static/images/fluffy-wing.svg'
import CompassIcon from '../../static/images/compass.svg'
import ImpactPointIcon from '../../static/images/impact-point.svg'
import { makeStyles } from '@material-ui/core/styles'
import { BuiltinEvents } from '../clients/context'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import Chip from '@material-ui/core/Chip'
import * as utils from '../utils'
import * as uiutils from '../uiutils'
import * as TableColumnDefs from '../table-column-defs'

const useStyles = makeStyles(theme => ({
  icons: {
    backgroundColor: 'rgba(0 0 0 / 0%)'
  },
}))

const overrideTypography = root => makeStyles(theme => ({ root }))

export const nameCellRenderer = navigateSingleDataItem => params => {
  const nameColor = uiutils.getThemeForRarity(params.data.rarity).color
  if (!nameColor) {
    return params.value
  }
  const name = params.value || '[no name]'
  const style = overrideTypography({
    color: nameColor,
    fontSize: '0.675rem'
  })()
  const inner = (
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
      label={inner}
      onClick={() => navigateSingleDataItem(params.data)}
    />
  )
}

export const iconCellRenderer = classes => params => {
  const alt = `Icon for the ${params.data.name} item.`
  return (
    <Avatar variant='square' className={classes.icons}>
      <img src={params.value} alt={alt} />
    </Avatar>
  )
}

const getClassById = (classId, PangContext) => {
  if (!classId) {
    return 'Any'
  }
  return PangContext.Classes
    .get(classId)
    .get('name').en // TODO: localize
}

const ItemsPangDataGrid = props => {
  const classes = useStyles(props)
  const createRowFromGameObject = go => {
    const row = {}
    for (const prop in go.props) {
      switch (prop) {
        case 'id':
        case '__id':
        case 'type':
        case 'name':
        case 'description':
        case 'class':
        case 'icon':
          continue
      }
      row[prop] = go.get(prop)
    }
    row.id = go.id
    row.type = go.type
    row.icon = go.icon
    row.name = go.get('name').en // TODO: localize
    row.description = go.get('description').en // TODO: localize
    row.class = getClassById(go.get('class'), props.PangContext)
    row.resourceId = go.get('id')
    return row
  }

  const [rowData, setRowDataState] = useState(
    Array.from(props.PangContext.Items.iter()).map(createRowFromGameObject)
  )

  useEffect(() => {
    const initializeHandler = () => setRowDataState(
      Array.from(props.PangContext.Items.iter()).map(createRowFromGameObject)
    )
    props.PangContext.on(BuiltinEvents.INITIALIZE_COMPLETED, initializeHandler)
    return () => props.PangContext.off(
      BuiltinEvents.INITIALIZE_COMPLETED,
      initializeHandler
    )
  }, [])

  const descriptionCellRenderer = params => {
    if (!params.value || params.value === 'null') {
      return ''
    }
    return params.value
  }

  const rarityCellRenderer = params => {
    return uiutils.getThemeForRarity(params.value).display
  }

  const rarityComparator = (valueA, valueB) => {
    const rankA = props.PangContext.ItemRarityRanks[valueA]
    const rankB = props.PangContext.ItemRarityRanks[valueB]
    if (rankA === rankB) {
      return 0
    }
    return rankA > rankB ? 1 : -1
  }

  const columnDefsMap = {
    id: {
      width: 55,
      minWidth: 55,
      maxWidth: 55,
    },
    icon: {
      width: 65,
      minWidth: 65,
      maxWidth: 65,
      cellRenderer: iconCellRenderer(classes),
      filter: false,
      sortable: false
    },
    name: {
      width: 200,
      minWidth: 200,
      cellRenderer: nameCellRenderer(props.PangContext.navigateSingleDataItem)
    },
    level: {
      width: 70,
      minWidth: 70,
      maxWidth: 70,
    },
    rarity: {
      width: 75,
      minWidth: 75,
      cellRenderer: rarityCellRenderer,
      comparator: rarityComparator
    },
    class: {
      width: 75,
      minWidth: 75,
    },
    subcategory: {
      width: 100,
    },
    description: {
      cellRenderer: descriptionCellRenderer
    }
  }

  const [columnDefs] = useState(TableColumnDefs.Templates.Items.map(
    col => Object.assign({}, columnDefsMap[col.field] || {}, col)
  ))

  return (
    <PangDataGrid
      PangContext={props.PangContext}
      rowHeight={40}
      rowData={rowData}
      columnDefs={columnDefs}
    />
  )
}

export default class Items extends BaseComponent {
  render () {
    return (
      <PangContentBackdrop>
        <ItemsPangDataGrid PangContext={this.props.PangContext} />
      </PangContentBackdrop>
    )
  }
}

Items.Button = class extends BaseComponent {
  constructor (...args) {
    super(...args)
    this._handleOnClick = this._handleOnClick.bind(this)
    this.i18nKey = 'components:items:button'
  }

  render () {
    return (
      <PangNavigationAccordionItem
        name={this.displayName}
        title={this.displayName}
        onClick={this._handleOnClick}
        icon={BagIcon}
        {...this.props}
      />
    )
  }

  _handleOnClick () {}
}

const useSingleViewStyles = makeStyles(() => ({
  monsterIcons: {
    backgroundColor: 'rgba(0 0 0 / 0%)',
    height: '50px',
    width: '50px',
    objectFit: 'contain'
  },
  npcImages: {
    backgroundColor: 'rgba(0 0 0 / 0%)',
    height: '100px',
    width: '100px',
    objectFit: 'contain'
  },
  primitivesTable: {
    color: props => colorForTheme(props, 80)
  },
  droppedByMonsters: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxHeight: '450px',
    overflowY: 'overlay'
  }
}))

Items.SingleView = props => {
  const classes = useSingleViewStyles(props)
  const item = props.PangContext.Items.get(props.Key)
  const itemDescription = item.get('description')?.en // TODO: localize
  item.connectEdgesFromContext(props.PangContext)
  const itemAbilities = Array.from(item.abilities())
  const itemSpawns = Array.from(item.spawns())
  const droppedBy = item.droppedByFromContext(props.PangContext)
  const soldBy = item.soldByFromContext(props.PangContext)

  const getFlyingIcon = flying => flying ? <FluffyWingIcon /> : null
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

  const [monsterLootColumnDefs] = useState([
    {
      field: 'name',
      maxWidth: 110,
      resizable: false,
      cellRenderer: params => (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-evenly',
          height: '100px'
        }}>
          <PangNameChip
            bolder
            smaller
            name={params.value}
            innerTextStyle={{ fontSize: '1.1vw' }}
            leftIcon={getRankIcon(params.data.monsterRank)}
            rightIcon={getFlyingIcon(params.data.monsterFlying)}
            onClick={() => props.PangContext.navigateSingleItem(
              params.data.drop.monster
            )}
          />
          <img className={classes.monsterIcons} src={params.data.monsterIcon} />
        </div>
      )
    },
    {
      field: 'level',
      resizable: false,
      maxWidth: 70,
      cellRenderer: params => (
        <PangDataText
          bolder
          littleBigger
          text={'Lv ' + params.value}
        />
      )
    },
    {
      field: 'droprate',
      resizable: false,
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
    }
  ])

  const monsterLootRowData = droppedBy.map(drop => ({
    name: drop.monster.get('name').en, // TODO: localize
    level: drop.monster.get('level'),
    droprate: drop.probabilityRange,
    monsterIcon: drop.monster.icon,
    monsterRank: drop.monster.get('rank'),
    monsterFlying: drop.monster.get('flying'),
    drop
  }))
  const monsterLootRowHeight = 100

  const [posColumnDefs] = useState([
    {
      field: 'npc',
      maxWidth: 150,
      resizable: false,
      cellRenderer: params => (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-evenly',
          height: '150px'
        }}>
          <PangNameChip
            bolder
            smaller
            name={params.value}
            innerTextStyle={{ fontSize: '1.1vw' }}
            onClick={() => props.PangContext.navigateSingleItem(
              params.data.pos.npc
            )}
          />
          <img className={classes.npcImages} src={params.data.npcImage} />
        </div>
      )
    },
    { field: 'shop' },
    {
      field: 'price',
      cellRenderer: params => utils.intToLocalizedString(params.value) // TODO: localize
    }
  ])

  const posRowData = soldBy.map(pos => ({
    npc: pos.npc.get('name').en, // TODO: localize
    shop: pos.shopName,
    price: item.get('buyPrice'),
    npcImage: pos.npc.image,
    pos
  }))
  const posRowHeight = 150

  const [spawnsColumnDefs] = useState([
    {
      field: 'continent',
      resizable: false
    },
    {
      field: 'navigate',
      sortable: false,
      filter: false,
      resizable: false,
      cellRenderer: params => (
        <PangNameChip
          littleBigger
          bolder
          name='Area'
          leftIcon={<CompassIcon />}
          onClick={() => { console.log({params}) }}
        />
      )
    },
  ])

  const spawnsRowData = Array.from(item.spawns()).map(spawn => ({
    continent: spawn.continent.get('name').en, // TODO: localize
    area: {
      top: spawn.get('top'),
      bottom: spawn.get('bottom'),
      left: spawn.get('left'),
      right: spawn.get('right')
    },
    world: spawn.world.id
  }))
  const spawnsRowHeight = 35

  const getTableHeightForRowCount =
    (rowCount, rowHeight) => rowCount * rowHeight

  return (
    <DataViewerContentContainer
      Generic={(
        <DataViewerGenericComponent
          Id={<PangDataText text={item.id} />}
          Name={<PangDataText
            bolder
            text={item.get('name')?.en || '[no name]' /* TODO: localize */}
            color={item.get('rarity')}
          />}
          Type={<PangDataText text={utils.camelToTextCase(item.type.name)} />}
          Level={<PangDataText text={item.get('level')} />}
          Rarity={<PangDataText
            text={uiutils.getThemeForRarity(item.get('rarity')).display}
          />}
          Class={(item.class ? (
            <PangNameChip
              name={item.class.get('name').en /* TODO: localize */}
              onClick={() => props.PangContext.navigateSingleItem(item.class)}
              leftIcon={item.class && item.get('sex') ? (
                <img src={item.class.iconForVariant(item.get('sex'))} />
              ) : null}
            />
          ) : <PangDataText text='Any' />)}
          {...props}
        />
      )}
      Icon={<PangDataViewIcon src={item.icon} {...props} />}
      {...props}
    >
      <PangDataViewPaperGroup {...props}>
        {itemDescription && itemDescription !== 'null' ? (
          <PangDataViewPaperItem size={12} {...props}>
            <PangDataText bolder text='Description' />
            <PangDataText text={itemDescription} />
          </PangDataViewPaperItem>
        ) : null}
        {itemAbilities.length
          ? (
              <PangDataViewPaperItem size={12} {...props}>
                <PangDataText bolder text='Abilities' />
                <PangDataViewPaperGroup {...props}>
                  {itemAbilities.map(ability => (
                    <PangDataViewPaperItem
                      key={ability.parameter}
                      size={4}
                      {...props}
                    >
                      <PangDataText
                        text={
                          props.PangContext.GameSchemas
                            .AbilityParameterTypesMap[ability.get('parameter')]
                        }
                      />
                      <PangDataText
                        bigger
                        bolder
                        color='green'
                        text={props.PangContext.GameSchemas.formatAbilityValue(
                          ability
                        )}
                      />
                    </PangDataViewPaperItem>
                  ))}
                </PangDataViewPaperGroup>
              </PangDataViewPaperItem>
            )
          : null
        }
        {item.transy ? (
          <PangDataViewPaperItem size={12} {...props}>
            <PangDataText bolder text='Variant' />
            <PangDataViewPaperGroup {...props}>
              <PangDataViewPaperItem
                size={12}
                innerStyle={{
                  display: 'flex',
                  justifyContent: 'space-evenly',
                  alignItems: 'center'
                }}
                {...props}
              >
                <img src={item.transy.icon} />
                <PangNameChip
                  bolder
                  littleBigger
                  name={item.transy.get('name').en /* TODO: localize */}
                  rarity={item.transy.get('rarity')}
                  onClick={() => props.PangContext.navigateSingleItem(
                    item.transy
                  )}
                />
              </PangDataViewPaperItem>
            </PangDataViewPaperGroup>
          </PangDataViewPaperItem>
        ) : null}
        {item.triggerSkill ? (
          <PangDataViewPaperItem size={12} {...props}>
            <PangDataText bolder text='Skill Trigger' />
            <PangDataViewPaperGroup {...props}>
              <PangDataViewPaperItem
                size={12}
                innerStyle={{
                  display: 'flex',
                  justifyContent: 'space-evenly',
                  alignItems: 'center'
                }}
                {...props}
              >
                <img src={item.triggerSkill.icon} />
                <PangNameChip
                  bolder
                  littleBigger
                  name={item.triggerSkill.get('name').en /* TODO: localize */}
                  onClick={() => props.PangContext.navigateSingleItem(
                    item.triggerSkill
                  )}
                />
              </PangDataViewPaperItem>
            </PangDataViewPaperGroup>
          </PangDataViewPaperItem>
        ) : null}
        {item.blinkwingTarget ? (
          <PangDataViewPaperItem size={12} {...props}>
            <PangDataText bolder text='Blinkwing Destination' />
            <PangDataViewPaperGroup {...props}>
              <PangDataViewPaperItem
                size={12}
                innerStyle={{
                  display: 'flex',
                  justifyContent: 'space-evenly',
                  alignItems: 'center'
                }}
                {...props}
              >
                <PangNameChip
                  bigger
                  bolder
                  name={item.blinkwingTarget.continent.get('name').en /*TODO: localize*/}
                  leftIcon={<ImpactPointIcon />}
                  onClick={() => {console.log(item.blinkwingTarget)}}
                />
              </PangDataViewPaperItem>
            </PangDataViewPaperGroup>
          </PangDataViewPaperItem>
        ) : null}
        <PangDataViewAccordionItem
          size={12}
          summary={<PangDataText bolder text='Sold By' />}
          {...props}
        >
          {soldBy.length ? (
            <div
              style={{
                flexDirection: 'column',
                width: '100%',
                height: getTableHeightForRowCount(
                  posRowData.length, posRowHeight
                ) + 30,
                minHeight: 200,
                maxHeight: 480,
                textAlign: 'left'
              }}
            >
              <PangDataText bolder text='NPC Shops' />
              <div style={{ width: '100%' }}>
                <PangDataGrid
                  PangContext={props.PangContext}
                  rowData={posRowData}
                  columnDefs={posColumnDefs}
                  rowHeight={posRowHeight}
                  tableStyle={{
                    height: getTableHeightForRowCount(
                      posRowData.length, posRowHeight
                    ),
                    minHeight: 170,
                    maxHeight: 450
                  }}
                />
              </div>
            </div>
          ) : null}
        </PangDataViewAccordionItem>
        <PangDataViewAccordionItem
          size={12}
          summary={<PangDataText bolder text='Obtained From' />}
          flexColumn
          {...props}
        >
          {item.location ? (
            <div
              style={{
                flexDirection: 'column',
                width: '100%',
                textAlign: 'left'
              }}
            >
              <PangDataText bolder text='Main Spawn Location' />
              <PangNameChip
                littleBigger
                bolder
                name={item.location.continent.get('name').en /*TODO: localize*/}
                leftIcon={<ImpactPointIcon />}
                onClick={() => {console.log(item.location)}}
              />
            </div>
          ) : null}
          {itemSpawns.length ? (
            <div
              style={{
                flexDirection: 'column',
                width: '100%',
                height: getTableHeightForRowCount(
                  spawnsRowData.length, spawnsRowHeight
                ) + 30,
                minHeight: 200,
                maxHeight: 480,
                textAlign: 'left'
              }}
            >
              <PangDataText bolder text='Spawns' />
              <PangDataGrid
                PangContext={props.PangContext}
                noAutoSizeAll
                rowData={spawnsRowData}
                columnDefs={spawnsColumnDefs}
                rowHeight={spawnsRowHeight}
                tableStyle={{
                  height: getTableHeightForRowCount(
                    spawnsRowData.length, spawnsRowHeight
                  ),
                  minHeight: 170,
                  maxHeight: 450
                }}
              />
            </div>
          ) : null}
          {droppedBy.length ? (
            <div
              style={{
                flexDirection: 'column',
                width: '100%',
                height: getTableHeightForRowCount(
                  monsterLootRowData.length, monsterLootRowHeight
                ),
                minHeight: 200,
                maxHeight: 480,
                textAlign: 'left'
              }}
            >
              <PangDataText bolder text='Monster Loot' />
              <div style={{ width: '100%' }}>
                <PangDataGrid
                  PangContext={props.PangContext}
                  rowData={monsterLootRowData}
                  columnDefs={monsterLootColumnDefs}
                  rowHeight={monsterLootRowHeight}
                  tableStyle={{
                    height: getTableHeightForRowCount(
                      monsterLootRowData.length, monsterLootRowHeight
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
          primitives={Array.from(item.primitives(['icon'])) || []}
          {...props}
        />
      </PangDataViewPaperGroup>
    </DataViewerContentContainer>
  )
}

Items.ROUTE = 'Items'
