# Upstream synchronization checkpoints

## Checkpoint 1 — first 50 post-base commits

- Source range: `f3c777b2446961352b7153a19e347c26ec74ba8e..6de6be23581c96b33c40584948c92788f4323d12` along upstream first-parent history.
- Target overall range remains pinned to `f32356801d569afd570c5a8357d38fa932a44c69..b8d43af1919fa0e96382577899241535c71be694` (561 commits total).
- Integration is being performed directly in `D:\Haze\delight`, branch `delight`, as requested. The original 11 staged user paths remain preserved in `stash@{0}`.
- Local merge commit: `5d13a9c03` (`Merge Fluxer upstream checkpoint 1 (50 commits)`). It has not been pushed.
- Resolved 10 merge conflicts and retained Delight-specific routing, auth split-panel layout, spark/wordmark, and Delight/Premium product defaults. See [conflict-resolution.md](conflict-resolution.md).
- Added channel-type icons in the existing create-channel chooser.
- Added migration handling and a fixture for the Delight profile-effect preference; normalized Windows path separators in a registry test; updated Premium fallback tests for Delight defaults.

### Checks

| Check | Result |
|---|---|
| `pnpm install --frozen-lockfile` | Passed |
| `pnpm --filter fluxer_app run generate:css-types` | Passed |
| `pnpm --filter fluxer_app run typecheck:only` | Passed |
| `pnpm --filter fluxer_app run test -- --maxWorkers=4 --testTimeout=60000` | Passed: 101 files, 1,392 tests |
| Unresolved Git paths | 0 |
| `git diff --check` | No whitespace errors; only LF/CRLF notice for `.gitignore` |

No commit has been pushed and nothing has been deployed. To keep upcoming reviews smaller, the next checkpoint is commits 51–60 after the common base, through `7937d5f802`; this range changes 222 unique paths. Each checkpoint must be reviewed, tested, and recorded before moving forward.
