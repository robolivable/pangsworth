#### Bugs
~~- Cache miss issue~~
- Cache miss for live API updates within the version check threshold (need a manual button)
- Offline mode throws errors
  - Identify when the app is running offline
  - Gracefully handle offline mode

#### Features for pangsworth
- settings
  - light/dark theme
  - language
  - manual refresh cache
  - download all image data
~~- image caching~~
~~  - icons~~
~~  - map squares~~
~~  - avatars~~
~~- background image assets downloading~~
- UI/UX for background downloading
  - build a button to trigger downloading
  - the button should confirm the action
  - while downloading, the button should change to "cancel download"
  - while downloading, have a loading indicator
  - if the "cancel download" button is clicked, confirm the action, and stop the background download
- pannable, zoomable canvas for map display
- list items of a specific type
- export data from search results
- copy in-game link to clipboard
- search history saved in search bar
  - group history by date
- search as you type
- nested data types in lists
- search results data list (less data focused)
  - include icon in each row, button to export, button to copy item id to clipboard
- lists are all virtualized (performance lists)
- data focused views for game data
  - sortable tables for data
- tool tips look nice
- alerting for ETL
  - exporting data
  - copying to clipboard
- breadcrumbs for tracking location in extension
  - interact with router, use colapsed breadcrumb system
  - user should be able to click through infinitely long chains of item references
- Graph to plot mob experience gained per level (on a monster view)

#### Data models needed
- Continent(s): nested in "world" - contains polygon object can be used to draw shape on map
- Lodestar(s): nested in "world" - wrapper over a player respawn location

- Skill Levels: nested in "skill" containing effects at each level)
    - Ability(s): nested in "skill level", "bonus" - for containing buff effect values

- Location(s): nested in "monster", "npc", "lodestar" - used to pinpoint place on world map, or to draw tiles with coordinates
- Attack(s): nested in "monster" - monster skills
- Spawn(s): nested in "monster" - monster spawn locations, used to draw areas on map for spawn areas

- Bonus(es): nested in "equipment sets" - wrapper for "ability" describing the applied effects for set bonuses

