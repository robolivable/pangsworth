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
import React, { useCallback, useMemo, useRef, useState } from 'react'

import BaseComponent from './base-component'
import {
  PangNavigationAccordionItem,
  getDarkTheme,
  DARK_CONTRAST_COLOR,
  LIGHT_CONTRAST_COLOR
} from './common'
import BagIcon from '../../static/images/swap-bag.svg'
import { makeStyles } from '@material-ui/core/styles'
import { BuiltinEvents } from '../clients/context'
import Avatar from '@material-ui/core/Avatar'

import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-balham.css'
import './styles/ag-tables-balham-theme.scss'

const useStyles = makeStyles(theme => ({
  table: {
    height: '552px'
  },
  icons: {
  },
  agTable: {
    color: props => `rgba(${getDarkTheme(props) ? DARK_CONTRAST_COLOR : LIGHT_CONTRAST_COLOR} / 80%)`,
    backgroundColor: 'rgba(0 0 0 / 0%)',
    borderColor: props => `rgba(${getDarkTheme(props) ? DARK_CONTRAST_COLOR : LIGHT_CONTRAST_COLOR} / 30%)`,
    backdropFilter: 'blur(10px)'
  }
}))

const ItemsAGTable = props => {
  const classes = useStyles(props)
  const createRowFromGameObject = go => ({
    additionalSkillDamage: go.get('additionalSkillDamage'),
    attackRange: go.get('attackRange'),
    attackSpeed: go.get('attackSpeed'),
    buyPrice: go.get('buyPrice'),
    category: go.get('category'),
    class: go.get('class'),
    consumable: go.get('consumable'),
    deletable: go.get('deletable'),
    description: go.get('description').en, // TODO: localize
    durationRealTime: go.get('durationRealTime'),
    element: go.get('element'),
    guildContribution: go.get('guildContribution'),
    icon: go.icon,
    id: go.id,
    level: go.get('level'),
    maxAttack: go.get('maxAttack'),
    minAttack: go.get('minAttack'),
    maxDefense: go.get('maxDefense'),
    minDefense: go.get('minDefense'),
    name: go.get('name').en, // TODO: localize
    premium: go.get('premium'),
    rarity: go.get('rarity'),
    resourceId: go.get('id'),
    sellPrice: go.get('sellPrice'),
    sex: go.get('sex'),
    shining: go.get('shining'),
    stack: go.get('stack'),
    subcategory: go.get('subcategory'),
    tradable: go.get('tradable'),
    triggerSkill: go.get('triggerSkill'),
    triggerSkillProbability: go.get('triggerSkillProbability'),
    transy: go.get('transy'),
    twoHanded: go.get('twoHanded')
  })

  const [rowData, setRowDataState] = useState(
    Array.from(props.PangContext.Items.iter()).map(createRowFromGameObject)
  )

  props.PangContext.on(BuiltinEvents.INITIALIZE_COMPLETED, () => {
    setRowDataState(
      Array.from(props.PangContext.Items.iter()).map(createRowFromGameObject)
    )
  })

  const gridRef = useRef()
  const iconCellRenderer = params => (
    <Avatar variant='square' className={classes.icons}>
      <img src={params.value} />
    </Avatar>
  )
  const descriptionCellRenderer = params => params.value || ''
  const [columnDefs] = useState([
    { field: 'id', sortable: true, resizable: true },
    { field: 'icon', resizable: true, cellRenderer: iconCellRenderer },
    { field: 'name', sortable: true, resizable: true },
    { field: 'level', sortable: true, resizable: true },
    { field: 'description', resizable: true, cellRenderer: descriptionCellRenderer },
    { field: 'attackSpeed', sortable: true, resizable: true },
    { field: 'attackRange', sortable: true, resizable: true },
    { field: 'additionalSkillDamage', sortable: true, resizable: true },
    { field: 'buyPrice', sortable: true, resizable: true },
    { field: 'category', resizable: true },
    { field: 'class', resizable: true },
    { field: 'consumable', resizable: true },
    { field: 'deletable', resizable: true },
    { field: 'durationRealTime', resizable: true },
    { field: 'element', resizable: true },
    { field: 'guildContribution', sortable: true, resizable: true },
    { field: 'maxAttack', sortable: true, resizable: true },
    { field: 'minAttack', sortable: true, resizable: true },
    { field: 'maxDefense', sortable: true, resizable: true },
    { field: 'minDefense', sortable: true, resizable: true },
    { field: 'premium', resizable: true },
    { field: 'rarity', resizable: true },
    { field: 'resourceId', sortable: true, resizable: true },
    { field: 'sellPrice', sortable: true, resizable: true },
    { field: 'sex', resizable: true },
    { field: 'shining', resizable: true },
    { field: 'stack', sortable: true, resizable: true },
    { field: 'subcategory', resizable: true },
    { field: 'tradable', resizable: true },
    { field: 'triggerSkill', resizable: true },
    { field: 'triggerSkillProbability', sortable: true, resizable: true },
    { field: 'transy', resizable: true },
    { field: 'twoHanded', resizable: true }
  ])

  const defaultColumnDef = useMemo(() => ({
    flex: 1,
    minWidth: 100,
    filter: true
  }), [])

  const onGridReady = useCallback(() => {
    gridRef.current.api.sizeColumnsToFit()
  }, [])

  return (
    <div className={`ag-theme-balham ${classes.table}`}>
      <AgGridReact
        ref={gridRef}
        rowHeight={40}
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColumnDef}
        onGridReady={onGridReady}
      />
    </div>
  )
}

export default class Items extends BaseComponent {
  render () {
    return <ItemsAGTable PangContext={this.props.PangContext} />
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

Items.ROUTE = 'Items'
