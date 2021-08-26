module.exports = {
  API_VERSION_CHECK_INTERVAL_MS: 3600 * 1000,
  API_BASE_URL: 'https://flyff-api.sniegu.fr',
  API_RESOURCE_TYPES: {
    classes: {
      name: 'classes',
      cache: true,
      api: {
        ids: () => '/class',
        getById: id => `/class/${id}`,
        getByIds: ids => `/class/${ids.join()}`,
        image: (style, fileName) => `/image/class/${style}/${fileName}`,
      },
    },
    world: {
      name: 'world',
      cache: true,
      api: {
        ids: () => '/world',
        getById: id => `/world/${id}`,
        getByIds: ids => `/world/${ids.join()}`,
        image: (tileName, tileX, tileY) => `/image/world/${tileName}${tileX}-${tileY}-0.png`,
      },
    },
    monsters: {
      name: 'monsters',
      cache: true,
      api: {
        ids: () => '/monster',
        getById: id => `/monster/${id}`,
        getByIds: ids => `/monster/${ids.join()}`,
        image: fileName => `/image/monster/${fileName}`,
      },
    },
    items: {
      name: 'items',
      cache: true,
      api: {
        ids: () => '/item',
        getById: id => `/item/${id}`,
        getByIds: ids => `/item/${ids.join()}`,
        image: fileName => `/image/class/${fileName}`,
      },
    },
    equipmentSets: {
      name: 'equipmentSets',
      cache: true,
      api: {
        ids: () => '/equipset',
        getById: id => `/equipset/${id}`,
        getByIds: ids => `/equipset/${ids.join()}`,
      },
    },
    skills: {
      name: 'skills',
      cache: true,
      api: {
        ids: () => '/skill',
        getById: id => `/skill/${id}`,
        getByIds: ids => `/skill/${ids.join()}`,
        image: (style, fileName) => `/image/skill/${style}/${fileName}`,
      },
    },
    npcs: {
      name: 'npcs',
      cache: true,
      api: {
        ids: () => '/npc',
        getById: id => `/npc/${id}`,
        getByIds: ids => `/npc/${ids.join()}`,
        image: fileName => `/image/npc/${fileName}`,
      },
    }
    versions: {
      name: 'versions',
      cache: true,
      api: {
        get: () => '/version/data'
      }
    },
    languages: {
      name: 'languages',
      api: {
        get: () => '/language'
      }
    },
    places: {
      name: 'places',
      api: {
        image: fileName => `/image/place/${fileName}`
      }
    },
    elements: {
      name: 'elements',
      api: {
        image: (style, fileName) => `/image/element/${style}/${fileName}`
      }
    }
  },
  CACHE_NAME: 'pangsworth',
  CACHE_VERSION: 1,
  REQUEST_RETRY_OPTIONS: {
    retries: 3,
    retryDelay: 1000,
    retryOn: [503]
  }
}
