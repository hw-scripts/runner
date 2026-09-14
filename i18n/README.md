# Interface dictionaries

`translations.json` is the source of truth. Every key has `en`, `uk`, and `ru` values side by side. Do not add keys directly to the runtime dictionaries.

Edit this file while translating. Then generate the flat runtime dictionaries:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\i18n\i18n.ps1 -Action Split
```

The script stops if a language has a missing or empty value. `HWrunner.js` continues to load the generated `en.json`, `uk.json`, or `ru.json` from this directory.

Add a new key with one command. It updates `translations.json` first, then regenerates every runtime dictionary:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\i18n\i18n.ps1 -Action Add -Key PACKS_SAVE -English "Save pack" -Ukrainian "Зберегти пак" -Russian "Сохранить пак"
```

Before committing, validate that the generated dictionaries still match the canonical file:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\i18n\i18n.ps1 -Action Validate
```

GitHub runs the same validation for every push and pull request. When a non-`master` branch has dictionary changes, it also creates or updates a separate dictionary-only pull request into `master`.

Dictionary workflow:

1. Add a key in the feature branch with `Add`, then review all three translations there.
2. Run `Validate` in that branch.
3. Push the branch. GitHub creates or updates `i18n: sync from <branch>` with only `translations.json` and the generated `en.json`, `uk.json`, and `ru.json`.
4. Review and merge that small PR into `master` before publishing code that uses the new key.

Feature branches only add keys. The deployed script always loads runtime dictionaries from `master`, so this keeps every branch compatible with the current dictionary. The repository setting **Actions > General > Workflow permissions** must allow **Read and write permissions** for `GITHUB_TOKEN` so the workflow can open the PR.

`Merge` is only for rebuilding `translations.json` from the three flat files:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\i18n\i18n.ps1 -Action Merge
```
