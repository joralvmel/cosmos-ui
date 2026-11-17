# @joralvmel/cosmos-react

## 0.3.0

### Minor Changes

- [#28](https://github.com/joralvmel/cosmos-ui/pull/28) [`9da9229`](https://github.com/joralvmel/cosmos-ui/commit/9da9229078d91c98fca01b5b68a2f5fb01275530) Thanks [@joralvmel](https://github.com/joralvmel)! - Add the Icon Button component (`<cosm-icon-button>`) with centered icon content and React, Angular and React Native implementations.

- [#33](https://github.com/joralvmel/cosmos-ui/pull/33) [`8f6a5c5`](https://github.com/joralvmel/cosmos-ui/commit/8f6a5c51af2605fd90c3c63a2530943cc075f949) Thanks [@joralvmel](https://github.com/joralvmel)! - Add accessible single- and multiple-selection Listbox across web, React, Angular and React Native
  with grouped options, descriptions and icons, controlled or autonomous state, keyboard navigation
  and typeahead, and customizable variants and row sizing.

- [#32](https://github.com/joralvmel/cosmos-ui/pull/32) [`1c7b97d`](https://github.com/joralvmel/cosmos-ui/commit/1c7b97de1075f66dba3c26c31d3ce93ad4d59e95) Thanks [@joralvmel](https://github.com/joralvmel)! - Add the Popover component (`<cosm-popover>`) with its contract, React, Angular and React Native implementations.

- [#24](https://github.com/joralvmel/cosmos-ui/pull/24) [`dffa344`](https://github.com/joralvmel/cosmos-ui/commit/dffa344aac0d30018c3cdb19afc8e4dc822734a3) Thanks [@joralvmel](https://github.com/joralvmel)! - Add the Text Field component (`<cosm-text-field>`) with browser-native form behavior and React, Angular and React Native implementations.

  Require React DOM 19 as a peer of the React package to synchronize controlled value proposals
  without losing rapid keystrokes. Report iOS validation and manual screen-reader runs as optional
  and unverified by default; keep separately deferred IME coverage disclosed.

- [#32](https://github.com/joralvmel/cosmos-ui/pull/32) [`1c7b97d`](https://github.com/joralvmel/cosmos-ui/commit/1c7b97de1075f66dba3c26c31d3ce93ad4d59e95) Thanks [@joralvmel](https://github.com/joralvmel)! - Add optional Popover close buttons, accessible hover activation, configurable spacing and a decorative arrow, with IconButton-based examples; use an 8-unit default gap on every platform.

- [#24](https://github.com/joralvmel/cosmos-ui/pull/24) [`dffa344`](https://github.com/joralvmel/cosmos-ui/commit/dffa344aac0d30018c3cdb19afc8e4dc822734a3) Thanks [@joralvmel](https://github.com/joralvmel)! - Add independent optional normal and focus colors for text-field start/end icons, with configurable input-only or whole-control focus scope across platforms.

### Patch Changes

- Updated dependencies [[`9da9229`](https://github.com/joralvmel/cosmos-ui/commit/9da9229078d91c98fca01b5b68a2f5fb01275530), [`8f6a5c5`](https://github.com/joralvmel/cosmos-ui/commit/8f6a5c51af2605fd90c3c63a2530943cc075f949), [`1c7b97d`](https://github.com/joralvmel/cosmos-ui/commit/1c7b97de1075f66dba3c26c31d3ce93ad4d59e95), [`dffa344`](https://github.com/joralvmel/cosmos-ui/commit/dffa344aac0d30018c3cdb19afc8e4dc822734a3), [`dffa344`](https://github.com/joralvmel/cosmos-ui/commit/dffa344aac0d30018c3cdb19afc8e4dc822734a3), [`1c7b97d`](https://github.com/joralvmel/cosmos-ui/commit/1c7b97de1075f66dba3c26c31d3ce93ad4d59e95), [`6fe58cb`](https://github.com/joralvmel/cosmos-ui/commit/6fe58cb71fb1e4851230884c67de501f47dfe7a7), [`dffa344`](https://github.com/joralvmel/cosmos-ui/commit/dffa344aac0d30018c3cdb19afc8e4dc822734a3), [`dffa344`](https://github.com/joralvmel/cosmos-ui/commit/dffa344aac0d30018c3cdb19afc8e4dc822734a3)]:
  - @joralvmel/cosmos-core@0.3.0
  - @joralvmel/cosmos-elements@0.3.0

## 0.2.0

### Minor Changes

- [#15](https://github.com/joralvmel/cosmos-ui/pull/15) [`206945f`](https://github.com/joralvmel/cosmos-ui/commit/206945fcd14e121c3d41479719df88f2040c9aae) Thanks [@joralvmel](https://github.com/joralvmel)! - Add the Icon component with accessible semantics, customizable sizing and paints, and tree-shakeable Lucide definitions with searchable metadata. React Native snippets express Cosmos color tokens as `useTheme()` colors.

### Patch Changes

- Updated dependencies [[`206945f`](https://github.com/joralvmel/cosmos-ui/commit/206945fcd14e121c3d41479719df88f2040c9aae)]:
  - @joralvmel/cosmos-core@0.2.0
  - @joralvmel/cosmos-elements@0.2.0

## 0.1.0

### Minor Changes

- [`65cffa2`](https://github.com/joralvmel/cosmos-ui/commit/65cffa2c0969f8b620fd74d2abf55c6d1670fb62) Thanks [@joralvmel](https://github.com/joralvmel)! - Initial release: theme engine with the `cosmos` and `nebula` themes, Tailwind CSS v4 theme, component contracts and catalog, and the Button component on every platform (`cosm-button`, React `Button`, Angular `CosmButtonComponent`, React Native `Button`).

### Patch Changes

- [#1](https://github.com/joralvmel/cosmos-ui/pull/1) [`a674057`](https://github.com/joralvmel/cosmos-ui/commit/a67405767415809c7741226d2e615f322029149f) Thanks [@dependabot](https://github.com/apps/dependabot)! - Align development dependencies with React 19.3.1 while preserving React 19 consumer compatibility.
- Updated dependencies [[`65cffa2`](https://github.com/joralvmel/cosmos-ui/commit/65cffa2c0969f8b620fd74d2abf55c6d1670fb62)]:
  - @joralvmel/cosmos-core@0.1.0
  - @joralvmel/cosmos-elements@0.1.0
