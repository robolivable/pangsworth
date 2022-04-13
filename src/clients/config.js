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

const exportDefault = {
  API_ID_FETCH_BATCH_SIZE: 200,
  API_VERSION_CHECK_THRESHOLD_MS: 3600 * 1000,
  API_BASE_URL: 'https://flyff-api.sniegu.fr',
  API_RESOURCE_TYPES: {
    classes: {
      name: 'classes',
      cache: true,
      hydrate: true,
      api: {
        ids: () => '/class',
        getById: id => `/class/${id}`,
        getByIds: ids => `/class/${ids.join()}`,
        image: (style, fileName) => `/image/class/${style}/${fileName}`
      }
    },
    world: {
      name: 'world',
      cache: true,
      hydrate: true,
      api: {
        ids: () => '/world',
        getById: id => `/world/${id}`,
        getByIds: ids => `/world/${ids.join()}`,
        image: (tileName, tileX, tileY) => `/image/world/${tileName}${tileX}-${tileY}-0.png`
      }
    },
    monsters: {
      name: 'monsters',
      cache: true,
      hydrate: true,
      api: {
        ids: () => '/monster',
        getById: id => `/monster/${id}`,
        getByIds: ids => `/monster/${ids.join()}`,
        image: fileName => `/image/monster/${fileName}`
      }
    },
    items: {
      name: 'items',
      cache: true,
      hydrate: true,
      api: {
        ids: () => '/item',
        getById: id => `/item/${id}`,
        getByIds: ids => `/item/${ids.join()}`,
        image: fileName => `/image/class/${fileName}`
      }
    },
    equipmentSets: {
      name: 'equipmentSets',
      cache: true,
      hydrate: true,
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
      api: {
        ids: () => '/skill',
        getById: id => `/skill/${id}`,
        getByIds: ids => `/skill/${ids.join()}`,
        image: (style, fileName) => `/image/skill/${style}/${fileName}`
      }
    },
    npcs: {
      name: 'npcs',
      cache: true,
      hydrate: true,
      api: {
        ids: () => '/npc',
        getById: id => `/npc/${id}`,
        getByIds: ids => `/npc/${ids.join()}`,
        image: fileName => `/image/npc/${fileName}`
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
    },
    places: {
      name: 'places',
      cache: true,
      api: {
        image: fileName => `/image/place/${fileName}`
      }
    },
    elements: {
      name: 'elements',
      cache: true,
      api: {
        image: (style, fileName) => `/image/element/${style}/${fileName}`
      }
    }
  },
  CACHE_NAME: 'pangsworth',
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
    cacheLoading: 'CACHE_LOADING'
  }
}

module.exports = exportDefault
module.exports.default = exportDefault
