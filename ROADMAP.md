## Pangsworth planned features
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
- Graph to plot mob experience gained per level (on a monster view)
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
#### Tech debt
- Upgrade to MUI 5.0
- Reduce boilerplate
  - Game object schema module
  - Data tabs involving data grid
- Reduce memory footprint wherever possible
#### Enhancements
- Plugin framework
  - Allow embedding contribution from others
  - Is there a safe way to allow requests to external origins other than Sniegu?
  - Allow cross-framework integration
    - Vue
- Chrome extension store
- Native client (Electron)