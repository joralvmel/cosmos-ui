# Third-party notices

Cosmos UI is MIT licensed. This file lists third-party code and assets that are **bundled or redistributed** inside
published packages, with their license and attribution. Regular npm dependencies keep their own license files and are
covered by the SBOM generated on each release.

| Component  | Used in | License | Source |
| ---------- | ------- | ------- | ------ |
| _None yet_ | —       | —       | —      |

## Planned

- **Lucide** icons (ISC) for `@joralvmel/cosmos-icons`. When the icon pipeline lands, its license text is copied to
  `packages/icons/LICENSE-lucide` and recorded here (see `.github/skills/sync-icons/SKILL.md`).

## How to add an entry

1. Prefer depending on a package over copying its code.
2. If code or assets are copied, keep the original license header, add the full license text next to the files and
   add a row above (name, version, license, URL).
3. The `reviewer` agent blocks pull requests that copy third-party material without an entry here.
