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
import TrophyLaurelIcon from '../../static/images/trophy-laurel.svg'

export const nameCellRenderer = navigateSingleItem => params => params.value

const AchievementsPangDataGrid = props => {
  const createRowFromGameObject = go => ({
    id: go.id,
    name: go.get('name').en, // TODO: localize
    description: go.get('description').en, // TODO: localize
    type: go.get('type'),
    category: go.get('category'),
    accountWide: go.get('accountWide'),
    levels: JSON.stringify(Array.from(go.levels()).map(level => ({
      attackPower: level.get('attackPower'),
      name: level.get('name')?.en, // TODO: localize
      value: level.get('value')
    }))),
    title: go.title,
    target: !go.target
      ? null
      : (
          JSON.stringify({
            id: go.target.id,
            name: go.target.get('name').en, // TODO: localize
            icon: go.target.image
          })
        )
  })

  const [rowData, setRowData] = useState([])

  useEffect(() => {
    ;(async () => {
      const data = []
      for await (const a of props.PangContext.Achievements.iterHydrated()) {
        data.push(a)
      }
      setRowData(data.map(createRowFromGameObject))
    })()
  }, [])

  useEffect(() => {
    const initializeHandler = async () => {
      const data = []
      for await (const a of props.PangContext.Achievements.iterHydrated()) {
        data.push(a)
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

  const descriptionCellRenderer = params => params.value
  const typeCellRenderer = params => params.value
  const categoryCellRenderer = params => params.value
  const levelsCellRenderer = params => params.value
  const targetCellRenderer = params => params.value

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
      width: 100,
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true,
      cellRenderer: nameCellRenderer(navigateSingleItem)
    },
    {
      field: 'description',
      hide: false,
      width: 100,
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true,
      cellRenderer: descriptionCellRenderer
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
      field: 'category',
      hide: false,
      width: 100,
      minWidth: 100,
      maxWidth: 100,
      filter: true,
      sortable: true,
      cellRenderer: categoryCellRenderer
    },
    {
      field: 'accountWide',
      hide: false,
      width: 100,
      minWidth: 100,
      maxWidth: 100,
      filter: true
    },
    {
      field: 'levels',
      hide: false,
      width: 100,
      minWidth: 100,
      maxWidth: 100,
      filter: true,
      sortable: true,
      cellRenderer: levelsCellRenderer
    },
    {
      field: 'title',
      hide: false,
      width: 85,
      minWidth: 85,
      maxWidth: 85,
      filter: true,
      sortable: true
    },
    {
      field: 'target',
      hide: false,
      width: 85,
      minWidth: 85,
      maxWidth: 85,
      filter: true,
      sortable: true,
      cellRenderer: targetCellRenderer
    }
  ])

  return (
    <PangDataGrid
      PangContext={props.PangContext}
      rowHeight={40}
      rowData={rowData}
      columnDefs={columnDefs}
    />
  )
}

export default class Achievements extends BaseComponent {
  render () {
    return (
      <PangContentBackdrop>
        <AchievementsPangDataGrid PangContext={this.props.PangContext} />
      </PangContentBackdrop>
    )
  }
}

Achievements.Button = class extends BaseComponent {
  constructor (...args) {
    super(...args)
    this._handleOnClick = this._handleOnClick.bind(this)
    this.i18nKey = 'components:achievements:button'
  }

  render () {
    return (
      <PangNavigationAccordionItem
        name={this.displayName}
        title={this.displayName}
        onClick={this._handleOnClick}
        icon={TrophyLaurelIcon}
        {...this.props}
      />
    )
  }

  _handleOnClick () {}
}

Achievements.SingleView = class extends BaseComponent {
  render () {
    return <div>TODO SINGLE VIEW Achievements</div>
  }
}

Achievements.ROUTE = 'Achievements'
