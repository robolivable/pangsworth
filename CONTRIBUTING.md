### Contributing
Thank you for being interested in contributing to the Pangsworth project! This project follows a few best practices to maintain a high standard of code, and general product quality. Please take a moment to read about the rules of contribution for Pangsworth for the sake of yours and the community's time with the review process. **These are the rules for Pangsworth. Please respect them!** Thanks again!

### Code
#### Style and preference
The Pangsworth project uses PrettierJS to maintain a project-wide software-governed code style format. This is done to save precious developer time on code style and preference discussions. PrettierJS runs with the project's linting build script. When committing your changes, please include (if needed) an extra commit for PrettierJS changes.

#### Coverage
This project aims to maintain above average branch code coverage. Branch coverage is coverage for separate code paths within code blocks. Unit tests that focus on maintaining a high percentage of branch coverage provides a higher degree of confidence. When contributing, please try to write tests to maintain coverage for your changes *above the 70% minimum*. Note that there may be exceptions to this rule (case by case).

#### Developer comments
Keep developer comments (comments that are in-line, usually mixed in with logics) to an **absolute minimum**. If you need to add one, please reconsider the purpose for the comment. Is it due to a significantly ambiguous branch of logic? Can this logic branch be refactored to remove the need for the comment? Please consider that developers come from various backgrounds of the world. As a result, due to various culture and language gaps, developer comments may *very frequently* cause more confusion than the aid initially intended. With that said, sometimes there are valid use cases for developer comments. In these cases, where you must add a comment, make sure to **prefix the comment** with one of these standard comment prefixes, followed by a colon (":"): "NOTE", "TODO", "HACK", "FIXME".
The following are examples of properly formatted developer comments:
- `// NOTE: this is done to suppress console errors due to a chromium bug (#42424242)`
- `// TODO: localize this call to getter`
- `// FIXME: refactor this operation to reduce boilerplate around codebase`

##### Java Docs
Although developer comments may become counter productive, method documentation can prove to be helpful in most cases. Feel free to add "Java Docs" to your functions to give brief descriptors of what the function is responsible for, its input parameter values and types, and its return values and types. Take care though, to make sure the documentation stays up to date with any future changes to the method signature. Changing the method signature while not making appropriate changes to the documentation can result in confusing the interpretor of the logic, which could be damning.

#### CVE compliance
Please take care to write compliant software that is free of common vulnerabilities and exploits. This includes not writing malicious code, or code that can be considered dubious. Pangsworth is client side software, as a result, there is a zero tolerance policy for these types of issues. If your contribution is suspect, you risk having your account blacklisted (blocked) from any future contributions. Additionally, this applies to dependencies installed through the NodeJS package manager. Make sure to run `npm audit` against your changes, especially if you are authoring work that has been in progress for a long period of time (e.g., longer than 2 weeks).

#### Branching model
This project uses a standard branching and pull request process for contributing changes to the master branch. To contribute changes, create a branch off of the master branch and commit all changes to that branch. If you are contributing a change based on an existing issue, create the branch directly from the issue using the **Create a branch** link on the associated issue ticket. This will automatically link the ticket to your changes for tracking. You may optionally link a pull request after the fact, but it is recommended you create the initial branch this way as it maintains a standard for branch names.

##### Branch names and branch deletion
You may name your branch as you please, as long as it is accepted by git's min/max limits. The only thing I ask is that the branch is tracked against any relevant issue tickets. This makes it easy to generate change logs between release candidate versions, if and when the project will adhere to a release cycle cadence. Branches are not required to be deleted after they are merged, but they may get deleted eventually to tidy up really old, stale branches.

#### Committing
Pangsworth respects a clean and tidy project structure. Quality assurance around commit message content contributes to maintaining this tidiness. When creating commit messages, please use short, descriptive action phrases describing the action of doing a change. Character lengths matter here! Keep character lengths of commit titles *under 72 characters*. For commit bodies, keep character lengths under 80 by manually inserting newlines. This assures that your commit reads very well and is accessible on virtually all screens. This is *respectful and inclusive* for all kinds of eyes during code review when studying your new changes.
Example of a *well worded* commit message:
```
Fix cache-miss bug in asset downloading module
```
This is an ideal commit message. It is well under 72 characters, it describes the commit in an action phrase, and it provides insight on what exactly was changed in the commit.

Example of a *poorly worded* commit message:
```
installed modules, fixed bugs and cleaned up code
```
This commit message is under 72 characters, but is poorly worded as it does not provide much description on what exactly changed. It is vague, dismissive, and only adds noise to the commit history. **Please avoid commit messages like these.**

#### Re-basing
This project uses a re-base model for development. This model is used to maintain a **clean commit history** with neatly sectioned out versions. When you are ready to issue a pull request for your changes, make sure to re-base your branch against the target branch (master branch), and update your remote branch accordingly. **Merge-commit pull requests are prohibited** and will be rejected, so please make sure your branch is properly re-based before issuing your pull request.
Example of how to re-base your branch:
```
git checkout master && git pull
git checkout <your-branch-name> && git pull && git rebase master
```
At this point git will stash all of your changes up to the least common commit shared between your branch and the master branch, fast forward the `HEAD` reference on your branch, and re-apply your commits at the top of the latest commit (which should now be up to date with master). This will effectively "pick up" your changes, and "shift" past each commit in the history, re-creating each one, and placing your changes grouped at the front of the master branch. Make sure you do this before merging any changes, as merge-commits will be rejected. Additionally, make sure your changes are topped off with a version bump (see the Versioning section below for more details).

##### Conflicts during re-base
Resolving conflicts in a re-base has subtle differences to resolving conflicts during merge-commits. Since git is effectively fast forwarding your changes on top of each commit starting from the least common commit, you will encounter conflicts as they happen in the history of the changes. As a result, you may need to resolve a conflict that *would have* existed in the past, as if you are applying your current features to an older version of the project. This can lead to *merge conflict resolution regression issues*, so for this reason, *please take care when resolving merge conflicts when re-basing!* With that said, a re-base model is *still preferred* for the benefits it brings around maintaining a *clean* and *easy to read commit history* of changes, nicely separated by version commits. Please feel free to reach out to the community for help with resolving these types of conflicts if you feel unsure of your changes.

#### Versioning
This project uses the semantic versioning system for tracking changes over the project lifetime. Additionally, a re-base model is used which is meant to keep the commit history clean in respect to the project version. All contributions will be assigned a version (whether it be a major, feature, or patch) before merging.

This project uses the versioning tool built into NodeJS package manager (NPM) to commit version bumps. Example of how to version your branch:
In the project root (where `package.json` is located), run:
```
npm version minor
```
This will create a new version commit and automatically bump the version of all relevant project files for you. Nothing else is required for versioning. From this point you are ready to merge your changes. Note: this is usually the very last step of your contribution process. At this point, you should already have had your changes reviewed and approved for merging. Leaving the version bump for the very last step allows you to avoid version bump conflicts with other developers, so keep this in mind.

Note on how to version your changes:
The general rule of thumb is, for all feature contributions that do not include major, contract-breaking changes, a minor version should be used. This includes all changes related to new features, dependency updates, and even updates to documentation which may be installed by the end user without issues. The remaining version types (major and patch) are reserved specifically for contract-breaking changes, and bug fixes (changes related to new and existing regressions). Here are general definitions for when to use each:
- `major`: changes that break contract. Will merging these changes cause the application to crash on existing user machines? If so, these changes should be placed behind a major version bump.
- `minor`: most contributions should use this version bump. Are your changes very minimal? Have doubts on which to use? You probably still want to use minor.
- `patch`: reserved specifically for changes that are made to fix issues related to existing, or newly merged regressions. A bug ticket is expected to be tracked against all patch version bumps. Pull requests for changes that should use minor version but use patch instead will be rejected. Additionally, if a ticket is not tracked for this version, the review process will be delayed. **These are the rules for Pangsworth. Please respect them.**

### Overall Design
#### UI/UX
Try to go the extra mile with your user interface design. Attention to detail is greatly encouraged and happily welcomed. Providing a good-looking, intuitive and seamless user experience will keep users satisfied with the app's performance and fluidity. This app is for the community, by the community. Work on it as if you are working on it for your own usage. Put love into your contribution and you will receive it back in equal and greater amounts by your fellow users!

#### Performance
The Pangsworth project is a data-driven application that provides interfaces for working with large amounts of data points. Depending on the approach, even though the amount of data isn't extraordinary, an inefficient implementation can lead to longer than needed load times. One of the main goals of the Pangsworth project is to provide a *fast and responsive* experience to compliment the user's game-play. When contributing, please consider the efficiency of your solution's worst case scenarios. Can your algorithm run against kilobytes of data? What about megabytes or gigabytes? Chrome provides many useful tools to identify slowness in JavaScript code (this is arguably one of JavaScript's best strengths). Make sure to check your code's performance in the developer tool's performance tab to spot any bottlenecks before they hit the master branch. It is not likely these performance issues will be caught during the pull request review process. If they exist, it is likely they will reach the end user and result in a bad experience. Keep this in mind and make sure to follow due diligence regarding the performance of your code.

A note on responsiveness:
Pangsworth is meant to be a supplemental application to aid the user *during* their game-play. Slow loading times will deter the user from even opening the extension in pinch situations. In a way, a fast and responsive design results in a dopamine feedback loop where the user pulls the app up to look up a piece of information for a quick response to a question or query while playing. Fast response times perpetuate further integration into the user's game-play loop: this is the *essence* of what makes a tool truly powerful!

### Legalities
#### Compliance of content (explicit materials)
No explicit material will be tolerated in any contribution to Pangsworth. Contribution of logics that contain, and or generate, as a result of, or in relation to, any sexually explicit, violent and or bullying, hate speech, violent extremism, impersonation and or deceptive behavior, illegal, and or gambling related content will be rejected from being added to the project. Please take care to avoid these types of contributions as multiple offenses will result in blacklisting (blocking) authored accounts that are in violation from future contributions.

#### Ads
You may not, in any capacity, contribute logics for the purpose of advertising anything which results in monetary gain. See the Commercial usage section of this document for more details. You may, however, within reason, feel free to advertise your own non-commercial, personal profile, persona, social media, and or (and not specifically limited to) personal projects within your contributions. Be aware that this is a grey area, depending on case-by-case, your contributions may get rejected for being too distracting to the overall user experience of the direction of Pangsworth.

#### Commercial usage
Commercial usage is prohibited within Gala Lab's copyright terms, and as a result, is prohibited in this project. Monetization made on behalf of extending this project risks legally violating these terms. This does not mean, however, that you may *never* commercialize *a fork* of this project, as long as any assets, and or data, copyrighted by Gala Lab is completely stripped and removed from the forked project. If you're unsure of when you may or may not commercialize works in this project, reach out to Gala Lab as per their official copyright notice (see bottom of README.md or LICENSE.md for a copy of this notice). For all other matters involving commercial use, refer to the project's GPLv3 license terms.

#### Note from the author
Thank you for reading this far! I ask those who would like to contribute to consider following these guidelines when working on improving Pangsworth. I look forward to how great this project can become! Let's build some cool sh\*t together!! <3 -Rob
