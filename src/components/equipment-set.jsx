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
import { PangDataGrid, PangNavigationAccordionItem } from './common'
import { BuiltinEvents } from '../clients/context'
import BattleGear from '../../static/images/battle-gear.svg'
import UpgradeIcon from '../../static/images/upgrade.svg'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({}))

const EquipmentSetPangDataGrid = props => {
  const classes = useStyles(props)
  const createRowFromGameObject = go => ({
    id: go.id,
    parts: JSON.stringify(Array.from(go.parts()).map(part => part.icon)),
    name: go.get('name').en, // TODO: localize
    bonuses: JSON.stringify(Array.from(go.bonuses()).map(bonus => ({
      equipped: bonus.equipped,
      ability: {
        parameter: bonus.ability.get('parameter'),
        add: bonus.ability.get('add'),
        rate: bonus.ability.get('rate')
      }
    })))
  })

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

  const partsCellRenderer = params => params.value
  const nameCellRenderer = params => params.value
  const bonusesCellRenderer = params => params.value

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
      width: 100,
      minWidth: 100,
      maxWidth: 100,
      filter: true,
      sortable: true,
      resizable: true,
      cellRenderer: nameCellRenderer
    },
    {
      field: 'bonuses',
      hide: false,
      width: 100,
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true,
      cellRenderer: bonusesCellRenderer
    }
  ])

  return (
    <PangDataGrid
      PangContext={props.PangContext}
      rowHeight={200}
      rowData={rowData}
      columnDefs={columnDefs}
    />
  )
}

export default class EquipmentSet extends BaseComponent {
  render () {
    return <EquipmentSetPangDataGrid PangContext={this.props.PangContext} />
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
