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
import React from 'react'

import BaseComponent from './base-component'
import { PangNavigationAccordion } from './common'
import SearchIcon from '../../static/images/magnifying-glass.svg'
import * as config from '../clients/config'

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

export default class Search extends BaseComponent {
  render () {
    return (
      <div>TODO Search</div>
    )
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
