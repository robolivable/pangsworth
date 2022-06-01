### MVP Features
- ~~Settings~~
  - ~~Light/dark theme~~
  - ~~Language~~
  - ~~Manual refresh cache~~
  - ~~Download all image data~~
- ~~Image caching~~
    - ~~Icons~~
    - ~~Map squares~~
    - ~~Avatars~~
- ~~Background image assets downloading~~
- ~~UI/UX for background downloading~~
  - ~~Add a checkbox to enable background image caching on start~~
  - ~~If the cache refresh button is pressed, it will trigger a refresh of the image cache~~
  - ~~If the image cache was never downloaded, it will begin downloading~~
- ~~Settings UI/UX~~
  - ~~Dark/light mode~~
  - ~~Image pre-fetch caching enable/disable~~
- ~~Nested data types in lists~~
- ~~Tool tips look nice~~
- ~~Render state is saved and synced across browsers to user settings~~
- ~~Skill icon preference toggle~~
  - ~~Default toggle changes with dark theme (Easter egg)~~
- ~~*Data models needed for MVP*~~
  - ~~Continent(s): nested in "world" - contains polygon object can be used to draw shape on map~~
  - ~~Lodestar(s): nested in "world" - wrapper over a player respawn location~~
  - ~~Skill Levels: nested in "skill" containing effects at each level)~~
    - ~~Ability(s): nested in "skill level", "bonus" - for containing buff effect values~~
  - ~~Location(s): nested in "monster", "npc", "lodestar" - used to pinpoint place on world map, or to draw tiles with coordinates~~
  - ~~Attack(s): nested in "monster" - monster skills~~
  - ~~Spawn(s): nested in "monster" - monster spawn locations, used to draw areas on map for spawn areas~~
  - ~~Bonus(es): nested in "equipment sets" - wrapper for "ability" describing the applied effects for set bonuses~~
- Data focused views for game data
  - ~~List items of a specific type~~
  - ~~Filter on item types~~
  - ~~Lists are all virtualized (performance lists)~~
  - ~~Have a single item inspector view for each tab~~
  - ~~Sortable tables for data~~
  - Tooltip magnifier for monster images
  - All views completed
- Search as you type
- Search results data list (less data focused)
  - Include icon in each row, button to export, button to copy item id to clipboard
- Single item inspector fully implemented
  - Breadcrumbs for tracking location in extension
    - User should be able to click through infinitely long chains of item references
    - Use colapsed breadcrumb system
- About modal on first time use
  - Describe usage terms (license)
  - Mention contribution process
- Display appropriate copyright for tool assets (images)
- ~~Build continent game objects from worlds~~
  - Hook up continents to npc list to show in filterable column
- Pannable, zoomable canvas for map display using Leaflet
- Data grid view caching system
  - All row data should be cached once generated for faster load times after first time usage
  - Persist cache in user sync settings

### Release Requirements
#### Prerequisites
- ~~Complete README~~
  - ~~Include contribution guideline document and contributors~~
- License all source files
- Generate third party licenses
  - Need to make sure ever license is viewable from the UI (maybe in about section)
- Add license terms agreement modal for first time use
- Documentation
  - Mocks and previews
  - Guides on features
  - README references docs
- Metadata
  - Artwork
    - ~~Extension UI Icons~~
    - All Mascot images
  - Tidy up `manifest.json`
- Open source all code
- Support for all Web-Extension API compatible browsers
  - Firefox
  - Opera
  - Safari
- Open issue tickets for all known bugs/issues at time of MVP
#### Release cadence
- Pre-commit hooks for linting/unit/UI tests
- Functional test environments/pipelines
  - Integration, staging, canary
#### Testing
- Unit tests
  - 70% minimum coverage reports
- UI tests

### Known Bugs/Issues
#### UI/UX
- ~~Settings UX~~
  - ~~Position of progress elements are not aligned properly when downloading~~
  - ~~Progress is not shown for background prefetch on start~~
  - ~~It is possible to click the download button fast enough to trigger two ongoing fetches~~
- Data grids
  - Classes stats calculator UI bug causing trail on slider not to appear unless you increment using the input box
- Data load times
  - Quests data hydration takes significant time
#### Miscellaneous
- ~~Cache miss issue~~
- Cache miss for live API updates within the version check threshold (need a manual button)
- Asset cache downloader freezes sometimes
  - Workaround is just to restart it after closing/re-opening the app
  - Needs more triage, it may be related to throttled requests if it is downloading while the user uses the app
  - Additionally, the download logic fails to pick up where it leaves off if it stops this way
- Offline mode throws errors
  - Identify when the app is running offline
  - Gracefully handle offline mode
##### Known Error/Warning messages in console
- `[Violation] 'X' handler took Nms`
  - This is likely due to load times for a tab, especially on slower machines. We may be able to remedy this by making content load asynchronously inside the Pangsworth wrapping component (the one in charge of handling routing events for each tab).
- `[Violation] Added non-passive event listener to a scroll-blocking <some> event. Consider marking event handler as  'passive' to make the page more responsive. See <URL>`
  - This message is printed from the MUI Slider component on the classes tab. It is currently safe to ignore (active issue in React related to passive event handlers, aka handlers that do not call "preventDefault"), but is spammed a lot (one per each rendered Slider in the table) which is not very nice
- `[Violation] Forced reflow while executing JavaScript took Nms`
  - Needs triage
- `Warning: React does not recognize the 'PangContext' prop on a DOM element. If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase 'pangcontext' instead. If you accidentally passed it from a parent component, remove it from the DOM element.`
  - This is apparently a React warning generated for passing complex props to component children. This is inevitable with the current design due to how PangContext needs to be propagated to all PangPonents. Additional investigation needed here to solutionize a more React-compatible design for this. Regardless, the side effects here does not block the app's functionality, so it should be safe to temporarily ignore.
- `Uncaught (in promise) Error: This request exceeds the MAX_WRITE_OPERATIONS_PER_MINUTE quota.`
  - This is likely a result of spam clicking the tabs, as each tab click triggers a user settings write operation. A fix here would be to place the operations behind a limiter and process them in queue (like how it's done during asset caching).
- `Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function.`
  - Needs triage:
    ```
    Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function.
          at GridBodyComp (chrome-extension://odbnjbllinljgmibjldknmbploebmaji/build/app.js:71617:22)
          at TabGuardCompRef (chrome-extension://odbnjbllinljgmibjldknmbploebmaji/build/app.js:72837:26)
          at div
          at div
          at GridComp (chrome-extension://odbnjbllinljgmibjldknmbploebmaji/build/app.js:71769:22)
          at div
          at AgGridReactUi (chrome-extension://odbnjbllinljgmibjldknmbploebmaji/build/app.js:70682:28)
          at AgGridReact (chrome-extension://odbnjbllinljgmibjldknmbploebmaji/build/app.js:70165:47)
          at div
          at PangDataGrid (chrome-extension://odbnjbllinljgmibjldknmbploebmaji/build/app.js:82884:17)
          at SkillsPangDataGrid (chrome-extension://odbnjbllinljgmibjldknmbploebmaji/build/app.js:85913:17)
          at Skills (chrome-extension://odbnjbllinljgmibjldknmbploebmaji/build/app.js:86161:5)
      printWarning @ react-dom.development.js:67
      error @ react-dom.development.js:43
      warnAboutUpdateOnUnmountedFiberInDEV @ react-dom.development.js:23914
      scheduleUpdateOnFiber @ react-dom.development.js:21840
      dispatchAction @ react-dom.development.js:16139
      GridBodyCtrl.setVerticalScrollPaddingVisible @ ag-grid-community.cjs.js:22079
      ViewportSizeFeature.updateScrollVisibleServiceImpl @ ag-grid-community.cjs.js:26022
    ```
    - Could be related to the state used within the data grid for the skill icon theme toggle Easter egg

### Features for future
#### App features
- Settings UI/UX
  - Choose display language
  - Full localization of all magic text
- Search history saved in search bar
  - Group history by date
- Export data from search results
- ETL
  - Exporting data
    - Streaming pipeline for exporting data within tabs, a framework would make it possible for any tab to export data relevant to its view
  - Copying to system clipboard
    - Copy in-game paste-able link to clipboard
- Asset "size on disk" stats (how much API data stored, cache stats, etc.)
- App cache refresh button
- UI/UX Polish/Improvements
  - Background asset downloading
    - While downloading, the button text should change to "cancel refresh"
    - If the "cancel refresh" button is clicked, confirm the action, and stop the background download
    - "Verify" symbol/icon for showing how recent the cache is
    - Display the last time the cache was downloaded
  - Data grid Tables
    - Custom scrollbars
    - Select columns to load
    - Extensive filter options
      - Filterable enum lists for types, numbers, and binary values
    - Persist filters to user settings
    - Tooltips on all values and images
    - Pretty formatted numbers (comma separation for multiples of 1k)
    - Prettier loading overlay
  - Full Accessibility features (keyboard-only usage)
- Game Data tools
  - Graph to plot mob experience gained per level (on a monster view)
  - Items upgrade calculator (for piercing and power dice enhancing)
  - Implement data views for quests and achievements
#### Tech debt
- Upgrade to MUI 5.0
- Reduce boilerplate
  - Game object schema module
  - Data tabs involving data grid
- Reduce memory footprint wherever possible
- Refactor routes design for search sub-routes
#### Enhancements
- Plugin framework
  - Allow embedding contribution from others
  - Is there a safe way to allow requests to external origins other than Sniegu?
  - Allow cross-framework integration
    - Vue
- Chrome extension store
- Native client (Electron)
