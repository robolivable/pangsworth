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
/* eslint-disable object-property-newline */
import React, { useEffect, useState } from 'react'

import BaseComponent from './base-component'
import {
  PangDataGrid,
  PangContentBackdrop,
  PangNavigationAccordionItem
} from './common'
import MimicChestIcon from '../../static/images/mimic-chest.svg'
import SpikedDragonHeadIcon from '../../static/images/spiked-dragon-head.svg'
import DeathSkullIcon from '../../static/images/death-skull.svg'
import FluffyWingIcon from '../../static/images/fluffy-wing.svg'
import { makeStyles } from '@material-ui/core/styles'
import { BuiltinEvents } from '../clients/context'
import Typography from '@material-ui/core/Typography'
import Chip from '@material-ui/core/Chip'

const useStyles = makeStyles(theme => ({
  monsterIcons: {
    backgroundColor: 'rgba(0 0 0 / 0%)',
    height: '100px',
    width: '100px',
    objectFit: 'contain'
  }
}))

const overrideTypography = root => makeStyles(theme => ({ root }))

export const nameCellRenderer = navigateSingleItem => params => {
  const name = params.value || '[no name]'
  const style = overrideTypography({
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
  const getRankIcon = rank => {
    switch (rank) {
      case 'super':
        return <SpikedDragonHeadIcon />
      case 'giant':
        return <DeathSkullIcon />
      default:
        return null
    }
  }
  const getFlyingIcon = flying => {
    switch (flying) {
      case 'Yes':
        return <FluffyWingIcon />
      default:
        return null
    }
  }
  return (
    <Chip
      icon={getRankIcon(params.data.rank)}
      size='small'
      label={innerLabel}
      onClick={navigateSingleItem(params.data)}
      onDelete={getFlyingIcon(params.data.flying) ? () => {} : null}
      deleteIcon={getFlyingIcon(params.data.flying)}
    />
  )
}

export const iconCellRenderer = classes => params => {
  const alt = `Icon for the ${params.data.name} monster.`
  return (
    <img className={classes.monsterIcons} src={params.value} alt={alt} />
  )
}

const MonstersPangDataGrid = props => {
  const classes = useStyles(props)
  const formatFlying = isFlying => isFlying ? 'Yes' : 'No'
  const createRowFromGameObject = go => ({
    id: go.id,
    icon: go.icon,
    name: go.get('name').en, // TODO: localize
    lv: go.get('level'),
    hp: go.get('hp'),
    experience: go.get('experience'),
    flying: formatFlying(go.get('flying')),
    rank: go.get('rank'),
    area: go.get('area'),
    defense: go.get('defense'),
    dex: go.get('dex'),
    element: go.get('element'),
    experienceSharing: go.get('experienceSharing'),
    hitRate: go.get('hitRate'),
    resourceId: go.get('id'),
    int: go.get('int'),
    magicDefense: go.get('magicDefense'),
    maxAttack: go.get('maxAttack'),
    maxDropGold: go.get('maxDropGold'),
    minAttack: go.get('minAttack'),
    minDropGold: go.get('minDropGold'),
    mp: go.get('mp'),
    parry: go.get('parry'),
    runaway: go.get('runaway'),
    speed: go.get('speed'),
    sta: go.get('sta'),
    str: go.get('str')
  })

  const [rowData, setRowDataState] = useState(
    Array.from(props.PangContext.Monsters.iter()).map(createRowFromGameObject)
  )

  useEffect(() => {
    const initializeHandler = () => setRowDataState(
      Array.from(props.PangContext.Monsters.iter()).map(createRowFromGameObject)
    )
    props.PangContext.on(BuiltinEvents.INITIALIZE_COMPLETED, initializeHandler)
    return () => props.PangContext.off(
      BuiltinEvents.INITIALIZE_COMPLETED,
      initializeHandler
    )
  }, [])

  const navigateSingleItem = item => e => {
    console.log({ item, e })
  }

  const [columnDefs] = useState([
    {
      field: 'id',
      width: 55,
      minWidth: 55,
      maxWidth: 55,
      sortable: true,
      filter: true,
      hide: false,
      resizable: true
    },
    {
      field: 'icon',
      width: 140,
      minWidth: 140,
      maxWidth: 140,
      hide: false,
      cellRenderer: iconCellRenderer(classes)
    },
    {
      field: 'name',
      width: 160,
      minWidth: 160,
      sortable: true,
      resizable: true,
      filter: true,
      hide: false,
      cellRenderer: nameCellRenderer(navigateSingleItem)
    },
    {
      field: 'lv',
      width: 55,
      minWidth: 55,
      maxWidth: 55,
      sortable: true,
      filter: true,
      resizable: true,
      hide: false
    },
    {
      field: 'hp',
      sortable: true,
      resizable: true,
      filter: true,
      hide: false
    },
    {
      field: 'rank',
      sortable: true,
      resizable: true,
      filter: true,
      hide: false
    },
    {
      field: 'flying',
      resizable: true,
      filter: true,
      hide: false
    },
    {
      field: 'experience',
      sortable: true,
      resizable: true,
      filter: true
    },
    {
      field: 'area',
      sortable: true,
      filter: true,
      resizable: true
    },
    {
      field: 'defense',
      sortable: true,
      filter: true,
      resizable: true
    },
    {
      field: 'dex',
      sortable: true,
      filter: true,
      resizable: true
    },
    {
      field: 'element',
      sortable: true,
      filter: true,
      resizable: true
    },
    {
      field: 'experienceSharing',
      sortable: true,
      filter: true,
      resizable: true
    },
    {
      field: 'hitRate',
      sortable: true,
      filter: true,
      resizable: true
    },
    {
      field: 'resourceId',
      sortable: true,
      filter: true,
      resizable: true
    },
    {
      field: 'int',
      sortable: true,
      filter: true,
      resizable: true
    },
    {
      field: 'magicDefense',
      sortable: true,
      filter: true,
      resizable: true
    },
    {
      field: 'maxAttack',
      sortable: true,
      filter: true,
      resizable: true
    },
    {
      field: 'maxDropGold',
      sortable: true,
      filter: true,
      resizable: true
    },
    {
      field: 'minAttack',
      sortable: true,
      filter: true,
      resizable: true
    },
    {
      field: 'minDropGold',
      sortable: true,
      filter: true,
      resizable: true
    },
    {
      field: 'mp',
      sortable: true,
      filter: true,
      resizable: true
    },
    {
      field: 'parry',
      sortable: true,
      filter: true,
      resizable: true
    },
    {
      field: 'runaway',
      sortable: true,
      filter: true,
      resizable: true
    },
    {
      field: 'speed',
      sortable: true,
      filter: true,
      resizable: true
    },
    {
      field: 'sta',
      sortable: true,
      filter: true,
      resizable: true
    },
    {
      field: 'str',
      sortable: true,
      filter: true,
      resizable: true
    }
  ])

  return (
    <PangDataGrid
      PangContext={props.PangContext}
      rowHeight={100}
      rowData={rowData}
      columnDefs={columnDefs}
    />
  )
}

export default class Monsters extends BaseComponent {
  render () {
    return (
      <PangContentBackdrop>
        <MonstersPangDataGrid PangContext={this.props.PangContext} />
      </PangContentBackdrop>
    )
  }
}

Monsters.Button = class extends BaseComponent {
  constructor (...args) {
    super(...args)
    this._handleOnClick = this._handleOnClick.bind(this)
    this.i18nKey = 'components:monsters:button'
  }

  render () {
    return (
      <PangNavigationAccordionItem
        name={this.displayName}
        title={this.displayName}
        onClick={this._handleOnClick}
        icon={MimicChestIcon}
        {...this.props}
      />
    )
  }

  _handleOnClick () {}
}

Monsters.SingleView = class extends BaseComponent {
  render () {
    return <div>TODO SINGLE VIEW Monsters</div>
  }
}

Monsters.ROUTE = 'Monsters'
