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

import BaseComponent from './base-component'
import {
  PangDataGrid,
  PangContentBackdrop,
  PangNavigationAccordionItem,
  getDarkTheme,
  DataViewerContentContainer,
  DataViewerGenericComponent,
  PangDataViewPaperGroup,
  PangDataPrimitivesAccordion,
  PangDataViewIcon,
  PangDataText,
  PangNameChip,
  PangDataViewPaperItem,
  PangDataViewAccordionItem,
  PangDataPrimitivesPaper,
  colorForTheme
} from './common'
import EnlightenmentIcon from '../../static/images/enlightenment.svg'
import AuraIcon from '../../static/images/aura.svg'
import { makeStyles } from '@material-ui/core/styles'
import { BuiltinEvents } from '../clients/context'
import * as config from '../config'
import * as utils from '../utils'
import Avatar from '@material-ui/core/Avatar'
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

const SliderValueLabelComponent = props => (
  <Tooltip
    placement='top'
    open={props.open}
    enterTouchDelay={0}
    title={props.value}
  >
    {props.children}
  </Tooltip>
)
const getSliderMarks = (min, max) => {
  if (!parseInt(max)) {
    return [
      { value: 0, label: '0' }
    ]
  }
  if (parseInt(max) === 1) {
    return [
      { value: 0, label: '0' },
      { value: 1, label: '1' }
    ]
  }
  const middleValue = Math.round(min + ((max - min) / 2))
  return [
    { value: min, label: min + '' },
    { value: middleValue, label: middleValue + '' },
    { value: max, label: max + '' }
  ]
}

const PangSlider = props => {
  const sliderClasses = makeStyles(() => ({
    root: {
      color: props => colorForTheme(props, 80)
    },
    markLabelActive: {
      color: props => colorForTheme(props, 80)
    },
    markLabel: {
      color: props => colorForTheme(props, 80)
    },
  }))(props)
  const inputClasses = makeStyles(() => ({
    root: {
      color: props => colorForTheme(props, 80)
    },
    underline: {
      '&:before': {
        borderBottom: props => `1px solid ${colorForTheme(props, 80)}`
      },
      '&:after': {
        borderBottom: props => `2px solid ${colorForTheme(props, 80)}`
      }
    }
  }))(props)
  return (
    <Grid
      classes={makeStyles({
        'spacing-xs-2': {
          marginTop: -10,
          marginBottom: -15
        }
      })()}
      container
      spacing={2}
      alignItems='center'
    >
      <Grid item>
        <PangDataText smaller text={props.sliderLabel} />
      </Grid>
      <Grid item xs>
        <Slider
          PangContext={props.PangContext}
          classes={sliderClasses}
          value={props.value}
          min={props.min}
          max={props.max}
          marks={props.sliderMarks}
          onChange={props.sliderOnChange}
          ValueLabelComponent={SliderValueLabelComponent}
        />
      </Grid>
      <Grid item>
        <Input
          PangContext={props.PangContext}
          classes={inputClasses}
          margin='dense'
          value={props.value}
          inputProps={{
            min: props.min,
            max: props.max,
            step: props.inputStep,
            type: props.inputType
          }}
          onChange={props.inputOnChange}
          onBlur={props.inputOnBlur}
        />
      </Grid>
    </Grid>
  )
}

const SkillLevelCalculator = props => {
  const skill = props.skill
  const skillScalers = props.scalers

  const skillLevels = Array.from(skill.levels())
  if (!skillLevels.length) {
    return null
  }

  const minSkillLevel = 1
  const maxSkillLevel = skillLevels.length
  const [minStr, minSta, minDex, minInt] = [0, 0, 0, 0]
  const maxCharacterLevel = props.maxCharacterLevel || 120
  const maxStatPoints = useMemo(
    () => utils.Game.maxStatPointsForLevel(maxCharacterLevel),
    [maxCharacterLevel]
  )

  const [level, setLevel] = useState(props.level || minSkillLevel)
  const [str, setStr] = useState(props.str || minStr)
  const [sta, setSta] = useState(props.sta || minSta)
  const [dex, setDex] = useState(props.dex || minDex)
  const [int, setInt] = useState(props.int || minInt)

  const maxStr = maxStatPoints - sta - dex - int
  const maxSta = maxStatPoints - str - dex - int
  const maxDex = maxStatPoints - str - sta - int
  const maxInt = maxStatPoints - str - sta - dex

  const totalStatPoints = str + sta + dex + int

  const handleLevelSliderChange = (_, value) => setLevel(value)
  const handleLevelInputChange = event => setLevel(
    Number(event.target.value) || minSkillLevel
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
    if (!level || level < minSkillLevel) {
      setLevel(minSkillLevel)
    }
    if (level > maxSkillLevel) {
      setLevel(maxSkillLevel)
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

  useEffect(() => { handleLevelInputBlur() }, [maxSkillLevel])
  useEffect(() => { handleStrInputBlur() }, [maxStr])
  useEffect(() => { handleStaInputBlur() }, [maxSta])
  useEffect(() => { handleDexInputBlur() }, [maxDex])
  useEffect(() => { handleIntInputBlur() }, [maxInt])
  useEffect(() => {
    if (!skillScalers.includes('str')) {
      setStr(minStr)
    }
    if (!skillScalers.includes('sta')) {
      setSta(minSta)
    }
    if (!skillScalers.includes('dex')) {
      setDex(minDex)
    }
    if (!skillScalers.includes('int')) {
      setInt(minInt)
    }
  }, [skillScalers])

  const currentLevel = skillLevels[level - 1]
  const currentAbilities = Array.from(currentLevel?.abilities() || [])
  const currentScalingParametersMap = {}
  for (const parameter of Array.from(currentLevel?.scalingParameters() || [])) {
    if (!currentScalingParametersMap[parameter.get('parameter')]) {
      currentScalingParametersMap[parameter.get('parameter')] = parameter
      continue
    }
    const lastParam = currentScalingParametersMap[parameter.get('parameter')]
    lastParam.props.exp =
      `${parameter.get('stat')}*${parameter.get('scale')}`
        + `+${lastParam.get('stat')}*${lastParam.get('scale')}`
  }
  const currentScalingParameters = Object.values(currentScalingParametersMap)

  const calculateScalingBonus = (stat, scale, maximum) => {
    if (isNaN(maximum) || maximum === null) {
      maximum = Infinity
    }
    switch (stat) {
      case 'str':
        return Math.min(Math.round(str * scale), maximum)
      case 'sta':
        return Math.min(Math.round(sta * scale), maximum)
      case 'dex':
        return Math.min(Math.round(dex * scale), maximum)
      case 'int':
        return Math.min(Math.round(int * scale), maximum)
    }
    return 0
  }

  const calculateExp = (exp, maximum) => {
    if (isNaN(maximum) || maximum === null) {
      maximum = Infinity
    }
    exp = exp.replaceAll('str', str)
    exp = exp.replaceAll('sta', sta)
    exp = exp.replaceAll('dex', dex)
    exp = exp.replaceAll('int', int)
    return Math.min(Math.round(mathJSEval(exp)), maximum)
  }

  return (
    <PangDataViewAccordionItem
      size={12}
      summary={<PangDataText bolder text='Skill Stats' />}
      flexColumn
      {...props}
    >
      <div style={{
        flexDirection: 'column',
        width: '100%',
        textAlign: 'left'
      }}>
        <PangDataText
          bolder
          littleBigger
          text={`${skill.get('name').en} Lv ${level}` /*TODO: localize*/}
        />
        <PangSlider
          PangContext={props.PangContext}
          sliderLabel='LV'
          value={level}
          min={minSkillLevel}
          max={maxSkillLevel}
          sliderMarks={getSliderMarks(minSkillLevel, maxSkillLevel)}
          sliderOnChange={handleLevelSliderChange}
          inputOnChange={handleLevelInputChange}
          inputOnBlur={handleLevelInputBlur}
          inputStep={1}
          inputType='number'
        />
      </div>

      <PangDataViewPaperGroup {...props}>
        <PangDataViewAccordionItem
          size={12}
          summary={<PangDataText bolder text='Special Abilities' />}
          {...props}
        >
          {currentAbilities.length ? (
            <PangDataViewPaperGroup {...props}>
              {currentAbilities.map(ability => (
                <PangDataViewPaperItem
                  key={ability.parameter}
                  size={4}
                  {...props}
                >
                  <PangDataText
                    text={
                      props.PangContext.GameSchemas
                        .AbilityParameterTypesMap[ability.get('parameter')]
                    }
                  />
                  <PangDataText
                    bigger
                    bolder
                    color='green'
                    text={props.PangContext.GameSchemas.formatAbilityValue(
                      ability
                    )}
                  />
                  {ability.get('pvp') ? (
                    <PangDataText
                      smaller
                      bolder
                      color='red'
                      text='PVP'
                    />
                  ) : null}
                  {ability.get('pve') ? (
                    <PangDataText
                      smaller
                      bolder
                      color='blue'
                      text='PVE'
                    />
                  ) : null}
                </PangDataViewPaperItem>
              ))}
            </PangDataViewPaperGroup>
          ) : null}
        </PangDataViewAccordionItem>

        <PangDataViewAccordionItem
          size={12}
          summary={<PangDataText bolder text='Stat Points' />}
          {...props}
        >
          {skillScalers.length ? (
            <div style={{
              flexDirection: 'column',
              width: '100%',
              textAlign: 'left'
            }}>
              <PangDataText
                bolder
                littleBigger
                text={`Scaling Stat: ${skillScalers.join(' & ').toUpperCase()}`}
              />
              <PangDataText
                bolder
                littleBigger
                text={`Total Points: ${totalStatPoints}`}
              />
              {skillScalers.includes('str') ? (
                <PangSlider
                  PangContext={props.PangContext}
                  sliderLabel='STR'
                  value={str}
                  min={minStr}
                  max={maxStr}
                  sliderMarks={getSliderMarks(minStr, maxStr)}
                  sliderOnChange={handleStrSliderChange}
                  inputOnChange={handleStrInputChange}
                  inputOnBlur={handleStrInputBlur}
                  inputStep={1}
                  inputType='number'
                />
              ) : null}
              {skillScalers.includes('sta') ? (
                <PangSlider
                  PangContext={props.PangContext}
                  sliderLabel='STA'
                  value={sta}
                  min={minSta}
                  max={maxSta}
                  sliderMarks={getSliderMarks(minSta, maxSta)}
                  sliderOnChange={handleStaSliderChange}
                  inputOnChange={handleStaInputChange}
                  inputOnBlur={handleStaInputBlur}
                  inputStep={1}
                  inputType='number'
                />
              ) : null}
              {skillScalers.includes('dex') ? (
                <PangSlider
                  PangContext={props.PangContext}
                  sliderLabel='DEX'
                  value={dex}
                  min={minDex}
                  max={maxDex}
                  sliderMarks={getSliderMarks(minDex, maxDex)}
                  sliderOnChange={handleDexSliderChange}
                  inputOnChange={handleDexInputChange}
                  inputOnBlur={handleDexInputBlur}
                  inputStep={1}
                  inputType='number'
                />
              ) : null}
              {skillScalers.includes('int') ? (
                <PangSlider
                  PangContext={props.PangContext}
                  sliderLabel='INT'
                  value={int}
                  min={minInt}
                  max={maxInt}
                  sliderMarks={getSliderMarks(minInt, maxInt)}
                  sliderOnChange={handleIntSliderChange}
                  inputOnChange={handleIntInputChange}
                  inputOnBlur={handleIntInputBlur}
                  inputStep={1}
                  inputType='number'
                />
              ) : null}
            </div>
          ) : null}
        </PangDataViewAccordionItem>

        <PangDataViewAccordionItem
          size={12}
          summary={<PangDataText bolder text='Bonus Attributes' />}
          {...props}
        >
          {currentScalingParameters.length ? (
            <PangDataViewPaperGroup {...props}>
              {currentScalingParameters.map(scalingParameter => (
                <PangDataViewPaperItem
                  key={scalingParameter.parameter}
                  size={4}
                  {...props}
                >
                  <PangDataText
                    text={
                      props.PangContext.GameSchemas
                        .AbilityParameterTypesMap[scalingParameter.get('parameter')]
                    }
                  />
                  <PangDataText
                    bigger
                    bolder
                    color='green'
                    text={scalingParameter.get('exp') ? (
                      '+ ' + calculateExp(
                        scalingParameter.get('exp'),
                        scalingParameter.get('maximum')
                      )
                    ) : (
                      '+ ' + calculateScalingBonus(
                        scalingParameter.get('stat'),
                        scalingParameter.get('scale'),
                        scalingParameter.get('maximum')
                      )
                    )}
                  />
                  {scalingParameter.get('pvp') ? (
                    <PangDataText
                      smaller
                      bolder
                      color='red'
                      text='PVP'
                    />
                  ) : null}
                  {scalingParameter.get('pve') ? (
                    <PangDataText
                      smaller
                      bolder
                      color='blue'
                      text='PVE'
                    />
                  ) : null}
                </PangDataViewPaperItem>
              ))}
            </PangDataViewPaperGroup>
          ) : null}
        </PangDataViewAccordionItem>

        <PangDataPrimitivesPaper
          title='Attributes'
          primitives={Array.from(currentLevel?.primitives(['icon']) || [])}
          {...props}
        />
      </PangDataViewPaperGroup>
    </PangDataViewAccordionItem>
  )
}

const useSingleViewStyles = makeStyles(() => ({
}))

Skills.SingleView = props => {
  const classes = useSingleViewStyles(props)
  const skill = props.PangContext.Skills.get(props.Key)
  const skillDescription = skill.get('description')?.en // TODO: localize
  const skillAbilities = Array.from(skill.abilities())

  skill.connectEdgesFromContext(props.PangContext)

  const scalers = Object.keys(Array.from(skill.levels()).reduce((prev, cur) => {
    return {
      ...prev,
      ...Array.from(cur.scalingParameters()).reduce((_prev, _cur) => {
        _prev[_cur.get('stat')] = true
        return _prev
      }, {})
    }
  }, {}))
  const scalerText = scalers.join(' / ').toUpperCase() || null

  const skillRequirements = Array.from(skill.requirements())

  const getDarkThemeFromSrc = src => src.includes(
    config.API_RESOURCE_TYPES.skills.iconStyles.colored
  )
  const skillIconHandleOnClick = s => e => {
    const isDarkTheme = getDarkThemeFromSrc(e.target.src)
    e.target.src = s.iconStyled(getStyleForThemeMode(!isDarkTheme))
  }

  return (
    <DataViewerContentContainer
      Generic={(
        <DataViewerGenericComponent
          Id={<PangDataText text={skill.id} />}
          Name={<PangDataText
            text={skill.get('name').en || '[no name]' /* TODO: localize */}
          />}
          Type={<PangDataText text={utils.camelToTextCase(skill.type.name)} />}
          Level={<PangDataText text={skill.get('level')} />}
          Scaler={scalerText ? (
            <PangDataText bolder text={scalerText} />
          ) : null}
          Class={(skill.class ? (
            <PangNameChip
              name={skill.class.get('name').en /* TODO: localize */}
              onClick={() => props.PangContext.navigateSingleItem(skill.class)}
            />
          ) : <PangDataText text='Any' />)}
          {...props}
        />
      )}
      Icon={<PangDataViewIcon
        src={skill.iconStyled(getStyleForThemeMode(getDarkTheme(props)))}
        iconOnClick={skillIconHandleOnClick(skill)}
        {...props}
      />}
      {...props}
    >
      <PangDataViewPaperGroup {...props}>
        {skillDescription && skillDescription !== 'null' ? (
          <PangDataViewPaperItem size={12} {...props}>
            <PangDataText bolder text='Description' />
            <PangDataText text={skillDescription} />
          </PangDataViewPaperItem>
        ) : null}
        {skillAbilities.length ? (
          <PangDataViewPaperItem size={12} {...props}>
            <PangDataText bolder text='Abilities' />
            <PangDataViewPaperGroup {...props}>
              {skillAbilities.map(ability => (
                <PangDataViewPaperItem
                  key={ability.parameter}
                  size={4}
                  {...props}
                >
                  <PangDataText
                    text={
                      props.PangContext.GameSchemas
                        .AbilityParameterTypesMap[ability.get('parameter')]
                    }
                  />
                  <PangDataText
                    bigger
                    bolder
                    color='green'
                    text={props.PangContext.GameSchemas.formatAbilityValue(
                      ability
                    )}
                  />
                  {ability.get('pvp') ? (
                    <PangDataText
                      smaller
                      bolder
                      color='red'
                      text='PVP'
                    />
                  ) : null}
                  {ability.get('pve') ? (
                    <PangDataText
                      smaller
                      bolder
                      color='blue'
                      text='PVE'
                    />
                  ) : null}
                </PangDataViewPaperItem>
              ))}
            </PangDataViewPaperGroup>
          </PangDataViewPaperItem>
        ) : null}
        {skillRequirements.length ? (
          <PangDataViewPaperItem size={12} {...props}>
            <PangDataText bolder text='Required Skills' />
            <PangDataViewPaperGroup {...props}>
              {skillRequirements.map(requirement => (
                <PangDataViewPaperItem
                  key={requirement.parameter}
                  size={4}
                  {...props}
                >
                  <PangDataText text={'Lv ' + requirement.get('level')} />
                  <img
                    src={requirement.skill.iconStyled(
                      getStyleForThemeMode(getDarkTheme(props))
                    )}
                    onClick={skillIconHandleOnClick(requirement.skill)}
                  />
                  <PangNameChip
                    bold
                    smaller
                    name={requirement.skill.get('name').en /* TODO: localize */}
                    onClick={() => props.PangContext.navigateSingleItem(
                      requirement.skill
                    )}
                  />
                </PangDataViewPaperItem>
              ))}
            </PangDataViewPaperGroup>
          </PangDataViewPaperItem>
        ) : null}

        <SkillLevelCalculator
          PangContext={props.PangContext}
          skill={skill}
          scalers={scalers}
        />

        <PangDataPrimitivesAccordion
          title='Extra Details'
          primitives={Array.from(skill.primitives(['icon'])) || []}
          {...props}
        />
      </PangDataViewPaperGroup>
    </DataViewerContentContainer>
  )
}

Skills.ROUTE = 'Skills'
