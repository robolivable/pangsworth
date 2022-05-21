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
  ITEM_RARITY_COLORS,
  getDarkTheme,
  DARK_CONTRAST_BG_COLOR,
  LIGHT_CONTRAST_BG_COLOR
} from './common'
import { BuiltinEvents } from '../clients/context'
import BattleGear from '../../static/images/battle-gear.svg'
import UpgradeIcon from '../../static/images/upgrade.svg'
import { makeStyles } from '@material-ui/core/styles'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import Chip from '@material-ui/core/Chip'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import * as config from '../clients/config'

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

const EquipmentSetPangDataGrid = props => {
  const classes = useStyles(props)
  const getClassById = classId => {
    if (!classId) {
      return null
    }
    return props.PangContext.Classes.get(classId)
  }
  const getIconStyleForSex = sex => {
    if (sex === 'female') {
      return config.API_RESOURCE_TYPES.classes.iconStyles.oldFemale
    }
    return config.API_RESOURCE_TYPES.classes.iconStyles.oldMale
  }
  const createRowFromGameObject = go => {
    const itemRef = Array.from(go.parts())[0]
    const cls = getClassById(itemRef?.class.id)
    const setClassIconStyle = getIconStyleForSex(itemRef?.get('sex'))
    return ({
      id: go.id,
      parts: JSON.stringify(Array.from(go.parts()).map(part => ({
        src: part.icon,
        alt: `${go.get('name').en} set piece.` // TODO: localize
      }))),
      name: go.get('name').en, // TODO: localize
      class: cls.get('name').en || null, // TODO: localize
      classPixelIcon: cls.iconStyled(setClassIconStyle) || null,
      rarity: itemRef?.get('rarity'),
      lv: itemRef?.get('level'),
      bonuses: JSON.stringify(Array.from(go.bonuses()).map(bonus => ({
        equipped: bonus.get('equipped'),
        ability: {
          parameter: bonus.ability.get('parameter'),
          add: bonus.ability.get('add'),
          rate: bonus.ability.get('rate')
        }
      })))
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

  const navigateSingleItem = item => e => {
    console.log({ item, e })
  }

  const partsCellRenderer = params => (
    <div className={classes.setPartsWrapper}>
      {JSON.parse(params.value).map(({ src, alt }, key) => (
        <Avatar
          key={key}
          variant='square'
          className={classes.setPart}
        >
          <img key={key} src={src} alt={alt} />
        </Avatar>
      ))}
    </div>
  )

  const nameCellRenderer = params => {
    const nameColor = ITEM_RARITY_COLORS[params.data.rarity].color
    if (!nameColor) {
      return params.value
    }
    const name = params.value || '[no name]'
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
        onClick={navigateSingleItem(params.data)}
      />
    )
  }

  const levelCellRenderer = params => {
    const level = params.value
    const style = overrideStyle({
      fontSize: '0.675rem'
    })()
    const innerLabel = (
      <Typography
        classes={{ root: style.root }}
        variant='subtitle2'
      >
        Lv {level}
      </Typography>
    )
    return (
      <Chip
        size='small'
        label={innerLabel}
      />
    )
  }

  const classCellRenderer = params => {
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
        className={classes.classText}
        size='small'
        icon={<img src={params.data.classPixelIcon} />}
        label={innerLabel}
      />
    )
  }

  const bonusesCellRenderer = params => {
    const bonuses = JSON.parse(params.value).reduce((prev, cur) => {
      if (!prev[cur.equipped]) {
        prev[cur.equipped] = []
      }
      prev[cur.equipped].push(cur.ability)
      return prev
    }, {})

    const bonusParameterText = ability => {
      const parameter =
        props.PangContext.EquipmentSetParameterTypes[ability.parameter]
      if (ability.add) {
        return `${parameter} +${ability.add}${ability.rate ? '%' : ''}`
      }
      if (ability.set) {
        return `${parameter} ${ability.set}${ability.rate ? '%' : ''}`
      }
      return ''
    }

    return (
      <div className={classes.bonuses}>
        <Grid
          container
          justifyContent='flex-start'
          alignItems='center'
          spacing={1}
        >
          {Object.entries(bonuses).map(([equipped, abilities], key) => (
            <Grid key={key} item xs={12}>
              <Paper
                className={classes.equippedWrapper}
                variant='outlined'
              >
                <div className={classes.equippedCount}>
                  {`${equipped}x`}
                </div>
                <div className={classes.equipped}>
                  {abilities.map((ability, key) => (
                    <Chip
                      className={classes.equippedText}
                      key={key}
                      size='small'
                      icon={ability.add ? <UpgradeIcon /> : null}
                      label={bonusParameterText(ability)}
                    />
                  ))}
                </div>
              </Paper>
            </Grid>
          ))}
        </Grid>
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
      field: 'parts',
      hide: false,
      width: 65,
      minWidth: 65,
      maxWidth: 65,
      cellRenderer: partsCellRenderer
    },
    {
      field: 'name',
      hide: false,
      width: 105,
      minWidth: 105,
      maxWidth: 105,
      filter: true,
      sortable: true,
      resizable: true,
      cellRenderer: nameCellRenderer
    },
    {
      field: 'class',
      hide: false,
      width: 120,
      minWidth: 120,
      maxWidth: 120,
      filter: true,
      sortable: true,
      cellRenderer: classCellRenderer
    },
    {
      field: 'lv',
      hide: false,
      width: 75,
      minWidth: 75,
      maxWidth: 75,
      filter: true,
      sortable: true,
      cellRenderer: levelCellRenderer
    },
    {
      field: 'bonuses',
      hide: false,
      width: 250,
      minWidth: 280,
      filter: true,
      sortable: true,
      resizable: true,
      cellRenderer: bonusesCellRenderer
    }
  ])

  return (
    <PangDataGrid
      PangContext={props.PangContext}
      rowHeight={220}
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

EquipmentSet.ROUTE = 'Equipment Set'
