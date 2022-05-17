<p align="center">
![Sir Pangington Pangsworth](https://github.com/robolivable/pangsworth/blob/master/docs/Pangington.png?raw=true)
*Sir Pangington Pangsworth mascot art illustrated by [@Burgerbuan](https://twitter.com/burgerbuan) (Twitter handle)*
</p>

# Pangsworth Info Butler: *At your service anywhere in Madrigal.*

### Pangsworth Info Butler Web Extension
Pangsworth is an open source web extension that extends the Flyff Universe game data and makes it available for viewing in the browser. It uses caching techniques to optimally store and index *all* of the game data for quick in-memory access to game information.

This project aims to provide useful tools that are quick and easy to access while you play, right in the browser.

Pangsworth is an ambitious community project in active development with big plans for the future. Make sure to check back for updates on what's coming in later releases!

### Current features of this app
- Full local caching of API game data and image assets (just under 60MB for all data)
- Virtualized data grids for quick page-less scrolling through all game data
  - Powered by AG Data Grid community edition with out of the box features like smooth column resizing, filtering, and sorting
- User interface/experience powered by React and MUI 4.0 for a clean look and feel, dark mode included! :)
- Game object inspector featured with breadcrumbs for seamless exploration of game data
- Local Lucine-based, in-memory, real-time, full-text searching across all game data, enabling performant look ups of custom keywords
- Sophisticated implementation for background loading of API data with built in retry and rate limiting for optimal loading
- API data encapsulation providing ORM-like core APIs to make it easy to access game data locally
  - Singleton "Pang Context" design provides access to all data interfaces in all child components
- Built by the community, for the community, open source under GPLv3.0; strictly open and available for all who wish to view it for now, and forever!

### Features for the future
- More extensive data grid filter features for more powerful tooling for exploring game data
- ETL for game data: features for data transformation and exporting to external file formats
- Plugin framework for fully supporting third party integrations through contributions
- Native client powered by Electron

### Contributing
See CONTRIBUTING.md for guidelines around contributing to this codebase.

#### Quick start guide for contributors
The Pangsworth base app is written entirely in NodeJS. To contribute and deploy changes you must have a functioning NodeJS development environment.

##### Getting the code
```
git clone https://github.com/robolivable/pangsworth.git && cd pangsworth
```

##### Installing and building with NPM
```
npm i && npm run build
```

##### Linting and Tests
```
npm run jshint && npm run test
```

##### Loading the extension: Chrome
Menu (ellipsis) > More tools > Extensions > Load unpacked > Navigate to and select the project root folder (folder containing `manifest.json`)

##### Loading the extension: Firefox
Pangsworth is built using Web Extension manifest version 3. This manifest version is not yet supported on FireFox, unfortunately. Testing for this version will be available some time soon (hopefully): [Manifest Version 3 is not supported for Firefox extensions [Mozilla.org]](https://discourse.mozilla.org/t/manifest-version-3-is-not-supported-for-firefox-extensions/80651/5)

### Licensed under the Open Source General Public License (version 3)
See LICENSE.md for terms regarding licensing of this codebase and how you are allowed to consume and/or extend it properly.

### Gala Corp. Copyright Notice
This project is not directly affiliated with Gala Lab Corp. outside interfacing with the public Flyff Universe game API (https://flyff-api.sniegu.fr/). For disclaimer, this project uses assets downloaded from Gala Lab's APIs for providing useful tools to supplement the Flyff Universe game-play experience. These assets are owned and copyrighted by Gala Lab Corp., see the following official notice for details regarding the fair use of these assets (a copy of this notice is also included at the bottom of LICENSES.md):

<p  align="center" style="font-weight: bold;">
Copyright 2002-2022 © Gala Lab Corp. All Rights Reserved.
</p>
Permission to use the data and images granted only for information sites and tools about the official game. Gala Lab reserves the right to no longer grant this permission at any time. Commercial use is strictly prohibited. Use for in-game automation and cheating tools, or use in any other video game is strictly prohibited. Please contact the developers if you wish to verify that your use of this content is in accordance with the copyright.

![Gala Lab Logo](https://lh3.googleusercontent.com/X1lOAnKqF51Ngrb4zRYKpWGwc5znNcWc-77eWBpoN_uQc9guiEZTSOaQKpAxJ0ClcyPiF1Tl8qRxsFeXWocAZh-vEFtMe4WNllKqV9g0CQMaf2pHCLNCjvtiZyJHWn1sBKy4EbLOahSV-8HjiA)
