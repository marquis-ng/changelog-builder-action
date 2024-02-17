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
| `<type>` | Icon |
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

Note: The `<type>`s in the table correspond to the order of appearance in the resulting changelog.

To learn more about Conventional Commits, visit the [Conventional Commits website](https://www.conventionalcommits.org).

## Inputs
| Parameter | Description | Default |
| --- | --- | --- |
| `token` | Your GitHub Token | `${{ github.token }}` |
| `base-ref` | The base reference name | The tag name to the latest release |
| `head-ref` | The head reference name | The hash of the commit that triggered the workflow |
| `exclude-types`¹ | A comma-delimited string of `<type>`s to exclude | `docs,style,build` |
| `include-types`¹ | A comma-delimited string of `<type>`s to include | An empty string² |

1: `exclude-types` takes precedence over `include-types`. To avoid confusion, set `exclude-types` to an empty string when using `include-types`.

2: If `include-types` is empty, all types will be included.

## Outputs
| Parameter | Description |
| --- | --- |
| `changelog` | The resulting changelog |
| `compare-url` | The URL of the compare page |
