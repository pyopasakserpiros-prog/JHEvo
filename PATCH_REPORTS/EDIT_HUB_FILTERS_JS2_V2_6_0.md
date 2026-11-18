# Edit Hub Item Spawner Catalog Filters — JS2-v2.6.0

## What changed

The Edit Hub item spawner now builds its category and rarity filters from the complete item catalog exposed by `SECT.EDITOR.catalog`. The UI no longer keeps a partial, hand-maintained list of item kinds or grades.

The loaded catalog contains 6,203 entries across 12 kinds and seven grades:

- Kinds: `PROVISION`, `MATERIAL`, `PILL`, `CRAFTED_PILL`, `EQUIPMENT`, `TECH_MANUAL`, `CRYSTAL`, `SUB_MANUAL`, `PATH_MANUAL`, `PATH_CRYSTAL`, `RECIPE_SCROLL`, and `ORGAN`.
- Grades: `Common`, `Uncommon`, `Refined`, `Rare`, `Exceptional`, `Legendary`, and `Transcendent`.

This resolves the visible gaps in the previous Edit Hub controls: the category menu omitted `PATH_MANUAL` and `PATH_CRYSTAL`; the rarity menu exposed only four grades; and item rows highlighted Legendary entries without showing other actual grades. New item kinds or grades now appear automatically after the catalog gains them.

## Implementation notes

- `SECT.EDITOR.catalogFacets` returns cached kind/grade counts derived from the real catalog. Catalog definitions are static during a loaded game session.
- `SECT.EDITOR.catalogPaginated` includes those facets alongside the selected page.
- `UI.rEdit` renders all available facets, Thai labels for known kinds/grades, counts, and a visible grade chip per item. Transcendent and Legendary entries retain distinct emphasis.
- Existing spawn, teach, equip, destination, quantity, quality, and filtering actions keep their established behavior. This change does not alter item data, natural drop rates, inventory rules, or player permissions.

## Verification

Static source checks and the standalone build were run for this UI change. The full game test suites were not run in this patch.
