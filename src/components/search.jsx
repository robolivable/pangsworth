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
  DARK_CONTRAST_COLOR,
  LIGHT_CONTRAST_COLOR,
  DARK_CONTRAST_BG_COLOR,
  LIGHT_CONTRAST_BG_COLOR,
  colorForTheme,
  PangIcon,
  PangDataGrid,
  PangNavigationAccordion
} from './common'
import SearchIcon from '../../static/images/magnifying-glass.svg'
import PangsworthLogoIcon from '../../static/images/pangsworth-logo.svg'
import * as config from '../config'
import * as utils from '../clients/utils'
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/core/styles'

import World, {
  nameCellRenderer as worldNameCellRenderer
} from './world'
import EquipmentSet, {
  // NOTE: equipment set has a separate cell renderer for search
  nameSearchCellRenderer as equipmentSetNameCellRenderer
} from './equipment-set'
import Quests, {
  nameCellRenderer as questsNameCellRenderer
} from './quests'
import Achievements, {
  nameCellRenderer as achievementsNameCellRenderer
} from './achievements'

import Classes, {
  nameCellRenderer as classesNameCellRenderer,
  iconCellRenderer as classesIconCellRenderer
} from './classes'
import Monsters, {
  nameCellRenderer as monstersNameCellRenderer,
  iconCellRenderer as monstersIconCellRenderer
} from './monsters'
import Items, {
  nameCellRenderer as itemsNameCellRenderer,
  iconCellRenderer as itemsIconCellRenderer
} from './items'
import Skills, {
  nameCellRenderer as skillsNameCellRenderer,
  iconCellRenderer as skillsIconCellRenderer
} from './skills'
import NPCs, {
  nameCellRenderer as npcsNameCellRenderer,
  iconCellRenderer as npcsIconCellRenderer
} from './npcs'

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
    top: 330,
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
  },
  icons: {
    backgroundColor: 'rgba(0 0 0 / 0%)'
  },
  iconImg: {
    width: '40px',
    height: '40px',
    objectFit: 'contain'
  },
  npcIcons: {
    height: '100px',
    width: '100px',
    backgroundColor: 'rgba(0 0 0 / %0)',
    objectFit: 'contain'
  },
  monsterIcons: {
    height: '100px',
    width: '100px',
    backgroundColor: 'rgba(0 0 0 / %0)',
    objectFit: 'contain'
  },
  pangsworthIconWrapper: {
    position: 'relative',
    top: '46px',
    left: '92px',
  },
  pangsworthIcon: {
    width: '368px',
    height: '330px',
    position: 'absolute',
    color: props => colorForTheme(props, 50)
  }
}))

const useStylesSearchBar = props => makeStyles(theme => ({
  root: {
    border: `1px solid ${colorForTheme(props, 50)}`,
    overflow: 'hidden',
    borderRadius: 4,
    backgroundColor: 'rgba(0 0 0 / 0%)',
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    '&:hover': {
     backgroundColor: 'rgba(0 0 0 / 0%)',
    },
    '&$focused': {
      backgroundColor: 'rgba(0 0 0 / 0%)',
      boxShadow: `${colorForTheme(props, 50)} 0 0 0 1px`,
      borderColor: colorForTheme(props, 50),
    },
  },
  focused: {},
  notchedOutline: {
    borderColor: 'rgba(0 0 0 / 0%) !important'
  },
  input: {
    color: colorForTheme(props, 80)
  }
}))

const useStylesSearchBarLabel = props => makeStyles(theme => ({
  root: {
    color: colorForTheme(props, 80),
    '&$focused': {
      color: colorForTheme(props, 50)
    }
  },
  focused: {
    color: colorForTheme(props, 50)
  }
}))

const PangSearchBar = props => (
  <TextField
    InputLabelProps={{ classes: useStylesSearchBarLabel(props)() }}
    InputProps={{ classes: useStylesSearchBar(props)() }}
    {...props}
  />
)

const RESERVED_PROP_NAMES = [
  '__id',
  'id',
  'name',
  'type',
  'icon',
  'image'
]

const PangResultsTable = props => {
  const classes = useStyles(props)
  const defaultColDef = useMemo(() => ({
    flex: 1,
    minWidth: 85,
    width: 85,
    hide: false,
    resizable: true,
    filter: true,
    sortable: true
  }))

  const idCellRenderer = params => params.value
  const typeCellRenderer = params => params.value

  const handleNavigateWorldItem = item => e => {}
  const handleNavigateItemsItem = item => e => {}
  const handleNavigateMonstersItem = item => e => {}
  const handleNavigateClassesItem = item => e => {}
  const handleNavigateNPCsItem = item => e => {}
  const handleNavigateEquipmentSetsItem = item => e => {}
  const handleNavigateQuestsItem = item => e => {}
  const handleNavigateAchievementsItem = item => e => {}

  const nameCellRenderer = params => {
    switch (params.data.type) {
      case 'world':
        return worldNameCellRenderer(handleNavigateWorldItem)(params)
      case 'items':
        return itemsNameCellRenderer(handleNavigateItemsItem)(params)
      case 'monsters':
        return monstersNameCellRenderer(handleNavigateMonstersItem)(params)
      case 'classes':
        return classesNameCellRenderer(handleNavigateClassesItem)(params)
      case 'npcs':
        return npcsNameCellRenderer(handleNavigateNPCsItem)(params)
      case 'equipmentSets':
        return equipmentSetNameCellRenderer(
          handleNavigateEquipmentSetsItem
        )(params)
      case 'quests':
        return questsNameCellRenderer(handleNavigateQuestsItem)(params)
      case 'achievements':
        return achievementsNameCellRenderer(
          handleNavigateAchievementsItem
        )(params)
    }
    return params.value
  }
  const iconCellRenderer = params => {
    if (!params.value) {
      return null
    }
    switch (params.data.type) {
      case 'skills':
        return skillsIconCellRenderer(props, classes)(params)
      case 'items':
        return itemsIconCellRenderer(classes)(params)
      case 'monsters':
        return monstersIconCellRenderer(classes)(params)
      case 'classes':
        return classesIconCellRenderer(classes)(params)
      case 'npcs':
        return npcsIconCellRenderer(classes)(params)
    }
    return null
  }

  const columnDefs = [
    { field: 'id', cellRenderer: idCellRenderer },
    {
      field: 'name',
      width: 150,
      minWidth: 150,
      cellRenderer: nameCellRenderer
    },
    { field: 'type', cellRenderer: typeCellRenderer },
    {
      field: 'icon',
      width: 140,
      minWidth: 140,
      maxWidth: 140,
      cellRenderer: iconCellRenderer
    }
  ]

  const createRowFromGameObject = go => {
    const { __id, id, name, type, icon, image, ...rest } = go.props
    const row = {}
    for (const [key, value] of Object.entries(rest)) {
      if (typeof value === 'boolean') {
        row[key] = value ? 'Yes' : 'No'
        continue
      }
      row[key] = value
    }
    return ({
      id: go.id,
      name: go.get('name')?.en, // TODO: localize
      type: go.type.name,
      icon: go.icon,
      [`${go.type.name}Type`]: type,
      ...row
    })
  }

  const rows = props.results.map(createRowFromGameObject)

  const columnsMap = rows.reduce((prev, cur) => {
    for (const key in cur) {
      if (RESERVED_PROP_NAMES.includes(key)) {
        continue
      }
      if (
        (!cur[key] && typeof cur[key] !== 'boolean') ||
        cur[key] === 'null' ||
        utils.isObject(cur[key]) ||
        Array.isArray(cur[key])
      ) {
        continue
      }
      prev[key] = true
    }
    return prev
  }, {})

  const cellRenderer = params => {
    return params.value
  }

  for (const key in columnsMap) {
    columnDefs.push({ field: key })
  }

  return (
    <PangDataGrid
      tableStyle={{ minHeight: 512, height: 512, marginRight: '-1px' }}
      PangContext={props.PangContext}
      defaultColDef={defaultColDef}
      columnDefs={columnDefs}
      rowData={rows}
      rowHeight={100}
    />
  )
}

const PangSearch = props => {
  const classes = useStyles(props)
  const [searchTerm, setSearchTerm] = useState(props.searchTerm)
  const [results, setResults] = useState(props.searchResults)
  const [showTable, setShowTable] = useState(!!results.length)
  const [defaultSearchTerm, setDefaultSearchTerm] = useState(undefined)

  useEffect(() => {
    setDefaultSearchTerm(searchTerm)
  }, [])

  useEffect(() => {
    ;(async () => {
      if (!props.PangContext.initialized) {
        return
      }
      const results = await props.PangContext.textSearch(searchTerm)
      props.PangContext.keepSearchResults(searchTerm, results)
      setResults(results)
      if (!searchTerm) {
        return
      }
      setShowTable(true)
    })()
  }, [searchTerm])

  const handleSearchBarOnChange = e => {
    if (defaultSearchTerm) {
      setDefaultSearchTerm(undefined)
    }
    if (!e.target.value) {
      setSearchTerm('')
      return
    }
    setSearchTerm(e.target.value)
  }

  const handleSearchBarOnBlur = e => {
    if (results.length) {
      return
    }
    setShowTable(false)
  }

  const getSearchBar = () => {
    if (defaultSearchTerm) {
      return (
        <PangSearchBar
          PangContext={props.PangContext}
          className={clsx(classes.searchBar, {
            [classes.searchBarWidth]: !showTable,
            [classes.searchBarResultsWidth]: !!showTable
          }, {
            [classes.searchBarPosition]: !showTable,
            [classes.searchBarResultsPosition]: !!showTable
          })}
          label='Search value'
          variant='filled'
          size={clsx({
            normal: !showTable,
            small: !!showTable
          })}
          onChange={handleSearchBarOnChange}
          onBlur={handleSearchBarOnBlur}
          value={defaultSearchTerm}
        />
      )
    }
    return (
      <PangSearchBar
        PangContext={props.PangContext}
        className={clsx(classes.searchBar, {
          [classes.searchBarWidth]: !showTable,
          [classes.searchBarResultsWidth]: !!showTable
        }, {
          [classes.searchBarPosition]: !showTable,
          [classes.searchBarResultsPosition]: !!showTable
        })}
        label='Search value'
        variant='outlined'
        size={clsx({
          normal: !showTable,
          small: !!showTable
        })}
        onChange={handleSearchBarOnChange}
        onBlur={handleSearchBarOnBlur}
      />
    )
  }

  return (
    <Grid
      className={classes.searchBarWrapper}
      container
      direction='column'
      justifyContent='flex-start'
      alginItems='center'
    >
      {!showTable
        ? (
          <div className={classes.pangsworthIconWrapper}>
            <PangIcon
              PangContext={props.PangContext}
              component={PangsworthLogoIcon}
              className={classes.pangsworthIcon}
              viewBox='0 0 975 875'
            />
          </div>
        )
        : null}
      {getSearchBar()}
      {showTable
        ? <div className={classes.searchBarTable}>
            <PangResultsTable
              PangContext={props.PangContext}
              results={results}
            />
          </div>
        : null}
    </Grid>
  )
}

export default class Search extends BaseComponent {
  render () {
    const [searchTerm, searchResults] =
      this.props.PangContext.getSearchResults()
    return (
      <PangSearch
        PangContext={this.props.PangContext}
        searchTerm={searchTerm}
        searchResults={searchResults}
      />
    )
  }
}

Search.Button = class extends BaseComponent {
  constructor (...args) {
    super(...args)
    this._handleOnClick = this._handleOnClick.bind(this)
    this._handleSearchAccordionStateToggle =
      this._handleSearchAccordionStateToggle.bind(this)
    this.i18nKey = 'components:search:button'
  }

  render () {
    return (
      <PangNavigationAccordion
        name={this.displayName}
        title={this.displayName}
        onClick={this._handleOnClick}
        icon={SearchIcon}
        startState={this.props.PangContext.settings.get(
          config.SETTINGS_VALUE_KEYS.states.searchAccordion
        )}
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
