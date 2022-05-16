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
  PangNavigationAccordionItem,
  ITEM_RARITY_COLORS
} from './common'
import BagIcon from '../../static/images/swap-bag.svg'
import { makeStyles } from '@material-ui/core/styles'
import { BuiltinEvents } from '../clients/context'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import Chip from '@material-ui/core/Chip'

const useStyles = makeStyles(theme => ({
  icons: {
    backgroundColor: 'rgba(0 0 0 / 0%)'
  }
}))

const overrideTypography = root => makeStyles(theme => ({ root }))

const ItemsPangDataGrid = props => {
  const classes = useStyles(props)

  const getClassById = classId => {
    if (!classId) {
      return 'Any'
    }
    return props.PangContext.Classes
      .get(classId)
      .get('name').en // TODO: localize
  }

  const createRowFromGameObject = go => ({
    additionalSkillDamage: go.get('additionalSkillDamage'),
    attackRange: go.get('attackRange'),
    attackSpeed: go.get('attackSpeed'),
    buyPrice: go.get('buyPrice'),
    category: go.get('category'),
    class: getClassById(go.get('class')),
    consumable: go.get('consumable'),
    deletable: go.get('deletable'),
    description: go.get('description').en, // TODO: localize
    durationRealTime: go.get('durationRealTime'),
    element: go.get('element'),
    guildContribution: go.get('guildContribution'),
    icon: go.icon,
    id: go.id,
    lv: go.get('level'),
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

  useEffect(() => {
    const initializeHandler = () => setRowDataState(
      Array.from(props.PangContext.Items.iter()).map(createRowFromGameObject)
    )
    props.PangContext.on(BuiltinEvents.INITIALIZE_COMPLETED, initializeHandler)
    return () => props.PangContext.off(
      BuiltinEvents.INITIALIZE_COMPLETED,
      initializeHandler
    )
  }, [])

  const iconCellRenderer = params => {
    const alt = `Icon for the ${params.data.name} item.`
    return (
      <Avatar variant='square' className={classes.icons}>
        <img src={params.value} alt={alt} />
      </Avatar>
    )
  }

  const descriptionCellRenderer = params => {
    if (!params.value || params.value === 'null') {
      return ''
    }
    return params.value
  }

  const navigateSingleItem = item => e => {
    console.log({ item, e })
  }

  const nameCellRenderer = params => {
    const nameColor = ITEM_RARITY_COLORS[params.data.rarity].color
    if (!nameColor) {
      return params.value
    }
    const name = params.value || '[no name]'
    const style = overrideTypography({
      color: nameColor,
      fontSize: '0.675rem'
    })()
    const inner = (
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
        label={inner}
        onClick={navigateSingleItem(params.data)}
      />
    )
  }

  const rarityCellRenderer = params => {
    return ITEM_RARITY_COLORS[params.value].display
  }

  const rarityComparator = (valueA, valueB) => {
    const rankA = props.PangContext.ItemRarityRanks[valueA]
    const rankB = props.PangContext.ItemRarityRanks[valueB]
    if (rankA === rankB) {
      return 0
    }
    return rankA > rankB ? 1 : -1
  }

  const [columnDefs] = useState([
    {
      field: 'id',
      width: 55,
      minWidth: 55,
      maxWidth: 55,
      sortable: true,
      filter: true,
      hide: false
    },
    {
      field: 'icon',
      width: 65,
      minWidth: 65,
      maxWidth: 65,
      hide: false,
      cellRenderer: iconCellRenderer
    },
    {
      field: 'name',
      width: 200,
      minWidth: 200,
      sortable: true,
      resizable: true,
      filter: true,
      hide: false,
      cellRenderer: nameCellRenderer
    },
    {
      field: 'lv',
      width: 55,
      minWidth: 55,
      maxWidth: 55,
      sortable: true,
      filter: true,
      hide: false
    },
    {
      field: 'rarity',
      width: 75,
      resizable: true,
      minWidth: 75,
      sortable: true,
      filter: true,
      hide: false,
      cellRenderer: rarityCellRenderer,
      comparator: rarityComparator
    },
    {
      field: 'class',
      width: 75,
      resizable: true,
      sortable: true,
      filter: true,
      hide: false
    },
    {
      field: 'category',
      width: 85,
      resizable: true,
      sortable: true,
      filter: true,
      hide: false
    },
    {
      field: 'subcategory',
      width: 100,
      resizable: true,
      sortable: true,
      filter: true,
      hide: false
    },
    {
      field: 'buyPrice',
      sortable: true,
      resizable: true,
      filter: true
    },
    {
      field: 'sellPrice',
      sortable: true,
      resizable: true,
      filter: true
    },
    {
      field: 'description',
      resizable: true,
      filter: true,
      cellRenderer: descriptionCellRenderer
    },
    {
      field: 'attackSpeed',
      sortable: true,
      resizable: true,
      filter: true
    },
    {
      field: 'attackRange',
      sortable: true,
      resizable: true,
      filter: true
    },
    {
      field: 'additionalSkillDamage',
      sortable: true,
      resizable: true,
      filter: true
    },
    {
      field: 'consumable',
      resizable: true,
      filter: true
    },
    {
      field: 'deletable',
      resizable: true,
      filter: true
    },
    {
      field: 'durationRealTime',
      resizable: true,
      filter: true
    },
    {
      field: 'element',
      resizable: true,
      filter: true
    },
    {
      field: 'guildContribution',
      sortable: true,
      resizable: true,
      filter: true
    },
    {
      field: 'maxAttack',
      sortable: true,
      resizable: true,
      filter: true
    },
    {
      field: 'minAttack',
      sortable: true,
      resizable: true,
      filter: true
    },
    {
      field: 'maxDefense',
      sortable: true,
      resizable: true,
      filter: true
    },
    {
      field: 'minDefense',
      sortable: true,
      resizable: true,
      filter: true
    },
    {
      field: 'premium',
      resizable: true,
      filter: true
    },
    {
      field: 'resourceId',
      sortable: true,
      resizable: true,
      filter: true
    },
    {
      field: 'sex',
      sortable: true,
      resizable: true,
      filter: true
    },
    {
      field: 'shining',
      resizable: true,
      filter: true
    },
    {
      field: 'stack',
      sortable: true,
      resizable: true,
      filter: true
    },
    {
      field: 'tradable',
      resizable: true,
      filter: true
    },
    {
      field: 'triggerSkill',
      resizable: true,
      filter: true
    },
    {
      field: 'triggerSkillProbability',
      sortable: true,
      resizable: true,
      filter: true
    },
    {
      field: 'transy',
      resizable: true,
      filter: true
    },
    {
      field: 'twoHanded',
      resizable: true,
      filter: true
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

export default class Items extends BaseComponent {
  render () {
    return <ItemsPangDataGrid PangContext={this.props.PangContext} />
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
