# generate-license-report

An node packages license report generation action.

## Usage

```yml
name: Generate license report
on:
  workflow_dispatch:
  schedule:
    - cron: '0 4 */30 * *' # At 04:00 on every 30ts day-of-month.

jobs:
  generate-license-pr:
    runs-on: ubuntu-latest
    steps:
      - name: checkout your repository using git
        uses: actions/checkout@v4

      # generate-license-report needs node_modules installed to fully function
      # caching is not setup as this action should not run this often
      # NPM
      #- run: npm ci --ignore-scripts
      # PNPM
      #- uses: pnpm/action-setup@v2
      #  with:
      #    version: 7
      #- run: pnpm install --frozen-lockfile --ignore-scripts
      # yarn
      #- run: yarn install --frozen-lockfile --ignore-scripts
      
      - name: generate license report
        id: license-report
        uses: dafnik/generate-license-report@v2
        #with:
        #  package-json-path: 'package.json'
        #  license-report-path: 'licenses.json'
        #  output-format: 'json'

      - name: create new pull request if needed
        if: steps.license-report.outputs.has-no-changes != 'true'
        uses: peter-evans/create-pull-request@v5
        with:
          title: Generated new licenses report
          branch-suffix: timestamp
          commit-message: 'chore: generate new license report'
          body: ${{ steps.license-report.outputs.diff }}
```

### Inputs

| Inputs                          | Default value   | Description                                                                                                                                                                                                                                  |
|---------------------------------|-----------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `package-json-path`             | `package.json`  | Path to your `package.json`                                                                                                                                                                                                                  |
| `license-report-path`           | `licenses.json` | Path to your already existing license report file for comparison                                                                                                                                                                             |
| `output-format`                 | `json`          | Output format of `license-report`. [Supported formats](#supported-output-formats) <br/> If you update the output format you also have to update the `license-report-path`. <br/> For example: `licenses.md`, `licenses.html`, `licenses.csv` |
| `prettier`                      | `true`          | Run prettier on license report                                                                                                                                                                                                               |
| `custom-license-report-command` | `false`         | Execute the `license-report` command located in **your** `package.json`                                                                                                                                                                      |

Furthermore, see [action.yml](action.yml)

#### Supported output formats

- table
- csv
- json
- markdown

### Outputs

| Outputs          | Description                                                                         |
|------------------|-------------------------------------------------------------------------------------|
| `has-no-changes` | Flag to indicate if there are no changes in the licenses file.                      |
| `diff`           | Differences between old and new license report in `markdown`.                       |
| `licenses`       | License report as `string` in your chosen `output-format`. <br> Is always returned. |

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
