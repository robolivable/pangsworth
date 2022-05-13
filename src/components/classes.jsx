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
import React, { useState, useMemo, useCallback } from 'react'

import BaseComponent from './base-component'
import {
  PangDataGrid,
  PangNavigationAccordionItem,
  getDarkTheme,
  DARK_CONTRAST_COLOR,
  LIGHT_CONTRAST_COLOR
} from './common'
import FamilyTreeIcon from '../../static/images/family-tree.svg'
import { makeStyles } from '@material-ui/core/styles'
import { BuiltinEvents } from '../clients/context'
import * as config from '../clients/config'
import Typography from '@material-ui/core/Typography'
import Chip from '@material-ui/core/Chip'
import Grid from '@material-ui/core/Grid'
import Slider from '@material-ui/core/Slider'
import Input from '@material-ui/core/Input'
import Tooltip from '@material-ui/core/Tooltip'

import { evaluate as mathJSEval } from 'mathjs'

const useStyles = makeStyles(theme => ({
  icons: {
    backgroundColor: 'rgba(0 0 0 / 0%)'
  },
  iconImage: {
    backgroundColor: 'rgba(0 0 0 / 0%)',
    width: '64px',
    height: '64px',
    objectFit: 'contain'
  },
  iconPixelsWrapper: {
    display: 'flex',
    flexDirection: 'column'
  },
  iconPixels: {
    width: '16px',
    height: '16px',
    objectFit: 'contain'
  },
  statCalculator: {
    display: 'flex',
    flexDirection: 'column',
    height: '100px'
  },
  statCalculatorInput: {
    width: 36,
    fontSize: '0.725rem',
    color: props =>
      `rgba(${getDarkTheme(props) ? DARK_CONTRAST_COLOR : LIGHT_CONTRAST_COLOR} / 80%)`,
    '&::before': {
      borderBottomColor: props =>
        `rgba(${getDarkTheme(props) ? DARK_CONTRAST_COLOR : LIGHT_CONTRAST_COLOR} / 80%)`
    }
  }
}))

const overrideTypography = root => makeStyles({ root })
const overrideSlider = ({ root, markLabel }) => makeStyles({ root, markLabel })
const overrideGrid = root => makeStyles({ root })

const SliderValueLabelComponent = props => {
  const { children, open, value } = props

  return (
    <Tooltip open={open} enterTouchDelay={0} placement='top' title={value}>
      {children}
    </Tooltip>
  )
}

const StatCalculator = props => {
  const classes = useStyles(props)
  const minLevel = props.minLevel || 0
  const maxLevel = props.maxLevel || 120
  const [level, setLevel] = useState([props.level || minLevel])
  const [stat, setStat] = useState([props.stat.value || 0])
  const evaluation = useMemo(() => {
    let lv = level
    let st = stat
    if (!lv || lv < minLevel) {
      lv = minLevel
    }
    if (!st || st < 0) {
      st = 0
    }
    let exp = props.expression.replaceAll('level', lv)
    exp = exp.replaceAll(props.stat.name, st)
    return Math.round(mathJSEval(exp))
  }, [level, stat])

  const getMarks = (min, max) => ([
    { value: min, label: min + '' },
    {
      value: Math.round(min + ((max - min) / 2)),
      label: Math.round(min + ((max - min) / 2)) + ''
    },
    { value: max, label: max + '' }
  ])
  const getLevelMarks = getMarks
  const getStatMarks = useCallback(
    () => getMarks(0, getMaxStatPointsForLevel(level)),
    [level]
  )
  const handleLevelSliderChange = (_, value) => setLevel(value)
  const handleLevelInputChange = event => setLevel(Number(event.target.value) || minLevel)
  const handleLevelInputOnBlur = () => {
    if (!level || level < minLevel) {
      setLevel(minLevel)
    }
    if (level > maxLevel) {
      setLevel(maxLevel)
    }
  }
  const handleStatSliderChange = (_, value) => setStat(value)
  const handleStatInputChange = event => setStat(Number(event.target.value) || 0)
  const handleStatInputOnBlur = () => {
    const maxStat = getMaxStatPointsForLevel(level)
    if (!stat || level < 0) {
      setStat(0)
      return
    }
    if (stat > maxStat) {
      setStat(maxStat)
      return // eslint-disable-line
    }
  }
  const getMaxStatPointsForLevel = lv => (lv - 1) * 2

  const sliderStyle = overrideSlider({
    root: {
      padding: '10px 0',
      height: 0,
      color: `rgba(${getDarkTheme(props) ? DARK_CONTRAST_COLOR : LIGHT_CONTRAST_COLOR} / 80%)`,
      marginBottom: 0,
      marginLeft: 10,
      width: '90%'
    },
    markLabel: {
      color: `rgba(${getDarkTheme(props) ? DARK_CONTRAST_COLOR : LIGHT_CONTRAST_COLOR} / 80%)`,
      fontSize: '0.725rem',
      top: '17px'
    }
  })()
  const gridCaptionStyle = overrideGrid({
    width: '25px',
    flexShrink: 1
  })()
  const gridSliderStyle = overrideGrid({
    padding: '2px'
  })()
  const gridInputStyle = overrideGrid({
    width: '50px',
    flexShrink: 1
  })()

  return (
    <div className={classes.statCalculator}>
      <Typography variant='subtitle2'>
        {`${props.type}: ${evaluation}`}
      </Typography>
      <Grid container spacing={2} alignItems='center'>
        <Grid classes={{ root: gridCaptionStyle.root }} item>
          <Typography variant='caption'>lv</Typography>
        </Grid>
        <Grid classes={{ root: gridSliderStyle.root }} item xs>
          <Slider
            classes={{ root: sliderStyle.root, markLabel: sliderStyle.markLabel }}
            PangContext={props.PangContext}
            value={level}
            ValueLabelComponent={SliderValueLabelComponent}
            marks={getLevelMarks(minLevel, maxLevel)}
            onChange={handleLevelSliderChange}
            min={minLevel}
            max={maxLevel}
          />
        </Grid>
        <Grid classes={{ root: gridInputStyle.root }} item>
          <Input
            className={classes.statCalculatorInput}
            value={level}
            margin='dense'
            onChange={handleLevelInputChange}
            onBlur={handleLevelInputOnBlur}
            inputProps={{
              step: 5,
              min: minLevel,
              max: maxLevel,
              type: 'number',
              'aria-labelledby': 'input-slider'
            }}
          />
        </Grid>
      </Grid>
      <Grid container spacing={2} alignItems='center'>
        <Grid classes={{ root: gridCaptionStyle.root }} item>
          <Typography variant='caption'>{props.stat.name}</Typography>
        </Grid>
        <Grid classes={{ root: gridSliderStyle.root }} item xs>
          <Slider
            classes={{ root: sliderStyle.root, markLabel: sliderStyle.markLabel }}
            PangContext={props.PangContext}
            value={stat}
            ValueLabelComponent={SliderValueLabelComponent}
            marks={level > 1 ? getStatMarks() : null}
            disabled={level === 1}
            onChange={handleStatSliderChange}
            min={0}
            max={getMaxStatPointsForLevel(level)}
          />
        </Grid>
        <Grid classes={{ root: gridInputStyle.root }} item>
          <Input
            className={classes.statCalculatorInput}
            value={stat}
            margin='dense'
            onChange={handleStatInputChange}
            onBlur={handleStatInputOnBlur}
            inputProps={{
              step: 1,
              min: 0,
              max: getMaxStatPointsForLevel(level),
              type: 'number',
              'aria-labelledby': 'input-slider'
            }}
          />
        </Grid>
      </Grid>
    </div>
  )
}

const ClassesPangDataGrid = props => {
  const classes = useStyles(props)

  const getParentById = parentId => {
    if (!parentId) {
      return 'None'
    }
    return props.PangContext.Classes.get(parentId).get('name').en // TODO: localize
  }

  const createRowFromGameObject = go => ({
    id: go.id,
    icon: go.icon,
    iconMessenger: {
      messenger: go.iconStyled(config.API_RESOURCE_TYPES.classes.iconStyles.messenger),
      oldFemale: go.iconStyled(config.API_RESOURCE_TYPES.classes.iconStyles.oldFemale),
      oldMale: go.iconStyled(config.API_RESOURCE_TYPES.classes.iconStyles.oldMale)
    },
    name: go.get('name').en, // TODO: localize
    maxLevel: go.get('maxLevel'),
    minLevel: go.get('minLevel'),
    maxHP: go.get('maxHP'),
    maxFP: go.get('maxFP'),
    maxMP: go.get('maxMP'),
    type: go.get('type'),
    parent: getParentById(go.get('parent'))
  })

  const [rowData, setRowDataState] = useState(
    Array.from(props.PangContext.Classes.iter()).map(createRowFromGameObject)
  )

  // NOTE: We useEffect here to make sure we can properly clean up event
  // listeners. This is boilerplate for all components that depend on
  // the context initialization. We may be able to reduce this by doing
  // it as part of the common component, but the issue is that we
  // currently depend on each child component state (setRowDataState)
  // for these operations.
  useEffect(() => {
    const initializeHandler = () => setRowDataState(
      Array.from(props.PangContext.Classes.iter()).map(createRowFromGameObject)
    )
    props.PangContext.on(BuiltinEvents.INITIALIZE_COMPLETED, initializeHandler)
    return () => props.PangContext.off(
      BuiltinEvents.INITIALIZE_COMPLETED,
      initializeHandler
    )
  }, [])

  const iconCellRenderer = params => {
    const alt = `Icon for the ${params.data.name} class.`
    return <img className={classes.iconImage} src={params.value} alt={alt} />
  }

  const iconMessengerCellRenderer = params => {
    const alt1 = `Pixel messenger icon for the ${params.data.name} class.`
    const alt2 = `Old pixel icon for the feminine ${params.data.name} class.`
    const alt3 = `Old pixel messenger icon for the masculine ${params.data.name} class.`
    return (
      <div className={classes.iconPixelsWrapper}>
        <img className={classes.iconPixels} src={params.value.messenger} alt={alt1} />
        <img className={classes.iconPixels} src={params.value.oldFemale} alt={alt2} />
        <img className={classes.iconPixels} src={params.value.oldMale} alt={alt3} />
      </div>
    )
  }

  const navigateSingleItem = item => e => {
    console.log({ item, e })
  }

  const nameCellRenderer = params => {
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
    return (
      <Chip
        size='small'
        label={innerLabel}
        onClick={navigateSingleItem(params.data)}
      />
    )
  }

  const maxHPCellRenderer = params => (
    <StatCalculator
      PangContext={props.PangContext}
      type='HP'
      expression={params.value}
      minLevel={params.data.minLevel}
      maxLevel={params.data.maxLevel}
      stat={{ name: 'sta' }}
    />
  )
  const maxFPCellRenderer = params => (
    <StatCalculator
      PangContext={props.PangContext}
      type='FP'
      expression={params.value}
      minLevel={params.data.minLevel}
      maxLevel={params.data.maxLevel}
      stat={{ name: 'sta' }}
    />
  )
  const maxMPCellRenderer = params => (
    <StatCalculator
      PangContext={props.PangContext}
      expression={params.value}
      type='MP'
      minLevel={params.data.minLevel}
      maxLevel={params.data.maxLevel}
      stat={{ name: 'int' }}
    />
  )

  const iconComparator = (_, __, nodeA, nodeB) => {
    const rankA = props.PangContext.ClassRanks[nodeA.data.name]
    const rankB = props.PangContext.ClassRanks[nodeB.data.name]
    if (rankA === rankB) {
      return 0
    }
    return rankA > rankB ? 1 : -1
  }

  const [columnDefs] = useState([
    { field: 'id', width: 55, minWidth: 55, maxWidth: 55, sortable: true, filter: true, hide: false, resizable: true },
    { field: 'icon', width: 90, minWidth: 90, maxWidth: 90, hide: false, cellRenderer: iconCellRenderer, sortable: true, comparator: iconComparator },
    { field: 'iconMessenger', width: 55, minWidth: 55, maxWidth: 55, hide: false, cellRenderer: iconMessengerCellRenderer },
    { field: 'name', width: 100, minWidth: 100, sortable: true, filter: true, hide: false, resizable: true, cellRenderer: nameCellRenderer },
    { field: 'maxHP', width: 210, minWidth: 210, maxWidth: 210, hide: false, cellRenderer: maxHPCellRenderer },
    { field: 'maxFP', width: 210, minWidth: 210, maxWidth: 210, hide: false, cellRenderer: maxFPCellRenderer },
    { field: 'maxMP', width: 210, minWidth: 210, maxWidth: 210, hide: false, cellRenderer: maxMPCellRenderer },
    { field: 'type', width: 100, minWidth: 100, sortable: true, filter: true, hide: false, resizable: true },
    { field: 'parent', width: 100, minWidth: 100, sortable: true, filter: true, hide: false, resizable: true },
    { field: 'maxLevel', width: 75, minWidth: 75, maxWidth: 75, sortable: true, filter: true, resizable: true },
    { field: 'minLevel', width: 75, minWidth: 75, maxWidth: 75, sortable: true, filter: true, resizable: true }
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

export default class Classes extends BaseComponent {
  render () {
    return <ClassesPangDataGrid PangContext={this.props.PangContext} />
  }
}

Classes.Button = class extends BaseComponent {
  constructor (...args) {
    super(...args)
    this._handleOnClick = this._handleOnClick.bind(this)
    this.i18nKey = 'components:classes:button'
  }

  render () {
    return (
      <PangNavigationAccordionItem
        name={this.displayName}
        title={this.displayName}
        onClick={this._handleOnClick}
        icon={FamilyTreeIcon}
        {...this.props}
      />
    )
  }

  _handleOnClick () {}
}

Classes.ROUTE = 'Classes'
