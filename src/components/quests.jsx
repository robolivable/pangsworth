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
import * as config from '../clients/config'
import ScrollQuillIcon from '../../static/images/scroll-quill.svg'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({}))

const QuestsPangDataGrid = props => {
  const classes = useStyles(props)
  const createRowFromGameObject = go => ({
    id: go.id,
    name: go.get('name').en, // TODO: localize
    level: go.get('minLevel'),
    gold: go.get('endReceiveGold'),
    inventorySpaces: go.get('endReceiveInventorySpaces'),
    experience: go.get('endReceiveExperience'),
    skillPoints: go.get('endReceiveSkillPoints'),
    items: JSON.stringify(Array.from(go.endReceiveItems() || [])
      .map(questItem => ({
        name: questItem.item.get('name').en, // TODO: localize
        icon: questItem.item.icon,
        rarity: questItem.item.get('rarity'),
        level: questItem.item.get('level'),
        sex: questItem.item.get('sex')
      }))),
    karma: go.get('endReceiveKarma'),
    startNPC: JSON.stringify({
      name: go.beginNPC?.get('name').en, // TODO: localize
      image: go.beginNPC?.image,
      locations: Array.from(go.beginNPC?.locations() || [])
        .filter(loc => loc.continent || loc.world)
        .map(loc => ({
          continent: loc.continent?.get('name').en, // TODO: localize
          world: loc.world.get('name').en // TODO: localize
        }))
    }),
    classes: JSON.stringify(Array.from(go.beginClasses() || []).map(cls => ({
      name: cls.get('name').en, // TODO: localize
      iconMessenger: cls.iconStyled(
        config.API_RESOURCE_TYPES.classes.iconStyles.messenger
      )
    }))),
    type: go.get('type'),
    repeatable: go.get('repeatable'),
    shareable: go.get('partyShare')
  })
  const [rowData, setRowData] = useState([])

  useEffect(() => {
    ;(async () => {
      const data = []
      for await (const q of props.PangContext.Quests.iterHydrated()) {
        data.push(q)
      }
      setRowData(data.map(createRowFromGameObject))
    })()
  }, [])

  useEffect(() => {
    const initializeHandler = async () => {
      const data = []
      for await (const q of props.PangContext.Quests.iterHydrated()) {
        data.push(q)
      }
      setRowData(data.map(createRowFromGameObject))
    }
    props.PangContext.on(BuiltinEvents.INITIALIZE_COMPLETED, initializeHandler)
    return () => props.PangContext.off(
      BuiltinEvents.INITIALIZE_COMPLETED,
      initializeHandler
    )
  }, [])

  const nameCellRenderer = params => params.value
  const karmaCellRenderer = params => params.value
  const expCellRenderer = params => params.value
  const itemsCellRenderer = params => params.value
  const npcCellRenderer = params => params.value
  const classCellRenderer = params => params.value
  const repeatableCellRenderer = params => params.value
  const shareableCellRenderer = params => params.value

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
      cellRenderer: nameCellRenderer
    },
    {
      field: 'level',
      hide: false,
      width: 85,
      minWidth: 85,
      maxWidth: 85,
      filter: true,
      sortable: true
    },
    {
      field: 'gold',
      hide: false,
      width: 85,
      minWidth: 85,
      maxWidth: 85,
      filter: true,
      sortable: true
    },
    {
      field: 'inventorySpaces',
      hide: false,
      width: 85,
      minWidth: 85,
      maxWidth: 85,
      filter: true,
      sortable: true
    },
    {
      field: 'experience',
      hide: false,
      width: 200,
      minWidth: 200,
      maxWidth: 200,
      filter: true,
      sortable: true,
      cellRenderer: expCellRenderer
    },
    {
      field: 'skillPoints',
      hide: false,
      width: 85,
      minWidth: 85,
      maxWidth: 85,
      filter: true,
      sortable: true
    },
    {
      field: 'items',
      hide: false,
      width: 100,
      minWidth: 100,
      filter: true,
      sortable: true,
      cellRenderer: itemsCellRenderer
    },
    {
      field: 'karma',
      hide: false,
      width: 85,
      minWidth: 85,
      maxWidth: 85,
      filter: true,
      sortable: true,
      cellRenderer: karmaCellRenderer
    },
    {
      field: 'startNPC',
      hide: false,
      width: 100,
      minWidth: 100,
      filter: true,
      sortable: true,
      cellRenderer: npcCellRenderer
    },
    {
      field: 'classes',
      hide: false,
      width: 100,
      minWidth: 100,
      filter: true,
      sortable: true,
      cellRenderer: classCellRenderer
    },
    {
      field: 'type',
      hide: false,
      width: 85,
      minWidth: 85,
      maxWidth: 85,
      filter: true,
      sortable: true
    },
    {
      field: 'repeatable',
      hide: false,
      width: 100,
      minWidth: 100,
      maxWidth: 100,
      filter: true,
      //cellRenderer: repeatableCellRenderer
    },
    {
      field: 'shareable',
      hide: false,
      width: 100,
      minWidth: 100,
      maxWidth: 100,
      filter: true,
      //cellRenderer: shareableCellRenderer
    }
  ])

  return (
    <PangDataGrid
      PangContext={props.PangContext}
      rowHeight={150}
      rowData={rowData}
      columnDefs={columnDefs}
    />
  )
}

export default class Quests extends BaseComponent {
  render () {
    return <QuestsPangDataGrid PangContext={this.props.PangContext} />
  }
}

Quests.Button = class extends BaseComponent {
  constructor (...args) {
    super(...args)
    this._handleOnClick = this._handleOnClick.bind(this)
    this.i18nKey = 'components:quests:button'
  }

  render () {
    return (
      <PangNavigationAccordionItem
        name={this.displayName}
        title={this.displayName}
        onClick={this._handleOnClick}
        icon={ScrollQuillIcon}
        {...this.props}
      />
    )
  }

  _handleOnClick () {}
}

Quests.ROUTE = 'Quests'
