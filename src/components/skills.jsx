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
  PangNavigationAccordionItem,
  getDarkTheme
} from './common'
import EnlightenmentIcon from '../../static/images/enlightenment.svg'
import AuraIcon from '../../static/images/aura.svg'
import { makeStyles } from '@material-ui/core/styles'
import { BuiltinEvents } from '../clients/context'
import * as config from '../config'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import Chip from '@material-ui/core/Chip'

const useStyles = makeStyles(theme => ({
  icons: {
    backgroundColor: 'rgba(0 0 0 / 0%)'
  },
  iconImg: {
    width: '40px',
    height: '40px',
    objectFit: 'contain'
  }
}))

const overrideTypography = root => makeStyles(theme => ({ root }))

const nameCellRenderer = navigateSingleDataItem => params => {
  const name = params.value || '[no name]'
  const style = overrideTypography({
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
  const getPassiveIcon = passive => {
    switch (passive) {
      case 'Yes':
        return <AuraIcon />
      default:
        return null
    }
  }
  return (
    <Chip
      size='small'
      label={inner}
      onClick={() => navigateSingleDataItem(params.data)}
      onDelete={getPassiveIcon(params.data.passive) ? () => {} : null}
      deleteIcon={getPassiveIcon(params.data.passive)}
    />
  )
}

const getStyleForThemeMode = isDarkTheme => {
  return isDarkTheme
    ? config.API_RESOURCE_TYPES.skills.iconStyles.colored
    : config.API_RESOURCE_TYPES.skills.iconStyles.old
}

export const iconCellRenderer = (props, classes) => params => {
  const getSrcForStyle = p => style =>
    props.PangContext.Skills.get(p.data.id).iconStyled(style)

  const getDarkThemeFromSrc = src => src.includes(
    config.API_RESOURCE_TYPES.skills.iconStyles.colored
  )

  const handleOnClick = p => e => {
    const isDarkTheme = getDarkThemeFromSrc(e.target.src)
    e.target.src = getSrcForStyle(p)(getStyleForThemeMode(!isDarkTheme))
  }

  const alt = `Icon for the ${params.data.name} skill.`
  return (
    <Avatar variant='square' className={classes.icons}>
      <img
        src={params.value}
        onClick={handleOnClick(params)}
        className={classes.iconImg}
        alt={alt}
      />
    </Avatar>
  )
}

const SkillsPangDataGrid = props => {
  const classes = useStyles(props)
  const getClassById = classId => {
    if (!classId) {
      return 'Any'
    }
    return props.PangContext.Classes.get(classId).get('name').en // TODO: localize
  }
  const formatPassive = isPassive => isPassive ? 'Yes' : 'No'
  const createRowFromGameObject = go => ({
    id: go.id,
    type: go.type,
    icon: go.iconStyled(getStyleForThemeMode(getDarkTheme(props))),
    name: go.get('name').en, // TODO: localize
    lv: go.get('level'),
    class: getClassById(go.get('class')),
    skillPoints: go.get('skillPoints'),
    passive: formatPassive(go.get('passive')),
    target: go.get('target'),
    combo: go.get('combo'),
    debuff: go.get('debuff'),
    description: go.get('description').en, // TODO: localize
    element: go.get('element'),
    flying: go.get('flying'),
    magic: go.get('magic'),
    weapon: go.get('weapon')
  })

  const [rowData, setRowDataState] = useState(
    Array.from(props.PangContext.Skills.iter()).map(createRowFromGameObject)
  )

  useEffect(() => {
    const initializeHandler = () => setRowDataState(
      Array.from(props.PangContext.Skills.iter()).map(createRowFromGameObject)
    )
    props.PangContext.on(BuiltinEvents.INITIALIZE_COMPLETED, initializeHandler)
    return () => props.PangContext.off(
      BuiltinEvents.INITIALIZE_COMPLETED,
      initializeHandler
    )
  }, [])

  const descriptionCellRenderer = params => {
    if (!params.value || params.value === 'null') {
      return ''
    }
    return params.value
  }

  const [columnDefs] = useState([
    {
      field: 'id',
      width: 55,
      minWidth: 55,
      maxWidth: 55
    },
    {
      field: 'icon',
      width: 65,
      minWidth: 65,
      maxWidth: 65,
      cellRenderer: iconCellRenderer(props, classes)
    },
    {
      field: 'name',
      width: 135,
      minWidth: 135,
      cellRenderer: nameCellRenderer(props.PangContext.navigateSingleDataItem)
    },
    { field: 'lv', width: 55, minWidth: 55, maxWidth: 55 },
    { field: 'class', width: 75 },
    { field: 'skillPoints' },
    { field: 'target' },
    { field: 'passive' },
    { field: 'description', cellRenderer: descriptionCellRenderer },
    { field: 'combo' },
    { field: 'debuff' },
    { field: 'element' },
    { field: 'flying' },
    { field: 'magic' },
    { field: 'weapon' }
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

export default class Skills extends BaseComponent {
  render () {
    return (
      <PangContentBackdrop>
        <SkillsPangDataGrid PangContext={this.props.PangContext} />
      </PangContentBackdrop>
    )
  }
}

Skills.Button = class extends BaseComponent {
  constructor (...args) {
    super(...args)
    this._handleOnClick = this._handleOnClick.bind(this)
    this.i18nKey = 'components:skills:button'
  }

  render () {
    return (
      <PangNavigationAccordionItem
        name={this.displayName}
        title={this.displayName}
        onClick={this._handleOnClick}
        icon={EnlightenmentIcon}
        {...this.props}
      />
    )
  }

  _handleOnClick () {}
}

Skills.SingleView = class extends BaseComponent {
  render () {
    return <div>TODO SINGLE VIEW Skills</div>
  }
}

Skills.ROUTE = 'Skills'
