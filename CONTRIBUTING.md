# Contributing to React Template

Want to contribute to React Template? There are a few things you need to know.

We wrote a **[contribution guide](https://github.com/javierhersan/react-template/CONTRIBUTING.md)** to help you get started.

### Commit Messages

The commit should have the following structure:

```console
$ git commit -m "
    Commit Description

    Commit Body

    Commit Footer"
```

#### Commit Description

```console
<type>(<scope>): <commit_description>
```

The “type” field must be chosen from the options listed below:

- `build` : Changes related to building the code (e.g. build tool, ci pipeline, dependencies, project version, adding npm dependencies or external libraries).
- `chore`: Changes that do not affect the external user (e.g. updating the .gitignore file or .prettierrc file).
- `feat`: A new feature.
- `fix`: A bug fix.
- `docs`: Documentation a related changes.
- `refactor`: A code that neither fix bug nor adds a feature. (eg: You can use this when there is semantic changes like renaming a variable/ function name).
- `perf`: A code that improves performance style: A code that is related to styling.
- `test`: Adding new test or making changes to existing test
- `style`: Commits, that do not affect the meaning (white-space, formatting, missing semi-colons, etc)
- `ops`: Commits, that affect operational components like infrastructure, deployment, backup, recovery, ...

Scopes:

The scope provides additional contextual information.
Is an optional part of the format.
Allowed Scopes depends on the specific project.
Don't use issue identifiers as scopes.

Breaking Changes Indicator:

Breaking changes should be indicated by an ! before the : in the subject line e.g. feat(api)!: remove status endpoint
Is an optional part of the format.

Description:

The description contains a concise description of the change.
Is a mandatory part of the format
Use the imperative, present tense: "change" not "changed" nor "changes"
Think of This commit will... or This commit should...
Don't capitalize the first letter
No dot (.) at the end

Commit example:

```console
$ git commit -m "feat(global): Remove non-JSX prop types checks"
```

#### Commit Body and Footer

The commit body and footer are opcional. Include it if the commit description is not self-explanatory and requires an additional description.

Body:

The body should include the motivation for the change and contrast this with previous behavior.
Is an optional part of the format
Use the imperative, present tense: "change" not "changed" nor "changes"
This is the place to mention issue identifiers and their relations

Footer:

The footer should contain any information about Breaking Changes and is also the place to reference Issues that this commit refers to.
Is an optional part of the format
optionally reference an issue by its id.
Breaking Changes should start with the word BREAKING CHANGES: followed by space or two newlines. The rest of the commit message is then used for this.

Commit example:

```console
$ git commit -m "feat(global): Remove non-JSX prop types checks

  non-JSX components are no longer part of the project

  refers to JIRA-1337

  BREAKING CHANGES: non-JSX props no longer supported."
  "
```

### Pull Requests

Not available.

### Versioning

For developers to detect breaking changes the version number of a component is important.

There is different versioning number schemes, e.g.

`major.minor[.build[.revision]]`

or

`major.minor[.maintenance[.build]]`.

Upon build / CI these version numbers are being generated. During CD / release components are pushed to a _component repository_ such as Nuget, NPM, Docker Hub where a history of different versions is being kept.

Each build the version number is incremented at the last digit.

Updating the major / minor version indicates changes of the API / interfaces / contracts:

- Major Version: A breaking change
- Minor Version: A backwards-compatible minor change
- Build / Revision: No API change, just a different build.

#### Semantic Versioning

Semantic Versioning is a concept of calculating the version number automatically based on a certain source code repository.

The `semver` tool looks at a GIT source control branch and comes up with a _repeatable_ and _unique_ version number based on

- number of commits since last major or minor release
- commit messages
- tags
- branch names

Examples of semver version numbers:

- **1.0.0-alpha.1**: +1 commit _after_ the alpha release of 1.0.0
- **2.1.0-beta**: 2.1.0 in beta branch
- **2.4.2**: 2.4.2 release

Version Updates happen through:

- Commit messages or tags for Major / Minor / Revision updates.
- Branch names (e.g. develop, release/..) for Alpha / Beta / RC
- Otherwise: Number of commits (+12, ..)

Recommendation is to run semver during your CI process to make each build uniquely identifiable.

Given a version number MAJOR.MINOR.PATCH, increment the:

    MAJOR version when you make incompatible API changes
    MINOR version when you add functionality in a backwards compatible manner
    PATCH version when you make backwards compatible bug fixes

Additional labels for pre-release and build metadata are available as extensions to the MAJOR.MINOR.PATCH format.

    e.g. : 0.1.0-alpha

A larger set of pre-release fields has a higher precedence than a smaller set, if all of the preceding identifiers are equal.

    e.g. : 1.0.0-alpha < 1.0.0-alpha.1 < 1.0.0-alpha.beta < 1.0.0-beta < 1.0.0-beta.2 < 1.0.0-beta.11 < 1.0.0-rc.1 < 1.0.0.

### Stages of development

- #### Pre-alpha

Pre-alpha refers to all activities performed during the software project before formal testing. These activities can include requirements analysis, software design, software development, and unit testing. In typical open source development, there are several types of pre-alpha versions. Milestone versions include specific sets of functions and are released as soon as the feature is complete.

- #### Alpha

The alpha phase is the first phase of software testing (alpha is the first letter of the Greek alphabet). In this phase, developers generally test the software using white-box techniques. Additional validation is then performed using black-box or gray-box techniques, by another testing team. Moving to black-box testing inside the organization is known as alpha release.

Alpha software is not thoroughly tested by the developer before it is released to customers. Alpha software may contain serious errors, and any resulting instability could cause crashes or data loss. Alpha software may not contain all of the features that are planned for the final version. In general, external availability of alpha software is uncommon in proprietary software, while open source software often has publicly available alpha versions. The alpha phase usually ends with a feature freeze, indicating that no more features will be added to the software. At this time, the software is said to be feature complete. A beta test is carried out following acceptance testing at the supplier's site (alpha test) and immediately before the general release of the software as a product.

In general, an alpha version or release of a software package intends to do something particular, and mostly does so, yet isn't guaranteed to do so fully.

`Feature complete`

A feature complete (FC) version of a piece of software has all of its planned or primary features implemented but is not yet final due to bugs, performance or stability issues.[6] This occurs at the end of alpha testing of development.

Usually, a feature-complete software still has to undergo beta testing and bug fixing, as well as performance or stability enhancement before it can go to release candidate, and finally gold status.

- #### Beta

Beta, named after the second letter of the Greek alphabet, is the software development phase following alpha. Software in the beta stage is also known as beta ware. A beta phase generally begins when the software is feature complete but likely to contain several known or unknown bugs.[8] Software in the beta phase will generally have many more bugs in it than completed software and speed or performance issues, and may still cause crashes or data loss. The focus of beta testing is reducing impacts on users, often incorporating usability testing. The process of delivering a beta version to the users is called beta release and is typically the first time that the software is available outside of the organization that developed it. Software beta releases can be either open or closed, depending on whether they are openly available or only available to a limited audience. Beta version software is often useful for demonstrations and previews within an organization and to prospective customers. Some developers refer to this stage as a preview, preview release, prototype, technical preview or technology preview (TP), or early access.

Beta testers are people who actively report issues with beta software. They are usually customers or representatives of prospective customers of the organization that develops the software. Beta testers tend to volunteer their services free of charge but often receive versions of the product they test, discounts on the release version, or other incentives.

`Perpetual beta`

Some software is kept in so-called perpetual beta, where new features are continually added to the software without establishing a final "stable" release. As the Internet has facilitated the rapid and inexpensive distribution of software, companies have begun to take a looser approach to the use of the word beta.

`Open and closed beta`

Developers may release either a closed beta, or an open beta; closed beta versions are released to a restricted group of individuals for a user test by invitation, while open beta testers are from a larger group, or anyone interested. Private beta could be suitable for the software that is capable of delivering value but is not ready to be used by everyone either due to scaling issues, lack of documentation or still missing vital features. The testers report any bugs that they find, and sometimes suggest additional features they think should be available in the final version.

Open betas serve the dual purpose of demonstrating a product to potential consumers, and testing among a wide user base is likely to bring to light obscure errors that a much smaller testing team might not find.

- #### Release candidate

A release candidate (RC), also known as "going silver", is a beta version with the potential to be a stable product, which is ready to release unless significant bugs emerge. In this stage of product stabilization, all product features have been designed, coded, and tested through one or more beta cycles with no known showstopper-class bugs. A release is called code complete when the development team agrees that no entirely new source code will be added to this release. There could still be source code changes to fix defects, changes to documentation and data files, and peripheral code for test cases or utilities. Beta testers, if privately selected, will often be credited for using the release candidate as though it were a finished product. Beta testing is conducted in a client's or customer's location and to test the software from a user's perspective.

- #### Stable release

Also called production release, the stable release is the last release candidate (RC) which has passed all stages of verification and tests. The remaining bugs are considered acceptable. This release goes to production.

Some software products (e.g. Linux distributions) also have long term support (LTS) releases which are based on full releases that have already been tried and tested and receive only security updates. This allows developers to allocate more time toward product development instead of updating code or finding and fixing newly introduced bugs due to outdated assumptions about the used system, language, or underlying libraries.
