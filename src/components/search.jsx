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
import React, { useEffect, useMemo, useState } from 'react'

import clsx from 'clsx'
import BaseComponent from './base-component'
import {
  PangDataGrid,
  PangNavigationAccordion
} from './common'
import SearchIcon from '../../static/images/magnifying-glass.svg'
import * as config from '../clients/config'
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/core/styles'

import World from './world'
import Classes from './classes'
import Monsters from './monsters'
import Items from './items'
import EquipmentSet from './equipment-set'
import Skills from './skills'
import NPCs from './npcs'
import Quests from './quests'
import Achievements from './achievements'

const SearchSubRoutes = {
  [World.ROUTE]: World,
  [Monsters.ROUTE]: Monsters,
  [Items.ROUTE]: Items,
  [EquipmentSet.ROUTE]: EquipmentSet,
  [Classes.ROUTE]: Classes,
  [Skills.ROUTE]: Skills,
  [NPCs.ROUTE]: NPCs,
  [Quests.ROUTE]: Quests,
  [Achievements.ROUTE]: Achievements
}

const useStyles = makeStyles(theme => ({
  searchBarWrapper: {
    width: '-webkit-fill-available',
    alignContent: 'center'
  },
  searchBar: {
    backdropFilter: 'blur(10px)',
  },
  searchBarTable: {
    backdropFilter: 'blur(10px)',
  },
  searchBarWidth: {
    width: '80%',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.shortest
    })
  },
  searchBarResultsWidth: {
    width: '-webkit-fill-available',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.shortest
    })
  },
  searchBarPosition: {
    top: 300,
    transition: theme.transitions.create('top', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.shortest
    })
  },
  searchBarResultsPosition: {
    top: 0,
    transition: theme.transitions.create('top', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.shortest
    })
  }
}))

const PangSearchBar = props => <TextField {...props} />

const RESERVED_PROP_NAMES = [
  '__id',
  'id',
  'name',
  'type',
  'icon',
  'image'
]

const PangResultsTable = props => {
  const defaultColDef = useMemo(() => ({
    flex: 1,
    minWidth: 85,
    width: 85,
    hide: false,
    resizable: true,
    filter: true,
    sortable: true
  }))

  const columnDefs = [
    { field: 'id' },
    { field: 'name' },
    { field: 'type' },
    { field: 'icon' }
  ]

  const createRowFromGameObject = go => {
    const { __id, id, name, type, icon, image, ...rest } = go.props
    return ({
      id: go.id,
      name: go.get('name')?.en, // TODO: localize
      type: go.type.name,
      icon: go.icon,
      [`${go.type.name}Type`]: type,
      ...rest
    })
  }

  const rows = props.results.map(createRowFromGameObject)

  const columnsMap = rows.reduce((prev, cur) => {
    for (const key in cur) {
      if (RESERVED_PROP_NAMES.includes(key)) {
        continue
      }
      if (!cur[key]) {
        continue
      }
      prev[key] = cur[key]
    }
    return prev
  }, {})

  for (const key in columnsMap) {
    columnDefs.push({ field: key })
  }

  return (
    <PangDataGrid
      PangContext={props.PangContext}
      defaultColDef={defaultColDef}
      columnDefs={columnDefs}
      rowData={rows}
      rowHeight={100}
    />
  )
}

const PangSearch = props => {
  const classes = useStyles()
  const [results, setResults] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    ;(async () => {
      if (!props.PangContext.initialized) {
        return
      }
      if (!searchTerm) {
        return
      }
      const results = await props.PangContext.textSearch(searchTerm)
      setResults(results)
    })()
  }, [searchTerm])

  const handleSearchBarOnChange = e => {
    if (!e.target.value) {
      setSearchTerm('')
      return
    }
    setSearchTerm(e.target.value)
  }

  return (
    <Grid
      className={classes.searchBarWrapper}
      container
      direction='column'
      justifyContent='flex-start'
      alginItems='center'
    >
      <PangSearchBar
        PangContext={props.PangContext}
        className={clsx(classes.searchBar, {
          [classes.searchBarWidth]: !results.length,
          [classes.searchBarResultsWidth]: !!results.length
        }, {
          [classes.searchBarPosition]: !results.length,
          [classes.searchBarResultsPosition]: !!results.length
        })}
        label='Search value'
        variant='outlined'
        size={clsx({
          normal: !results.length,
          small: !!results.length
        })}
        onChange={handleSearchBarOnChange}
      />
      {results.length
        ? <PangResultsTable
            className={classes.searchBarTable}
            PangContext={props.PangContext}
            results={results}
          />
        : null}
    </Grid>
  )
}

export default class Search extends BaseComponent {
  render () {
    return <PangSearch PangContext={this.props.PangContext} />
  }
}

Search.Button = class extends BaseComponent {
  constructor (...args) {
    super(...args)
    this._handleOnClick = this._handleOnClick.bind(this)
    this._handleSearchAccordionStateToggle = this._handleSearchAccordionStateToggle.bind(this)
    this.i18nKey = 'components:search:button'
  }

  render () {
    return (
      <PangNavigationAccordion
        name={this.displayName}
        title={this.displayName}
        onClick={this._handleOnClick}
        icon={SearchIcon}
        startState={this.props.PangContext.settings.get(config.SETTINGS_VALUE_KEYS.states.searchAccordion)}
        onAccordionToggle={this._handleSearchAccordionStateToggle}
        {...this.props}
      >
        {Object.entries(SearchSubRoutes).map(
          ([Route, Pangponent]) => React.createElement(Pangponent.Button, {
            ...this.props,
            key: Route,
            _handleRoute: this.props._handleRouteChangeRef(Route)
          })
        )}
      </PangNavigationAccordion>
    )
  }

  _handleOnClick () {}

  _handleSearchAccordionStateToggle (state) {
    this.props.PangContext.settings.set(
      config.SETTINGS_VALUE_KEYS.states.searchAccordion, state
    )
    this.props.PangContext.saveSettings()
  }
}

Search.ROUTE = 'Search'
