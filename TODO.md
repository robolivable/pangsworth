#### MVP Features for pangsworth
- ~~settings~~
  - ~~light/dark theme~~
  - ~~language~~
  - manual refresh cache
  - ~~download all image data~~
- ~~image caching~~
    - ~~icons~~
    - ~~map squares~~
    - ~~avatars~~
- ~~background image assets downloading~~
- UI/UX for background downloading
  - Add a checkbox to enable background image caching on start
  - The checkbox should enable a cache refresh button
  - If the cache refresh button is pressed, it will trigger a refresh of the image cache
  - If the image cache was never downloaded, it will begin downloading
  - while downloading, the button text should change to "cancel refresh"
  - while downloading, have a loading indicator
  - if the "cancel refresh" button is clicked, confirm the action, and stop the background download
- settings UI/UX
  - dark/light mode
  - image pre-fetch caching enable/disable
  - choose display language
- list items of a specific type
  - filter on item types
- search as you type
- nested data types in lists
- search results data list (less data focused)
  - include icon in each row, button to export, button to copy item id to clipboard
- lists are all virtualized (performance lists)
- data focused views for game data
  - Have a single item inspector view for each tab
  - sortable tables for data
- ~~tool tips look nice~~
- breadcrumbs for tracking location in extension
  - interact with router, use colapsed breadcrumb system
  - user should be able to click through infinitely long chains of item references

#### Data models needed for MVP
- Continent(s): nested in "world" - contains polygon object can be used to draw shape on map
- Lodestar(s): nested in "world" - wrapper over a player respawn location
- Skill Levels: nested in "skill" containing effects at each level)
  - Ability(s): nested in "skill level", "bonus" - for containing buff effect values
- Location(s): nested in "monster", "npc", "lodestar" - used to pinpoint place on world map, or to draw tiles with coordinates
- Attack(s): nested in "monster" - monster skills
- Spawn(s): nested in "monster" - monster spawn locations, used to draw areas on map for spawn areas
- Bonus(es): nested in "equipment sets" - wrapper for "ability" describing the applied effects for set bonuses

#### Release requirements
- complete README
- license all source files
- generate third party licenses
- add license terms agreement modal for first time use
- documentation
  - mocks and previews
  - guides on features
  - README references docs
- Add Pangsworth metadata
  - Artwork
    - Extension UI Icons
  - Tidy up manifest.json
- Define release deployment process
- Open source all code

#### Bugs
- ~~Cache miss issue~~
- Cache miss for live API updates within the version check threshold (need a manual button)
- Offline mode throws errors
  - Identify when the app is running offline
  - Gracefully handle offline mode

#### Features for later
- pannable, zoomable canvas for map display
- search history saved in search bar
  - group history by date
- export data from search results
- alerting for ETL
  - exporting data
  - copying to clipboard
- copy in-game link to clipboard
- Graph to plot mob experience gained per level (on a monster view)
- Support Firefox
- Chrome extension store?
