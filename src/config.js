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
const API_BASE_URL = 'https://flyff-api.sniegu.fr'
const API_MAP_ATTRIBUTION = '&copy; 2021 Gala Lab Corp.'
const API_REQUEST_RATE_MIN = 300
const exportDefault = {
  API_ID_FETCH_BATCH_SIZE: 200,
  API_VERSION_CHECK_THRESHOLD_MS: 3600 * 1000,
  API_REQUEST_RATE_SEC: API_REQUEST_RATE_MIN / 60,
  API_BASE_URL,
  API_MAP_ATTRIBUTION,
  API_RESOURCE_TYPES: {
    classes: {
      name: 'classes',
      cache: true,
      hydrate: true,
      dataVersionAdded: 1,
      iconStyles: {
        messenger: 'messenger',
        oldFemale: 'old_female',
        oldMale: 'old_male',
        target: 'target'
      },
      api: {
        ids: () => '/class',
        getById: id => `/class/${id}`,
        getByIds: ids => `/class/${ids.join()}`,
        image: (style, fileName) => `${API_BASE_URL}/image/class/${style}/${fileName}`
      }
    },
    world: {
      name: 'world',
      cache: true,
      hydrate: true,
      dataVersionAdded: 1,
      api: {
        ids: () => '/world',
        getById: id => `/world/${id}`,
        getByIds: ids => `/world/${ids.join()}`,
        image: (tileName, tileX, tileY) => `${API_BASE_URL}/image/world/${tileName}${tileX}-${tileY}-0.png`
      }
    },
    monsters: {
      name: 'monsters',
      cache: true,
      hydrate: true,
      dataVersionAdded: 1,
      api: {
        ids: () => '/monster',
        getById: id => `/monster/${id}`,
        getByIds: ids => `/monster/${ids.join()}`,
        image: fileName => `${API_BASE_URL}/image/monster/${fileName}`
      }
    },
    items: {
      name: 'items',
      cache: true,
      hydrate: true,
      dataVersionAdded: 1,
      api: {
        ids: () => '/item',
        getById: id => `/item/${id}`,
        getByIds: ids => `/item/${ids.join()}`,
        image: fileName => `${API_BASE_URL}/image/item/${fileName}`
      }
    },
    equipmentSets: {
      name: 'equipmentSets',
      cache: true,
      hydrate: true,
      dataVersionAdded: 1,
      api: {
        ids: () => '/equipset',
        getById: id => `/equipset/${id}`,
        getByIds: ids => `/equipset/${ids.join()}`
      }
    },
    skills: {
      name: 'skills',
      cache: true,
      hydrate: true,
      dataVersionAdded: 1,
      iconStyles: {
        colored: 'colored',
        old: 'old'
      },
      api: {
        ids: () => '/skill',
        getById: id => `/skill/${id}`,
        getByIds: ids => `/skill/${ids.join()}`,
        image: (style, fileName) => `${API_BASE_URL}/image/skill/${style}/${fileName}`
      }
    },
    npcs: {
      name: 'npcs',
      cache: true,
      hydrate: true,
      dataVersionAdded: 1,
      api: {
        ids: () => '/npc',
        getById: id => `/npc/${id}`,
        getByIds: ids => `/npc/${ids.join()}`,
        image: fileName => `${API_BASE_URL}/image/npc/${fileName}`
      }
    },
    partySkills: {
      name: 'partySkills',
      cache: true,
      hydrate: true,
      dataVersionAdded: 1,
      iconStyles: {
        colored: 'colored',
        old: 'old'
      },
      api: {
        ids: () => '/partyskill',
        getById: id => `/partyskill/${id}`,
        getByIds: ids => `/partyskill/${ids.join()}`,
        image: (style, fileName) => `${API_BASE_URL}/image/skill/${style}/${fileName}`
      }
    },
    quests: {
      name: 'quests',
      cache: true,
      hydrate: true,
      dataVersionAdded: 1,
      api: {
        ids: () => '/quest',
        getById: id => `/quest/${id}`,
        getByIds: ids => `/quest/${ids.join()}`
      }
    },
    karma: {
      name: 'karma',
      cache: true,
      hydrate: true,
      dataVersionAdded: 1,
      api: {
        ids: () => '/karma',
        getById: id => `/karma/${id}`,
        getByIds: ids => `/karma/${ids.join()}`
      }
    },
    achievements: {
      name: 'achievements',
      cache: true,
      hydrate: true,
      dataVersionAdded: 1,
      api: {
        ids: () => '/achievement',
        getById: id => `/achievement/${id}`,
        getByIds: ids => `/achievement/${ids.join()}`
      }
    },
    versions: {
      name: 'versions',
      cache: true,
      api: {
        get: () => '/version/data'
      }
    },
    languages: {
      name: 'languages',
      cache: true,
      api: {
        get: () => '/language'
      }
    }
  },
  CACHE_NAME: 'pangsworth',
  CACHE_NAME_IMAGES: 'pangsworth-images',
  CACHE_VERSION: 1,
  CACHE_DEFAULT_KEY_PATH: 'id',
  SEARCH_INDEX_CACHE_KEY: 'elasticlunr',
  SEARCH_INDEX_CACHE_CHECK_KEY: 'elasticlunr-check',
  SEARCH_TABLE: 'search',
  SEARCH_DOCUMENT_REF_NAME: 'id',
  SEARCH_INDEX_SECONDARY: '__idx__',
  // primary indexes are dynamic, can be added as we go
  SEARCH_PRIMARY_INDEXES: {
    name: true,
    title: true,
    description: true,
    dialogsBegin: true,
    dialogsAccept: true,
    dialogsDecline: true,
    dialogsComplete: true,
    dialogsFail: true
  },
  SEARCH_INCLUDE_PROP_INDEXES: {
    flying: true,
    pk: true,
    town: true
  },
  REQUEST_RETRY_OPTIONS: {
    retries: 3,
    retryDelay: 1000,
    retryOn: [503]
  },
  STORAGE_VALUE_KEYS: {
    local: {
      cacheLoading: 'CACHE_LOADING', // UI message channel
      imageCacheLoading: 'CACHE_BG_IMG_LOADING',
      imageCacheCompletedAt: 'CACHE_BG_IMG_COMPLETED_AT'
    },
    sync: {
      userSettings: 'USER_SETTINGS',
      breadcrumbs: 'BREADCRUMBS'
    }
  },
  MESSAGE_VALUE_KEYS: {
    preloadImages: 'PRELOAD_IMAGES',
    preloadImagesProgress: 'PRELOAD_IMAGES_PROGRESS',
    preloadImagesCompleted: 'PRELOAD_IMAGES_COMPLETED',
    heartbeat: 'HEARTBEAT'
  },
  BG_IMG_PRELOAD: {
    maxRetry: 10,
    backoffMs: 1000,
    backoffExp: 1.5,
    backoffVarianceSec: 30,
    progressTickMs: 1000,
    staleCacheAgeMs: 3600 * 1000,
    autoCacheDownloadCheckExpireMs: 365 * 24 * 3600 * 1000, // expire auto prefetch after 1 year
    manualCacheDownloadCheckExpireMs: 3600 * 1000
  },
  SETTINGS_VALUE_KEYS: {
    backgroundImageLoading: 'backgroundImageLoading',
    darkTheme: 'darkTheme',
    states: {
      routeDrawer: 'stateRouteDrawer',
      dataViewerDrawer: 'stateDataViewerDrawer',
      searchAccordion: 'stateSearchAccordion',
      tabRoute: 'stateTabRoute',
      mapWorld: 'stateMapWorld',
      searchTerm: 'searchTerm',
      termsAgree: 'termsAgree'
    }
  },
  DEFAULT_SETTINGS: {
    backgroundImageLoading: false,
    darkTheme: false
  },
  UI_LIMITS: {
    notificationDelayMs: 1000
  }
}

module.exports = exportDefault
module.exports.default = exportDefault
