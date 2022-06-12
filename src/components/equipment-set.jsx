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
  getDarkTheme,
  DARK_CONTRAST_BG_COLOR,
  LIGHT_CONTRAST_BG_COLOR,
  PangDataViewPaperItem,
  PangDataViewPaperGroup,
  PangDataText,
  PangNameChip,
  PangDataIcon,
  DataViewerContentContainer,
  DataViewerGenericComponent,
  PangDataViewIcon,
  PangDataPrimitivesAccordion,
  PangDataViewAccordionItem
} from './common'
import { BuiltinEvents } from '../clients/context'
import BattleGear from '../../static/images/battle-gear.svg'
import { makeStyles } from '@material-ui/core/styles'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import Chip from '@material-ui/core/Chip'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import * as config from '../config'
import * as utils from '../utils'
import * as uiutils from '../uiutils'

const useStyles = makeStyles(theme => ({
  setPartsWrapper: {
    display: 'flex',
    flexDirection: 'column'
  },
  setPart: {
    backgroundColor: 'rgba(0 0 0 / 0%)'
  },
  bonuses: {
    display: 'flex',
    flexDirection: 'column'
  },
  equippedWrapper: {
    display: 'flex',
    backgroundColor: props => {
      const themeColor =
        getDarkTheme(props) ? DARK_CONTRAST_BG_COLOR : LIGHT_CONTRAST_BG_COLOR
      return `rgba(${themeColor} / 50%)`
    },
    width: '90%',
    minWidth: 'fit-content',
    maxWidth: '280px',
    alignItems: 'center'
  },
  equippedCount: {
    paddingLeft: '10px',
    paddingRight: '10px'
  },
  equipped: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: '5px',
    paddingBottom: '5px',
    paddingLeft: '10px',
    paddingRight: '10px'
  },
  equippedText: {
    marginTop: '3px',
    maxWidth: 'fit-content'
  },
  classText: {
    maxWidth: 'fit-content'
  }
}))

const overrideStyle = root => makeStyles({ root })

export const nameSearchCellRenderer = navigateSingleItem => params => {
  const name = params.value || '[no name]'
  const nameColor =
    uiutils.getThemeForRarity(params.data.itemObject.rarity).color
  const style = overrideStyle({
    color: nameColor,
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
      size='small'
      label={innerLabel}
      onClick={() => navigateSingleItem(params.data.itemObject)}
    />
  )
}

export const iconSearchCellRenderer = classes => params => {
  const alt = `Icon for the ${params.data.name} item.`
  return <PangDataIcon src={params.value} alt={alt} classes={classes} />
}

const EquipmentSetPangDataGrid = props => {
  const classes = useStyles(props)

  const createRowFromGameObject = go => {
    const setParts = Array.from(go.parts()).map(part => {
      part.connectEdgesFromContext(props.PangContext)
      return part
    })
    const part = setParts[0]
    const iconPart = setParts[1]
    return ({
      id: go.id,
      type: go.type,
      set: Array.from(go.parts()),
      icon: iconPart.icon,
      part: part,
      name: go.get('name').en, // TODO: localize
      class: part.class.get('name').en || null, // TODO: localize
      classIcon: part.class.iconForVariant(part.get('sex')),
      rarity: part.get('rarity'),
      lv: part.get('level'),
      bonuses: Array.from(go.bonuses()).map(
        bonus => props.PangContext.GameSchemas
          .AbilityParameterTypesMap[bonus.ability.get('parameter')]
      ).join(' , ')
    })
  }

  const [rowData, setRowData] = useState([])

  useEffect(() => {
    ;(async () => {
      const data = []
      for await (const es of props.PangContext.EquipmentSets.iterHydrated()) {
        data.push(es)
      }
      setRowData(data.map(createRowFromGameObject))
    })()
  }, [])

  useEffect(() => {
    const initializeHandler = async () => {
      const data = []
      for await (const es of props.PangContext.EquipmentSets.iterHydrated()) {
        data.push(es)
      }
      setRowData(data.map(createRowFromGameObject))
    }
    props.PangContext.on(BuiltinEvents.INITIALIZE_COMPLETED, initializeHandler)
    return () => props.PangContext.off(
      BuiltinEvents.INITIALIZE_COMPLETED,
      initializeHandler
    )
  }, [])

  const [columnDefs] = useState([
    { field: 'id', maxWidth: 55, resizable: false },
    {
      field: 'set',
      maxWidth: 70,
      resizable: false,
      cellRenderer: params => params.value.map((part, key) => (
        <div
          key={key}
          style={{
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <PangDataIcon
            src={part.icon}
            title={part.get('name')?.en /* TODO: localize */}
            iconOnClick={() => props.PangContext.navigateSingleItem(part)}
          />
        </div>
      ))
    },
    {
      field: 'name',
      maxWidth: 105,
      resizable: false,
      cellRenderer: params => (
        <PangNameChip
          name={params.value}
          onClick={() => props.PangContext.navigateSingleDataItem(
            params.data
          )}
          rarity={params.data.rarity}
        />
      )
    },
    {
      field: 'class',
      maxWidth: 120,
      resizable: false,
      cellRenderer: params => (
        <PangNameChip
          name={params.value}
          onClick={() => props.PangContext.navigateSingleItem(
            params.data.part.class
          )}
          leftIcon={<img src={params.data.classIcon} />}
        />
      )
    },
    { field: 'lv', maxWidth: 55, resizable: false },
    { field: 'bonuses' }
  ])

  return (
    <PangDataGrid
      noAutoSizeAll
      PangContext={props.PangContext}
      rowHeight={170}
      rowData={rowData}
      columnDefs={columnDefs}
    />
  )
}

export default class EquipmentSet extends BaseComponent {
  render () {
    return (
      <PangContentBackdrop>
        <EquipmentSetPangDataGrid PangContext={this.props.PangContext} />
      </PangContentBackdrop>
    )
  }
}

EquipmentSet.Button = class extends BaseComponent {
  constructor (...args) {
    super(...args)
    this._handleOnClick = this._handleOnClick.bind(this)
    this.i18nKey = 'components:equipments:button'
  }

  render () {
    return (
      <PangNavigationAccordionItem
        name={this.displayName}
        title={this.displayName}
        onClick={this._handleOnClick}
        icon={BattleGear}
        {...this.props}
      />
    )
  }

  _handleOnClick () {}
}

const useSingleViewStyles = makeStyles(() => ({
}))

EquipmentSet.SingleView = props => {
  const classes = useSingleViewStyles(props)
  const set = props.PangContext.EquipmentSets.get(props.Key)
  set.connectEdgesFromContext(props.PangContext)
  const parts = Array.from(set.parts()).map(part => {
    part.connectEdgesFromContext(props.PangContext)
    return part
  })
  const singlePart = parts[0]
  return (
    <DataViewerContentContainer
      Generic={(
        <DataViewerGenericComponent
          Id={<PangDataText text={set.id} />}
          Name={<PangDataText
            bolder
            text={set.get('name').en /* TODO: localize */}
            color={singlePart.get('rarity')}
          />}
          Type={<PangDataText text={utils.camelToTextCase(set.type.name)} />}
          Level={<PangDataText text={singlePart.get('level')} />}
          Rarity={<PangDataText
            text={uiutils.getThemeForRarity(singlePart.get('rarity')).display}
          />}
          Class={<PangNameChip
            name={singlePart.class.get('name').en /* TODO: localize */}
            onClick={() => props.PangContext.navigateSingleItem(singlePart.class)}
            leftIcon={<img
              src={singlePart.class.iconForVariant(singlePart.get('sex'))}
            />}
          />}
          {...props}
        />
      )}
      Icon={(
        <div style={{
          display: 'flex',
          justifyContent: 'space-evenly'
        }}>
          {parts.map((part, key) => (
            <PangDataViewIcon
              key={key}
              src={part.icon}
              iconOnClick={() => props.PangContext.navigateSingleItem(part)}
              {...props}
            />
          ))}
        </div>
      )}
      {...props}
    >
      <PangDataViewPaperGroup {...props}>
        <PangDataViewAccordionItem
          size={12}
          summary={<PangDataText bolder text='Stat Bonuses' />}
          {...props}
        >
          <PangDataViewPaperGroup {...props}>
            {Object.entries(Array.from(set.bonuses()).reduce(
              (prev, cur) => {
                if (!prev[cur.get('equipped')]) {
                  prev[cur.get('equipped')] = []
                }
                prev[cur.get('equipped')].push(cur.ability)
                return prev
              },
              {}
            )).map(([count, abilities]) => (
              <PangDataViewPaperItem size={12} {...props}>
                <PangDataText bolder text={`${count} pcs`} />
                <PangDataViewPaperGroup {...props}>
                  {abilities.map((ability, key) => (
                    <PangDataViewPaperItem
                      key={key}
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
                        text={props.PangContext.GameSchemas.formatAbilityValue(ability)}
                      />
                    </PangDataViewPaperItem>
                  ))}
                </PangDataViewPaperGroup>
              </PangDataViewPaperItem>
            ))}
          </PangDataViewPaperGroup>
        </PangDataViewAccordionItem>
        <PangDataPrimitivesAccordion
          title='Full Details'
          primitives={Array.from(set.primitives(['icon'])) || []}
          {...props}
        />
      </PangDataViewPaperGroup>
    </DataViewerContentContainer>
  )
}

EquipmentSet.ROUTE = 'EquipmentSets'
