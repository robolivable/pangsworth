### Contributing
Thank you for being interested in contributing to the Pangsworth project! This project follows a few best practices to maintain a high standard of code, and general product quality. Please take a moment to read about the rules of contribution for Pangsworth for the sake of yours and the community's time with the review process. Thanks again!

### Code
#### Style and preference
The Pangsworth project uses PrettierJS to maintain a project-wide software-governed code style format. This is done to save precious developer time on code style and preference discussions. PrettierJS runs with the project's linting build script. When committing your changes, please include (if needed) an extra commit for PrettierJS changes.

#### Coverage
This project aims to maintain above average branch code coverage. Branch coverage is coverage for separate code paths within code blocks. Unit tests that focus on maintaining a high percentage of branch coverage provides a higher degree of confidence. When contributing, please try to write tests to maintain coverage for your changes above the 70% minimum. Note that there may be exceptions to this rule (case by case basis).

#### Developer comments
Keep developer comments (comments that are in-line, usually mixed in with logics) to an absolute minimum. If you need to add one, please reconsider the purpose for the comment. Is it due to a significantly ambiguous branch of logic? Can this logic branch be refactored to remove the need for the comment? Please consider that developers come from various backgrounds of the world. As a result, due to various culture and language gaps, developer comments may very frequently cause more confusion than the aid that was initially intended. With that said, sometimes there are valid use cases for developer comments. In these cases, where you must add a comment, make sure to prefix the comment with one of these standard comment prefixes, followed by a colon (":"): "NOTE", "TODO", "HACK", "FIXME".
The following are examples of properly formatted developer comments:
- `// NOTE: this is done to suppress console errors due to a chromium bug (#10424242)`
- `// TODO: localize this call to getter`
- `// FIXME: refactor this operation to reduce boilerplate around codebase`
Although developer comments may become counter productive, method documentation can prove to be helpful in most cases. Feel free to add "Java Docs" to your functions to give brief descriptors of what the function is responsible for, its input parameter values and types, and its return values and types. Take care though, to make sure the documentation stays up to date with any future changes to the method signature. Changing the method signature while not making appropriate changes to the documentation can result in confusing the interpretor of the logic, which could be damning.

#### CVE compliance
Please take care to write compliant software that is free of common vulnerabilities and exploits. This includes not writing malicious code, or code that can be considered dubious. Pangsworth is client side software, as a result, there is a zero tolerance policy for these types of issues. If your contribution is suspect you risk having your account blacklisted (blocked) from any future contributions. Additionally, this applies to dependencies installed through the NodeJS package manager. Make sure to run `npm audit` against your changes, especially if you are authoring work that has been in progress for a long period of time (e.g., longer than 2 weeks).

### Overall Design
#### UI/UX
Try to go the extra mile with your user interface design. Attention to detail is greatly encouraged and happily welcomed. Providing a good-looking, intuitive and seamless user experience will keep users satisfied with the app's performance and fluidity. This app is for the community, by the community. Put love into your contribution and you will receive it back in equal or greater amounts by your fellow users!

#### Performance
The Pangsworth project is a data-driven application that provides interfaces for working with large amounts of data points. Depending on the approach, even though the amount of data isn't extraordinary, an inefficient implementation can lead to longer than needed load times. One of the main goals of the Pangsworth project is to provide a fast and responsive experience to compliment the user's gameplay. When contributing, please consider the efficiency of your solution's worst case scenarios. Can your algorithm run against kilobytes of data? What about megabytes or gigabytes? Chrome provides many useful tools to identify slowness in JavaScript code (this is arguably one of JavaScript's best strengths). Make sure to check your code's performance in the developer tool's performance tab to spot any bottlenecks before they hit the master branch.

A note on responsiveness:
Pangsworth is meant to be a supplemental application to aid the user *during* their gameplay. Slow loading times will deter the user from even opening the extension in pinch situations. In a way, a fast and responsive design results in a dopamine feedback loop where the user pulls the app up to look up a piece of information for a quick response to a question or query while playing. Fast response times perpetuate further integration into the user's gameplay loop: this is the essence of what makes a tool truly powerful!

### Legalities
#### Compliance of content (explicit materials)
No explicit material will be tolerated in any contribution to Pangsworth. Contribution of logics that contain, and or generate, as a result of, or in relation to, any sexually explicit, violent and or bullying, hate speech, violent extremism, impersonation and or deceptive behavior, illegal, and or gambling related content will be rejected from being added to the project. Please take care to avoid these types of contributions as multiple offenses will result in blacklisting (blocking) authored accounts that are in violation from future contributions.

#### Ads
You may not, in any capacity, contribute logics for the purpose of advertising anything which results in monetary gains. See the Monetization section of this document for more details. You may, however, within reason, feel free to advertise your own non-monetized personal profile, persona, social media, and or (and not specifically limited to) personal projects within your contributions. Be aware that this is a grey area, depending on case-by-case, your contributions may get rejected for being too distracting to the overall user experience of the direction of Pangsworth.

#### Monetization
Monetization is prohibited within Gala Lab's copyright terms, and as a result, is prohibited in this project. Monetization made on behalf of extending this project risks violating these policies. This does not mean, however, that you may *never* monetize a fork of this project, as long as any assets, or data, copyrighted by Gala Lab is stripped and removed from the forked project. If you're unsure of when you may or may not monetize works in this project, reach out to Gala Lab as per their official copyright notice (see bottom of README.md or LICENSE.md for a copy of this notice).

#### Note from the author
Thank you for reading this far! I ask those who would like to contribute to consider following these guidelines when working on improving Pangsworth. I look forward to how great this project can become! Let's build some cool sh\*t together!! -Rob
