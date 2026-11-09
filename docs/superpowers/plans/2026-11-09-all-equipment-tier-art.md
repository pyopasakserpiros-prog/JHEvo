# All Equipment Tier Art Expansion Plan

Base: main b4bbffd / JS2-v2.5.0. User requested the next graphics patch to extend beyond swords to every equipment type and other item groups. Continue native execution under delegated design judgment.

- [x] Generate five 8×8 sheets: 27 additional equipment presentation families, six medicine groups, six generic resource groups and fish. Each family has T1–T7 and a generic mythic grade variant; retain 50/27 named legendary icons from the prior patch.
- [x] Normalize/encode new sheets at 768² WebP to bound download/decoded memory. Keep existing four sheets unchanged.
- [x] Extend the stable manifest to nine sheets / 576 cells, explicit family-to-cell mappings and type aliases. Fix subType resolution for ORNAMENT and AUX_TOOL.
- [x] Route UI art using slot and canonical type; prioritize authored named relic IDs; preserve anatomical/element-specific materials and distinct special medicines.
- [x] Extend unit and real browser coverage for all 28 equipment families (including existing sword), seven tiers, grade independence, aliases, actual catalog coverage, purity, image decoding and standalone.
- [x] Build, schema validate, full audit; inspect desktop/mobile gallery, update current project docs/skills and patch report, fetch and push main without overwriting remote work.

No gameplay/stat/loot changes, no new script tags or schema changes. This visual refinement does not implement the unrelated JS2-v2.6.0 assignment. Existing startup pointer interception remains separately documented.

Validation: 147/147 full-audit groups PASS; final normalized-image browser/unit/inventory/schema checks PASS; final syntax sweep 224/224. Normalizer uses explicit NorthWest crop gravity and exact approved source layouts. Main push is authorized after final checks and verified in the delivery message.
