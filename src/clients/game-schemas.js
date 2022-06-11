const AbilityParameterTypesMap = {
  str: 'STR',
  dex: 'DEX',
  int: 'INT',
  sta: 'STA',
  speed: 'Speed',
  attackspeed: 'Attack Speed',
  attackspeedrate: 'Attack Speed Rate',
  jumpheight: 'Jump Height',
  bowrange: 'Bow Range',
  def: 'DEF',
  parry: 'Parry',
  reflectdamage: 'Reflect Damage',
  rangedblock: 'Ranged Block',
  meleeblock: 'Melee Block',
  electricitydefense: 'Electricity Defense',
  firedefense: 'Fire Defense',
  winddefense: 'Wind Defense',
  waterdefense: 'Water Defense',
  earthdefense: 'Earth Defense',
  attack: 'Attack',
  hitrate: 'Hit Rate',
  magicattack: 'Magic Attack',
  swordattack: 'Sword Attack',
  axeattack: 'Ax Attack',
  knuckleattack: 'Knuckle Attack',
  yoyoattack: 'Yoyo Attack',
  bowattack: 'Bow Attack',
  earthmastery: 'Earth Mastery',
  firemastery: 'Fire Mastery',
  watermastery: 'Water Mastery',
  electricitymastery: 'Electricity Mastery',
  windmastery: 'Wind Mastery',
  damage: 'Damage',
  criticalchance: 'Critical Chance',
  elementattack: 'Element Attack',
  skillchance: 'Skill Chance',
  attribute: 'Attribute',
  maxhp: 'Max HP',
  maxmp: 'Max MP',
  maxfp: 'Max FP',
  hprecovery: 'HP Recovery',
  mprecovery: 'MP Recovery',
  fprecovery: 'FP Recovery',
  hprecoveryafterkill: 'HP Recovery After Kill',
  mprecoveryafterkill: 'MP Recovery After Kill',
  fprecoveryafterkill: 'FP Recovery After Kill',
  decreasedmpconsumption: 'Decreased MP Consumption',
  decreasedfpconsumption: 'Decreased FP Consumption',
  minability: 'Min Ability',
  maxability: 'Max Ability',
  attributeimmunity: 'Attribute Immunity',
  autohp: 'Auto HP',
  decreasedcastingtime: 'Decreased Casting Time',
  criticaldamage: 'Critical Damage',
  skilldamage: 'Skill Damage',
  hprestoration: 'HP Restoration',
  criticalresist: 'Critical Resist',
  healing: 'Healing',
  pvpdamagereduction: 'PvP Damage Reduction',
  magicdefense: 'Magic Defense',
  pvpdamage: 'PvP Damage',
  pvedamage: 'PvE Damage',
  penya: 'Penya',
  hp: 'HP',
  mp: 'MP',
  fp: 'FP',
  allelementsdefense: 'All Elements Defense',
  allstats: 'All Stats',
  attackandmaxhp: 'Attack and Maximum HP',
  defenseandhitratedecrease: 'Defense and Hit Rate Decrease',
  cure: 'Cure',
  movement: 'Movement',
  allelementsmastery: 'All Elements Mastery',
  allrecovery: 'All Recovery',
  allrecoveryafterkill: 'All Recovery After Kill',
  decreasedfpandmpconsumption: 'Decreased FP and MP Consumption',
  removealldebuff: 'Remove All Debuff',
  block: 'Block',
  removedebuff: 'Removed Buff',
  damageandstealhp: 'Damage and Steal HP',
  stealhp: 'Steal HP',
  explostdecreaseatrevival: 'Experience Lost Decrease At Revival',
  cheerpoint: 'Cheerpoint',
  incomingdamage: 'Incoming Damage',
  spiritstrike: 'Spirit Strike',
  stealfp: 'Steal FP',
  exprate: 'Experience Rate',
  droprate: 'Drop Rate',
  fprecoveryautoattack: 'FP Recovery Auto Attack',
  duration: 'Duration'
}

const PlaceTypesMap = {
  lodestar: 'Lodestar',
  lodelight: 'Lodelight',
  flyingstation: 'Flying Station',
  weaponstore: 'Weapon Store',
  armorstore: 'Armor Store',
  foodstore: 'Food Store',
  magicstore: 'Magic Store',
  generalstore: 'General Store',
  publicoffice: 'Public Office',
  questoffice: 'Quest Office',
  dungeon: 'Dungeon',
  shieldstore: 'Shield Store',
  warpzone: 'Warp Zone',
  instance: 'Instance'
}

const MenusTypesMap = {
  trade: 'Trade',
  dialog: 'Dialog',
  changeelem: 'Change Element',
  upgrade: 'Upgrade',
  inputreward: 'Input Reward',
  showreward: 'Show Reward',
  piercing: 'Piercing',
  piercingremove: 'Piercing Remove',
  attribute: 'Attribute',
  lodelight: 'Lodelight',
  bank: 'Bank',
  hairshop: 'Hair Shop',
  itemrepair: 'Item Repair',
  post: 'Post',
  skinshop: 'Skin Shop',
  buff: 'Buff',
  arenaenter: 'Arena Enter',
  arenaleave: 'Arena Leave',
  guildbank: 'Guild Bank',
  guildrank: 'Guild Rank',
  guildrankwar: 'Guild Rank War',
  guildrankinfo: 'Guild Rank Info',
  guildsiegeapply: 'Guild Siege Apply',
  guildsiegestate: 'Guild Siege State',
  guildsiegecancel: 'Guild Siege Cancel',
  guildsiegejoin: 'Guild Siege Join',
  guildsiegelineup: 'Guild Siege Lineup',
  guildsiegejackpot: 'Guild Siege Jackpot',
  guildsiegebestplayer: 'Guiuld Siege Best Player',
  guildsiegeranking: 'Guild Siege Ranking',
  guildsiegejackpot2: 'Guild Siege Jackpot 2',
  guildsiegeinfo1: 'Guild Siege Info 1',
  guildsiegeinfo2: 'Guild Siege Info 2',
  guildsiegeinfo3: 'Guild Siege Info 3',
  guildsiegeinfo4: 'Guild Siege Info 4',
  roshambo: 'Roshambo (Rock Paper Scissors)',
  exchangeroshambo: 'Exchange Roshambo (Rock Paper Scissors)',
  upgradecard: 'Upgrade Card',
  safeelementupgrade: 'Safe Element Upgrade',
  safeupgrade: 'Safe upgrade',
  safepiercing: 'Safe Piercing',
  createshiningpowerdice: 'Create Shining Power Dice',
  createjewels: 'Create Jewels',
  createuniqueweapon: 'Create Unique Weapon',
  exchangerareitempieces: 'Exchange Rare Item Pieces',
  exchangecardpieces: 'Exchange Card Pieces',
  removelevelreduction: 'Remove Level Reduction',
  removecostumeblessing: 'Remove Constume Blessing',
  arenaranking: 'Arena Ranking',
  arenareward: 'Arena Reward',
  accessoryupgrade: 'Accessory Upgrade',
  safeaccessoryupgrade: 'Safe Accessory Upgrade'
}

const formatAbilityValue = ability => {
  if (ability.get('add')) {
    const isNegative = parseInt(ability.get('rate')) < 0
    return `${!isNegative ? '+ ' : ''}${ability.get('add')}${ability.get('rate') ? '%' : ''}`
  }
  if (ability.get('set')) {
    return `${ability.get('set')}${ability.get('rate') ? '%' : ''}`
  }
  return ''
}

const DEFAULT_WORLD_ID = 6063

const DefaultLocations = {
  [DEFAULT_WORLD_ID]: 'flaris',
}

module.exports = {
  AbilityParameterTypesMap,
  PlaceTypesMap,
  MenusTypesMap,
  formatAbilityValue,
  DefaultLocations,
  DEFAULT_WORLD_ID
}
