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
import React, { useEffect, useState, useMemo, useCallback } from 'react'

import BaseComponent from './base-component'
import {
  PangDataGrid,
  PangNavigationAccordionItem,
  PangContentBackdrop,
  getDarkTheme,
  DARK_CONTRAST_COLOR,
  LIGHT_CONTRAST_COLOR,
  PangDataViewAccordionItem,
  PangDataText,
  PangDataViewPaperGroup,
  PangDataViewPaperItem,
  PangDataViewItem,
  DataViewerContentContainer,
  DataViewerGenericComponent,
  PangDataViewIcon,
  PangSlider,
  PangNameChip,
  PangDataPrimitivesAccordion
} from './common'
import FamilyTreeIcon from '../../static/images/family-tree.svg'
import { makeStyles } from '@material-ui/core/styles'
import { BuiltinEvents } from '../clients/context'
import * as config from '../config'
import * as utils from '../utils'
import * as uiutils from '../uiutils'
import Typography from '@material-ui/core/Typography'
import Chip from '@material-ui/core/Chip'
import Grid from '@material-ui/core/Grid'
import Slider from '@material-ui/core/Slider'
import Input from '@material-ui/core/Input'
import Tooltip from '@material-ui/core/Tooltip'

import { evaluate as mathJSEval } from 'mathjs'

const useStyles = makeStyles(theme => ({
  root: {
    backdropFilter: 'blur(10px)'
  },
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
    color: props => {
      const themeColor =
        getDarkTheme(props) ? DARK_CONTRAST_COLOR : LIGHT_CONTRAST_COLOR
      return `rgba(${themeColor} / 80%)`
    },
    '&::before': {
      borderBottomColor: props => {
        const themeColor =
          getDarkTheme(props) ? DARK_CONTRAST_COLOR : LIGHT_CONTRAST_COLOR
        return `rgba(${themeColor} / 80%)`
      }
    }
  }
}))

const overrideTypography = root => makeStyles({ root })
const overrideSlider = ({ root, markLabel }) => makeStyles({ root, markLabel })
const overrideGrid = root => makeStyles({ root })

export const nameCellRenderer = navigateSingleDataItem => params => {
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
      onClick={() => navigateSingleDataItem(params.data)}
    />
  )
}

export const iconCellRenderer = classes => params => {
  const alt = `Icon for the ${params.data.name} class.`
  return <img className={classes.iconImage} src={params.value} alt={alt} />
}

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
    () => getMarks(0, utils.Game.maxStatPointsForLevel(level)),
    [level]
  )
  const handleLevelSliderChange = (_, value) => setLevel(value)
  const handleLevelInputChange =
    event => setLevel(Number(event.target.value) || minLevel)
  const handleLevelInputOnBlur = () => {
    if (!level || level < minLevel) {
      setLevel(minLevel)
    }
    if (level > maxLevel) {
      setLevel(maxLevel)
    }
  }
  const handleStatSliderChange = (_, value) => setStat(value)
  const handleStatInputChange =
    event => setStat(Number(event.target.value) || 0)
  const handleStatInputOnBlur = () => {
    const maxStat = utils.Game.maxStatPointsForLevel(level)
    if (!stat || level < 0) {
      setStat(0)
      return
    }
    if (stat > maxStat) {
      setStat(maxStat)
      return // eslint-disable-line
    }
  }
  const themeColor =
    getDarkTheme(props) ? DARK_CONTRAST_COLOR : LIGHT_CONTRAST_COLOR
  const sliderStyle = overrideSlider({
    root: {
      padding: '10px 0',
      height: 0,
      color: `rgba(${themeColor} / 80%)`,
      marginBottom: 0,
      marginLeft: 10,
      width: '90%'
    },
    markLabel: {
      color: `rgba(${themeColor} / 80%)`,
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
            classes={{
              root: sliderStyle.root,
              markLabel: sliderStyle.markLabel
            }}
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
            classes={{
              root: sliderStyle.root,
              markLabel: sliderStyle.markLabel
            }}
            PangContext={props.PangContext}
            value={stat}
            ValueLabelComponent={SliderValueLabelComponent}
            marks={level > 1 ? getStatMarks() : null}
            disabled={level === 1}
            onChange={handleStatSliderChange}
            min={0}
            max={utils.Game.maxStatPointsForLevel(level)}
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
              max: utils.Game.maxStatPointsForLevel(level),
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
    return props.PangContext.Classes
      .get(parentId)
      .get('name').en // TODO: localize
  }

  const createRowFromGameObject = go => ({
    id: go.id,
    type: go.type,
    icon: go.icon,
    iconMessenger: {
      messenger: go.iconStyled(
        config.API_RESOURCE_TYPES.classes.iconStyles.messenger
      ),
      oldFemale: go.iconStyled(
        config.API_RESOURCE_TYPES.classes.iconStyles.oldFemale
      ),
      oldMale: go.iconStyled(
        config.API_RESOURCE_TYPES.classes.iconStyles.oldMale
      )
    },
    name: go.get('name').en, // TODO: localize
    maxLevel: go.get('maxLevel'),
    minLevel: go.get('minLevel'),
    maxHP: go.get('maxHP'),
    maxFP: go.get('maxFP'),
    maxMP: go.get('maxMP'),
    classType: go.get('type'),
    parent: getParentById(go.get('parent'))
  })

  const [rowData, setRowData] = useState([])

  useEffect(() => {
    const data = Array.from(
      props.PangContext.Classes.iter()
    ).map(createRowFromGameObject)
    setRowData(data)
  }, [])

  // NOTE: We useEffect here to make sure we can properly clean up event
  // listeners. This is boilerplate for all components that depend on
  // the context initialization. We may be able to reduce this by doing
  // it as part of the common component, but the issue is that we
  // currently depend on each child component state (setRowData)
  // for these operations.
  useEffect(() => {
    const initializeHandler = () => setRowData(
      Array.from(props.PangContext.Classes.iter()).map(createRowFromGameObject)
    )
    props.PangContext.on(BuiltinEvents.INITIALIZE_COMPLETED, initializeHandler)
    return () => props.PangContext.off(
      BuiltinEvents.INITIALIZE_COMPLETED,
      initializeHandler
    )
  }, [])

  const iconMessengerCellRenderer = params => {
    const alt1 = `Pixel messenger icon for the ${params.data.name} class.`
    const alt2 = `Old pixel icon for the feminine ${params.data.name} class.`
    const alt3 =
      `Old pixel messenger icon for the masculine ${params.data.name} class.`
    return (
      <div className={classes.iconPixelsWrapper}>
        <img
          className={classes.iconPixels}
          src={params.value.messenger}
          alt={alt1}
        />
        <img
          className={classes.iconPixels}
          src={params.value.oldFemale}
          alt={alt2}
        />
        <img
          className={classes.iconPixels}
          src={params.value.oldMale}
          alt={alt3}
        />
      </div>
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

  const statNameForStat = stat => {
    switch (stat) {
      case 'maxHP':
      case 'maxFP':
        return 'sta'
      case 'maxMP':
        return 'int'
      default:
        return null
    }
  }

  const maxStatComparator = stat => (_, __, nodeA, nodeB) => {
    let exp = nodeA.data[stat]
    exp = exp.replaceAll('level', nodeA.data.maxLevel)
    exp = exp.replaceAll(statNameForStat(stat), (nodeA.data.maxLevel - 1) * 2)
    const valueA = Math.round(mathJSEval(exp))
    exp = nodeB.data[stat]
    exp = exp.replaceAll('level', nodeB.data.maxLevel)
    exp = exp.replaceAll(statNameForStat(stat), (nodeB.data.maxLevel - 1) * 2)
    const valueB = Math.round(mathJSEval(exp))
    if (valueA === valueB) {
      return 0
    }
    return valueA > valueB ? 1 : -1
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
      width: 90,
      minWidth: 90,
      maxWidth: 90,
      hide: false,
      cellRenderer: iconCellRenderer(classes),
      sortable: true,
      comparator: iconComparator
    },
    {
      field: 'iconMessenger',
      width: 55,
      minWidth: 55,
      maxWidth: 55,
      hide: false,
      cellRenderer: iconMessengerCellRenderer
    },
    {
      field: 'name',
      width: 100,
      minWidth: 100,
      sortable: true,
      filter: true,
      hide: false,
      resizable: true,
      cellRenderer: nameCellRenderer(props.PangContext.navigateSingleDataItem)
    },
    {
      field: 'maxHP',
      width: 210,
      minWidth: 210,
      maxWidth: 210,
      hide: false,
      cellRenderer: maxHPCellRenderer,
      sortable: true,
      comparator: maxStatComparator('maxHP')
    },
    {
      field: 'maxFP',
      width: 210,
      minWidth: 210,
      maxWidth: 210,
      hide: false,
      cellRenderer: maxFPCellRenderer,
      sortable: true,
      comparator: maxStatComparator('maxFP')
    },
    {
      field: 'maxMP',
      width: 210,
      minWidth: 210,
      maxWidth: 210,
      hide: false,
      cellRenderer: maxMPCellRenderer,
      sortable: true,
      comparator: maxStatComparator('maxMP')
    },
    {
      field: 'classType',
      width: 100,
      minWidth: 100,
      sortable: true,
      filter: true,
      hide: false,
      resizable: true
    },
    {
      field: 'parent',
      width: 100,
      minWidth: 100,
      sortable: true,
      filter: true,
      hide: false,
      resizable: true
    },
    {
      field: 'maxLevel',
      width: 75,
      minWidth: 75,
      sortable: true,
      filter: true,
      resizable: true
    },
    {
      field: 'minLevel',
      width: 75,
      minWidth: 75,
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

export default class Classes extends BaseComponent {
  render () {
    return (
      <PangContentBackdrop>
        <ClassesPangDataGrid PangContext={this.props.PangContext} />
      </PangContentBackdrop>
    )
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

const ClassStatCalculator = props => {
  const clazz = props.clazz
  const clazzName = clazz.get('name').en || '[no name]' /* TODO: localize */

  const minLevel = parseInt(clazz.get('minLevel'))
  const maxLevel = parseInt(clazz.get('maxLevel'))
  const hpExpression = clazz.get('maxHP')
  const fpExpression = clazz.get('maxFP')
  const mpExpression = clazz.get('maxMP')
  const [minStr, minSta, minDex, minInt] = [0, 0, 0, 0]

  const [level, setLevel] = useState(props.level || minLevel)
  const [str, setStr] = useState(props.str || minStr)
  const [sta, setSta] = useState(props.sta || minSta)
  const [dex, setDex] = useState(props.dex || minDex)
  const [int, setInt] = useState(props.int || minInt)

  const maxStatPoints = useMemo(
    () => utils.Game.maxStatPointsForLevel(level),
    [level]
  )
  const maxStr = maxStatPoints - sta - dex - int
  const maxSta = maxStatPoints - str - dex - int
  const maxDex = maxStatPoints - str - sta - int
  const maxInt = maxStatPoints - str - sta - dex

  const totalStatPoints = str + sta + dex + int

  const evaluateHP = useMemo(() => {
    let lv = level
    let st = sta
    if (!lv || lv < minLevel) {
      lv = minLevel
    }
    if (!st || st < 0) {
      st = 0
    }
    let exp = hpExpression.replaceAll('level', lv)
    exp = exp.replaceAll('sta', st)
    return Math.round(mathJSEval(exp))
  }, [level, sta, hpExpression])

  const evaluateFP = useMemo(() => {
    let lv = level
    let st = sta
    if (!lv || lv < minLevel) {
      lv = minLevel
    }
    if (!st || st < 0) {
      st = 0
    }
    let exp = fpExpression.replaceAll('level', lv)
    exp = exp.replaceAll('sta', st)
    return Math.round(mathJSEval(exp))
  }, [level, sta, fpExpression])

  const evaluateMP = useMemo(() => {
    let lv = level
    let st = int
    if (!lv || lv < minLevel) {
      lv = minLevel
    }
    if (!st || st < 0) {
      st = 0
    }
    let exp = mpExpression.replaceAll('level', lv)
    exp = exp.replaceAll('int', st)
    return Math.round(mathJSEval(exp))
  }, [level, int, mpExpression])

  const handleLevelSliderChange = (_, value) => setLevel(value)
  const handleLevelInputChange = event => setLevel(
    Number(event.target.value) || minLevel
  )
  const handleStrSliderChange = (_, value) => setStr(value)
  const handleStrInputChange = event => setStr(
    Number(event.target.value) || minStr
  )
  const handleStaSliderChange = (_, value) => setSta(value)
  const handleStaInputChange = event => setSta(
    Number(event.target.value) || minSta
  )
  const handleDexSliderChange = (_, value) => setDex(value)
  const handleDexInputChange = event => setDex(
    Number(event.target.value) || minDex
  )
  const handleIntSliderChange = (_, value) => setInt(value)
  const handleIntInputChange = event => setInt(
    Number(event.target.value) || minInt
  )

  const handleLevelInputBlur = () => {
    if (!level || level < minLevel) {
      setLevel(minLevel)
    }
    if (level > maxLevel) {
      setLevel(maxLevel)
    }
  }

  const handleStrInputBlur = () => {
    if (!str || str < minStr) {
      setStr(minStr)
    }
    if (str > maxStr) {
      setStr(maxStr)
    }
  }

  const handleStaInputBlur = () => {
    if (!sta || sta < minSta) {
      setSta(minSta)
    }
    if (sta > maxSta) {
      setSta(maxSta)
    }
  }

  const handleDexInputBlur = () => {
    if (!dex || dex < minDex) {
      setDex(minDex)
    }
    if (dex > maxDex) {
      setDex(maxDex)
    }
  }

  const handleIntInputBlur = () => {
    if (!int || int < minInt) {
      setInt(minInt)
    }
    if (int > maxInt) {
      setInt(maxInt)
    }
  }

  useEffect(() => {
    setLevel(minLevel)
  }, [minLevel, maxLevel, hpExpression, mpExpression, fpExpression])
  useEffect(() => { handleStrInputBlur() }, [maxStr])
  useEffect(() => { handleStaInputBlur() }, [maxSta])
  useEffect(() => { handleDexInputBlur() }, [maxDex])
  useEffect(() => { handleIntInputBlur() }, [maxInt])

  return (
    <PangDataViewAccordionItem
      size={12}
      summary={<PangDataText bolder text='Stat Points' />}
      {...props}
    >
      <div style={{
        flexDirection: 'column',
        width: '100%',
        textAlign: 'left',
      }}>
        <PangDataText
          bolder
          littleBigger
          text={`${clazzName} Lv ${level}`}
        />
        <PangSlider
          PangContext={props.PangContext}
          sliderLabel='LV'
          value={level}
          min={minLevel}
          max={maxLevel}
          sliderOnChange={handleLevelSliderChange}
          inputOnChange={handleLevelInputChange}
          inputOnBlur={handleLevelInputBlur}
          inputStep={1}
          inputType='number'
        />
        <PangDataViewPaperGroup {...props}>
          <PangDataViewPaperItem size={12} {...props}>
            <PangDataViewPaperGroup {...props}>
              <PangDataViewItem size={2}>
                <PangDataText bolder text='HP' />
              </PangDataViewItem>
              <PangDataViewPaperItem
                size={10}
                innerStyle={{
                  backgroundColor: uiutils.THEME_RED,
                  height: 24,
                  paddingTop: 4,
                  paddingBottom: 4,
                  color: 'white',
                }}
                {...props}
              >
                <PangDataText
                  bolder
                  text={utils.intToLocalizedString(evaluateHP)}
                />
              </PangDataViewPaperItem>

              <PangDataViewItem size={2}>
                <PangDataText bolder text='MP' />
              </PangDataViewItem>
              <PangDataViewPaperItem
                size={10}
                innerStyle={{
                  backgroundColor: uiutils.THEME_BLUE,
                  height: 24,
                  paddingTop: 4,
                  paddingBottom: 4,
                  color: 'white',
                }}
                {...props}
              >
                <PangDataText
                  bolder
                  text={utils.intToLocalizedString(evaluateMP)}
                />
              </PangDataViewPaperItem>

              <PangDataViewItem size={2}>
                <PangDataText bolder text='FP' />
              </PangDataViewItem>
              <PangDataViewPaperItem
                size={10}
                innerStyle={{
                  backgroundColor: uiutils.THEME_GREEN,
                  height: 24,
                  paddingTop: 4,
                  paddingBottom: 4,
                  color: 'white',
                }}
                {...props}
              >
                <PangDataText
                  bolder
                  text={utils.intToLocalizedString(evaluateFP)}
                />
              </PangDataViewPaperItem>

              <PangSlider
                PangContext={props.PangContext}
                sliderLabel='STR'
                value={str}
                min={minStr}
                max={maxStr}
                sliderOnChange={handleStrSliderChange}
                inputOnChange={handleStrInputChange}
                inputOnBlur={handleStrInputBlur}
                inputStep={1}
                inputType='number'
              />
              <PangSlider
                PangContext={props.PangContext}
                sliderLabel='STA'
                value={sta}
                min={minSta}
                max={maxSta}
                sliderOnChange={handleStaSliderChange}
                inputOnChange={handleStaInputChange}
                inputOnBlur={handleStaInputBlur}
                inputStep={1}
                inputType='number'
              />
              <PangSlider
                PangContext={props.PangContext}
                sliderLabel='DEX'
                value={dex}
                min={minDex}
                max={maxDex}
                sliderOnChange={handleDexSliderChange}
                inputOnChange={handleDexInputChange}
                inputOnBlur={handleDexInputBlur}
                inputStep={1}
                inputType='number'
              />
              <PangSlider
                PangContext={props.PangContext}
                sliderLabel='INT'
                value={int}
                min={minInt}
                max={maxInt}
                sliderOnChange={handleIntSliderChange}
                inputOnChange={handleIntInputChange}
                inputOnBlur={handleIntInputBlur}
                inputStep={1}
                inputType='number'
              />
            </PangDataViewPaperGroup>
          </PangDataViewPaperItem>
        </PangDataViewPaperGroup>
      </div>
    </PangDataViewAccordionItem>
  )
}

const useSingleViewStyles = makeStyles(() => ({
}))

Classes.SingleView = props => {
  const classes = useSingleViewStyles(props)
  const clazz = props.PangContext.Classes.get(props.Key)
  const clazzName = clazz.get('name').en || '[no name]' /* TODO: localize */

  clazz.connectEdgesFromContext(props.PangContext)

  return (
    <DataViewerContentContainer
      Generic={(
        <DataViewerGenericComponent
          Id={<PangDataText text={clazz.id} />}
          Name={<PangDataText text={clazzName} />}
          Type={<PangDataText text={utils.camelToTextCase(clazz.type.name)} />}
          Level={<PangDataText text={`${clazz.get('minLevel')} - ${clazz.get('maxLevel')}`} />}
          Class={<PangDataText text={clazzName} />}
          {...props}
        />
      )}
      Icon={<PangDataViewIcon src={clazz.icon} {...props} />}
      {...props}
    >
      <PangDataViewPaperGroup {...props}>
        {clazz.parentClass ? (
          <PangDataViewPaperItem size={12} {...props}>
            <PangDataText
              bolder
              littleBigger
              text='Promoted From'
            />
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-evenly',
            }}>
              <img src={clazz.parentClass.icon} />
              <PangNameChip
                name={clazz.parentClass.get('name').en /* TODO: localize */}
                onClick={() => props.PangContext.navigateSingleItem(clazz.parentClass)}
              />
            </div>
          </PangDataViewPaperItem>
        ) : null}

        <PangDataViewAccordionItem
          size={12}
          summary={<PangDataText bolder text='Promotes To' />}
          {...props}
        >
          {(props.PangContext.classAdjacency[clazz.id] || []).map(
            childClazz => (
              <div key={childClazz.id} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-evenly',
              }}>
                <img src={childClazz.icon} />
                <PangNameChip
                  name={childClazz.get('name').en /* TODO: localize */}
                  onClick={() => props.PangContext.navigateSingleItem(childClazz)}
                />
              </div>
            )
          )}
        </PangDataViewAccordionItem>

        <ClassStatCalculator clazz={clazz} {...props} />

        <PangDataPrimitivesAccordion
          title='Full Details'
          primitives={Array.from(clazz.primitives(['icon'])) || []}
          {...props}
        />
      </PangDataViewPaperGroup>
    </DataViewerContentContainer>
  )
}

Classes.ROUTE = 'Classes'
