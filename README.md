# Changelog Builder Action
GitHub Action that builds a changelog by comparing two refs.

- [Changelog Builder Action](#changelog-builder-action)
  - [Commit Message Format](#commit-message-format)
  - [Inputs](#inputs)
  - [Outputs](#outputs)

## Commit Message Format
This action adheres to the Conventional Commits specification. TL;DR:
```
<type>[optional scope]: <description>
```

Please use only the following `<type>`s for commit messages:
| Types | Icons |
| --- | --- |
| feat | :sparkles: |
| fix | :bug: |
| docs | :memo: |
| style | :lipstick: |
| refactor | :hammer: |
| perf | :zap: |
| test | :test_tube: |
| build | :package: |
| ci | :construction_worker: |
| chore | :recycle: |
| revert | :wastebasket: |

Note: The types in the table have the same order as the resulting changelog.

To learn more about Conventional Commits, visit the [Conventional Commits website](https://www.conventionalcommits.org).

## Inputs
| Parameters | Description | Default |
| --- | --- | --- |
| `token` | Your GitHub Token | `${{ github.token }}` |
| `base-ref` | The base reference name | The tag name to the latest release |
| `head-ref` | The head reference name | The hash of the commit that triggered the workflow |

## Outputs
| Parameters | Description |
| --- | --- |
| `changelog` | The resulting changelog |
