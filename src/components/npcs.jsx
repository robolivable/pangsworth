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
import BlacksmithIcon from '../../static/images/blacksmith.svg'
import SwapBagIcon from '../../static/images/swap-bag.svg'
import CoinsIcon from '../../static/images/coins.svg'
import AuraIcon from '../../static/images/aura.svg'
import SpawnNodeIcon from '../../static/images/spawn-node.svg'
import StoneCraftingIcon from '../../static/images/stone-crafting.svg'
import ShiningSwordIcon from '../../static/images/shining-sword.svg'
import CardExchangeIcon from '../../static/images/card-exchange.svg'
import UpgradeIcon from '../../static/images/upgrade.svg'
import CrossedSwordsIcon from '../../static/images/crossed-swords.svg'
import BankIcon from '../../static/images/bank.svg'
import ColiseumIcon from '../../static/images/coliseum.svg'
import FairyWandIcon from '../../static/images/fairy-wand.svg'
import ChatBubbleIcon from '../../static/images/chat-bubble.svg'
import { makeStyles } from '@material-ui/core/styles'
import Chip from '@material-ui/core/Chip'
import Typography from '@material-ui/core/Typography'

const menuTypeIcons = {
  Dialog: <ChatBubbleIcon />,
  Trade: <SwapBagIcon />,
  Bank: <CoinsIcon />,
  Buff: <AuraIcon />,
  Lodelight: <SpawnNodeIcon />,
  Craft: <StoneCraftingIcon />,
  Piercing: <ShiningSwordIcon />,
  Exchange: <CardExchangeIcon />,
  Upgrade: <UpgradeIcon />,
  Arena: <CrossedSwordsIcon />,
  Guild: <BankIcon />,
  Siege: <ColiseumIcon />,
  Hair: <FairyWandIcon />
}

const getIconTypeForMenuType = menu => {
  if (menu.includes('dialog')) return 'Dialog'
  if (menu.includes('trade')) return 'Trade'
  if (menu.includes('bank')) return 'Bank'
  if (menu.includes('buff')) return 'Buff'
  if (menu.includes('lodelight')) return 'Lodelight'
  if (menu.includes('craft')) return 'Craft'
  if (menu.includes('piercing')) return 'Piercing'
  if (menu.includes('exchange')) return 'Exchange'
  if (menu.includes('upgrade')) return 'Upgrade'
  if (menu.includes('arena')) return 'Arena'
  if (menu.includes('guild')) return 'Guild'
  if (menu.includes('siege')) return 'Siege'
  if (menu.includes('hair')) return 'Hair'
  return ''
}

const useStyles = makeStyles(theme => ({
  icons: {
    backgroundColor: 'rgba(0 0 0 / 0%)',
    height: '150px',
    width: '150px',
    objectFit: 'contain'
  },
  iconsWrapper: {
    display: 'flex',
    flexFlow: 'wrap'
  }
}))

const overrideStyle = root => makeStyles(theme => ({ root }))

const NPCsPangDataGrid = props => {
  const classes = useStyles(props)
  const formatMenus = menus => {
    if (!menus.length) {
      return []
    }
    return menus.join(',')
  }
  const createRowFromGameObject = go => ({
    id: go.id,
    image: go.image,
    name: go.get('name').en, // TODO: localize
    menus: formatMenus(go.get('menus'))
    // locations: getLocations(go.get('place'))
  })

  const [rowData, setRowDataState] = useState(
    Array.from(props.PangContext.NPCs.iter()).map(createRowFromGameObject)
  )

  useEffect(() => {
    const initializeHandler = () => setRowDataState(
      Array.from(props.PangContext.NPCs.iter()).map(createRowFromGameObject)
    )
    props.PangContext.on(BuiltinEvents.INITIALIZE_COMPLETED, initializeHandler)
    return () => props.PangContext.off(
      BuiltinEvents.INITIALIZE_COMPLETED,
      initializeHandler
    )
  }, [])

  const iconCellRenderer = params => {
    const alt = `Icon for the ${params.data.name} non-player character.`
    return (
      <img
        className={classes.icons}
        src={params.value}
        alt={alt}
      />
    )
  }

  const navigateSingleItem = item => e => {
    console.log({ item, e })
  }

  const nameCellRenderer = params => {
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
        size='small'
        label={innerLabel}
        onClick={navigateSingleItem(params.data)}
      />
    )
  }

  const menusCellRenderer = params => {
    const icons = {}
    const style = overrideStyle({
      margin: '1px'
    })()
    const menus = params.value.split(',')
    for (const menu of menus) {
      const icon = getIconTypeForMenuType(menu)
      if (!icon) {
        continue
      }
      icons[icon] = true
    }
    return (
      <div className={classes.iconsWrapper}>
        {Object.keys(icons).map((menu, key) => (
          <Chip
            classes={{ root: style.root }}
            key={key}
            size='small'
            icon={menuTypeIcons[menu]}
            label={menu}
          />
        ))}
      </div>
    )
  }

  // const locationsCellRenderer = params => {}

  const [columnDefs] = useState([
    { field: 'id', width: 55, minWidth: 55, maxWidth: 55, sortable: true, filter: true, hide: false },
    { field: 'image', width: 175, minWidth: 175, maxWidth: 175, hide: false, cellRenderer: iconCellRenderer },
    { field: 'name', width: 200, minWidth: 200, sortable: true, resizable: true, filter: true, hide: false, cellRenderer: nameCellRenderer },
    { field: 'menus', width: 120, minWidth: 120, maxWidth: 120, hide: false, cellRenderer: menusCellRenderer, filter: true }
    // { field: 'locations', width: 100, minWidth: 100, maxWidth: 100, sortable: true, filter: true, hide: false, cellRenderer: locationsCellRenderer }
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

export default class NPCs extends BaseComponent {
  render () {
    return <NPCsPangDataGrid PangContext={this.props.PangContext} />
  }
}

NPCs.Button = class extends BaseComponent {
  constructor (...args) {
    super(...args)
    this._handleOnClick = this._handleOnClick.bind(this)
    this.i18nKey = 'components:npcs:button'
  }

  render () {
    return (
      <PangNavigationAccordionItem
        name={this.displayName}
        title={this.displayName}
        onClick={this._handleOnClick}
        icon={BlacksmithIcon}
        {...this.props}
      />
    )
  }

  _handleOnClick () {}
}

NPCs.ROUTE = 'NPCs'
