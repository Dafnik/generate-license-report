# generate-license-report

An Node Action for generating library license report

## Usage

```yml
name: Generate license report
on:
  workflow_dispatch:
  schedule:
    - cron: '0 4 */30 * *' # At 04:00 on every 30ts day-of-month.

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: checkout your repository using git
        uses: actions/checkout@v3

      - name: setup node and pnpm # generate-license-report needs node_modules installed to fully function
        uses: dafnik/setup-node-pnpm@v1
        with:
          install-ignore-scripts: true

      - name: generate license report
        id: license-report
        uses: dafnik/generate-license-report@v1
        # with:
        # package: 'package.json'
        # path: 'license.json'
        # output: 'json'

      - name: create new pull request if needed
        if: steps.license-report.outputs.diff != ''
        uses: peter-evans/create-pull-request@v5
        with:
          title: Generated new licenses report
          branch-suffix: timestamp
          commit-message: 'chore: generate new license report'
          body: ${{ steps.license-report.outputs.diff }}
```

| Inputs    | Default value  | Description                                                                                                                                                                                                                                                         |
| --------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `package` | `package.json` | Path to your `package.json`                                                                                                                                                                                                                                         |
| `path`    | `license.json` | Path to your already existing license file.                                                                                                                                                                                                                         |
| `output`  | `json`         | Output format of `license-report`. [Read more](https://www.npmjs.com/package/license-report#generate-different-outputs) <br/> If you update the output format you also have to update the `path`. <br/> For example: `licenses.md`, `licenses.html`, `licenses.csv` |

Furthermore, see [action.yml](action.yml)

## Building

```bash
pnpm build
```

## Testing

Run the project in this repository:

```bash
pnpm dev
```

Run the test workflow:

```bash
act -j test
```

Local testing is done with [act][act]

## Release instructions

In order to release a new version of this action:

1. Locate the semantic version of the [upcoming release][release-list] (a draft is maintained by the [`draft-release` workflow][draft-release]).

2. Publish the draft release from the `main` branch with semantic version as the tag name, _with_ the checkbox to publish to the GitHub Marketplace checked. :ballot_box_with_check:

3. After publishing the release, the [`release` workflow][release] will automatically run to create/update the corresponding the major version tag such as `v0`.

   ⚠️ Environment approval is required. Check the [Release workflow run list][release-workflow-runs].

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE).

<!-- references -->

[act]: https://github.com/nektos/act
[release-list]: https://github.com/dafnik/generate-license-report/releases
[draft-release]: .github/workflows/draft-release.yml
[release]: .github/workflows/release.yml
[release-workflow-runs]: https://github.com/dafnik/generate-license-report/actions/workflows/release.yml
