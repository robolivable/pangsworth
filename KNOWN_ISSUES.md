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
  - NPC shop item loading takes significant time
#### Miscellaneous
- ~~Cache miss issue~~
- Cache miss for live API updates within the version check threshold (need a manual button)
- Asset cache downloader freezes sometimes
  - Workaround is just to restart it after closing/re-opening the app
  - Needs more triage, it may be related to throttled requests if it is downloading while the user uses the app
  - ~~Additionally, the download logic fails to pick up where it leaves off if it stops this way~~
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
