# Text field design

## Purpose and status

Text field is an accessible, single-line text-entry control for web and React Native. This is the
accepted design record for the first implementation stage. Implementations and demos are present
on all four platforms. The component remains **in progress** because the required runtime evidence
is not complete; see the verification matrix below.

## Accepted scope

- Implement for Lit web, React, Angular and React Native on one core contract.
- Support only `text`, `email`, `password`, `tel`, `url` and `search`; this is not a number field,
  date field, multiline control or textarea.
- Use an outlined variant by default and also support filled.
- Support `sm`, `md` (default), `lg`, and a positive finite custom minimum editable-control height.
  Custom heights are CSS pixels on web and logical units on native. Label and help/error text are
  outside that height. Icons and text scale independently; the control grows with font scaling.
  Native touch targets remain at least 44 logical units, even if a smaller custom height is asked
  for.
- Use a required text label above the control, with an opt-in visually hidden label. Show help and
  error text below the control.
- Support plain-text prefix/suffix and structured `IconDefinition` start/end decorations. Icons
  are supplied by the consumer; there is no global name registry.
- Support opt-in clear and password-reveal actions. The consumer supplies localized action labels.
  Both actions are unavailable for disabled or read-only fields.
- Expose independent theme hooks for background, text, placeholder, border, focus and radius. Do not
  add public tone or color props. Keep web parts and native style/theme customization.
- Support light/dark themes, RTL layout and text scaling.

### Explicit exclusions

No masks, autocomplete suggestions, async validation, rich or interactive slots, multiline editing,
numeric/date behavior, public color/tone props, spinner, new dependency or copied library code.
`icon-button` is planned, not stable; clear/reveal controls use accessible local native button
primitives until that dependency is ready. `IconDefinition` remains the structured icon contract
described by ADR 0005; no global icon registry or catalog is introduced.

## Public API

| Prop | Type / default | Contract and platform behavior |
| --- | --- | --- |
| `label` | required `string` | Accessible name, rendered above the control. |
| `labelHidden` | `boolean`, `false` | Visually hides the label without removing its accessible name. |
| `value` | `string`, controlled state when bound | Current text. Bound means controlled, including `''`; changes are proposals until the owner updates the prop. |
| `defaultValue` | `string`, `''` | Initial autonomous value. Web form reset returns to this value. |
| `type` | `text \| email \| password \| tel \| url \| search`, `text` | Web uses the corresponding input type; native maps to keyboard, autofill and secure-entry behavior supported by the platform. |
| `variant` | `outlined \| filled`, `outlined` | Visual treatment only. |
| `size` | `sm \| md \| lg \| number`, `md` | Semantic sizes or a positive finite minimum editable-control height. |
| `placeholder` | `string` | Hint only; never a replacement for the label. |
| `helpText` | `string` | Optional supporting text below the control. |
| `error` | `string` | Optional externally supplied error text below the control. |
| `invalid` | `boolean`, `false` | External invalid state, independent of browser constraints. |
| `required` | `boolean`, `false` | Exposes required semantics; web also participates in native HTML constraint validation. |
| `disabled` | `boolean`, `false` | Disables editing and interaction; web follows fieldset disabledness and excludes the value from form submission. |
| `readOnly` | `boolean`, `false` | Prevents editing but remains focusable and form-submittable on web. |
| `minLength`, `maxLength` | `number` | Web uses native length constraints; native applies supported input limits and leaves unsupported validation to the consumer. |
| `pattern` | `string` | Web-only HTML constraint. Native does not emulate HTML regular-expression validation. |
| `name` | `string` | Web form field name; native has no HTML form submission. |
| `autoComplete` | `string` | Consumer-provided completion/autofill hint, mapped to platform-supported attributes. |
| `inputMode` | `none \| text \| decimal \| numeric \| tel \| search \| email \| url` | Input/keyboard hint, not a change to the supported text-field types. |
| `startIcon`, `endIcon` | `IconDefinition` | Optional structured decorative icons on either side of the editable text. |
| `prefix`, `suffix` | `string` | Optional non-interactive text decorations at the start/end of the editable text. |
| `clearable` | `boolean`, `false` | Opts into a clear action when there is text and the field is editable. |
| `clearLabel` | `string` | Required by consumers when `clearable` is enabled; localized accessible name for the clear action. |
| `passwordReveal` | `boolean`, `false` | Opts into a reveal action for `type="password"`; starts concealed and does not change `value`. |
| `revealPasswordLabel`, `hidePasswordLabel` | `string` | Required by consumers when `passwordReveal` is enabled; localized names for both toggle states. |

`label`, `value`, `defaultValue`, text decorations, visual props, input hints, and supported state
props are shared by all four platforms unless a row explicitly identifies a web-only behavior.
Native platform behavior is not presented as HTML form validation.

## State and event mapping

| State / request | DOM event | React | Angular | Native | Semantics |
| --- | --- | --- | --- | --- | --- |
| `value` proposal | `cosm-change` | `onChange` | `valueChange` | `onValueChange` | Proposes the text after each user edit, including clear. This is input/change-as-you-type, not a blur/commit event. Detail is `{ value: string }`. |
| Submit action | `cosm-submit` | `onSubmit` | `submit` | `onSubmitEditing` | Enter/return action from the field. Web still participates in its containing HTML form; native receives an explicit callback and has no HTML form behavior. |

`value` follows ADR 0003: if unbound, the component owns and commits edits; if bound, it emits a
proposal and waits for the owner to supply the accepted value. Rejected proposals restore the
controlled value without losing the selection/cursor or interrupting an active IME composition.
Empty string is a valid bound value. `defaultValue` initializes autonomous state and is not a second
controlled value.

Clearing proposes `''` and retains focus. A controlled clear that is refused restores the current
value. Password reveal is internal presentation state: it starts concealed and never proposes or
changes the value. Disabled and read-only states suppress editing, clear and reveal actions.

## Forms and validation

- Lit web uses a form-associated custom element, submits `name`/`value`, honors disabled fieldsets,
  participates in reset and state restoration, and exposes native validity/reporting APIs.
- Autonomous web reset restores `defaultValue`; controlled reset proposes that value and waits for
  the owner. Native form validity supplies browser-localized messages for `required`, input `type`,
  `pattern` and length constraints after blur or form submission. An explicit `invalid`/`error`
  remains consumer-owned and is not replaced by a business-rule validator.
- Angular's wrapper implements `ControlValueAccessor`: touched on blur, reset, disabled state and
  `updateOn: 'blur'` are wrapper integration behavior; value ownership remains defined by the
  contract.
- Native has no HTML form association or browser-localized HTML validation. It maps secure entry,
  keyboard and autofill hints to React Native capabilities; unsupported HTML constraints such as
  `pattern` and email validity are not simulated. Consumers own native business validation and
  submission through `onSubmitEditing`.
- The visible label is associated with the editable control. Help/error content is associated as
  descriptive text; invalid and required states are exposed accessibly. Error text is not inferred
  from arbitrary business rules.

## Visual anatomy and customization

Anatomy: label; control with optional start icon/prefix, editable input, suffix/end icon and optional
clear/reveal action; then help or error text. Help and error are simple text props, not slots.

The control's `input` part identifies the editable input; `label`, `control`, `start`, `end`, `help`,
`error`, `clear-button` and `reveal-button` identify the corresponding web parts. Native exposes
component styles/theme values for the same visual roles.

| Hook | Role |
| --- | --- |
| `--cosm-text-field-background` | Control background |
| `--cosm-text-field-color` | Editable and decoration text |
| `--cosm-text-field-placeholder` | Placeholder text |
| `--cosm-text-field-border` | Control boundary |
| `--cosm-text-field-focus` | Visible focus indicator |
| `--cosm-text-field-radius` | Control corner radius |

Use semantic tokens only, with visible focus and sufficient boundary/text contrast in light and dark
themes. RTL reverses logical start/end placement. Font scaling may increase control height; the
custom height is a minimum, not a clipping constraint.

The review revision uses a single contiguous focus boundary: the themed border is reinforced
inward, without a second offset outline. Action hover changes icon color, not the rectangular
button background; keyboard focus on actions remains visible. The docs playground groups advanced
options in a collapsed disclosure, uses checkboxes for booleans and selects for enumerations, and
loads only four sample icon definitions. Numeric keyboard hints do not add a number-field type or
filter text. React DOM 19 is an explicit peer of the React adapter to synchronously forward
value-proposal handlers with `flushSync`; state and rollback behavior remain owned by Lit.

The final hardening revision resets revealed passwords when editing/reveal is disabled or the
type changes, including inherited web fieldset disabledness. Windows forced-colors focus uses
an inward system-highlight outline instead of a shadow. Custom search clearing replaces the
browser clear affordance only when enabled. Long labels/messages wrap; prefix/suffix regions
share the available space and truncate visually without modifying their text or the input value.
Native prefix/suffix text also uses single-line tail truncation and shrinkable bounded width.
No new public properties, number/date types, counters or icon catalogs are introduced.

## Shared acceptance scenarios

1. A required accessible label is associated with the input; `labelHidden` only changes visual
   presentation. Help and external error text are associated with the input.
2. Autonomous input updates its owned value and emits one `{ value }` proposal per user edit;
   `defaultValue: ''` remains a valid empty initial value.
3. Controlled input emits proposals but does not commit them until the owner supplies the accepted
   prop. A refused edit restores the controlled text and preserves selection and IME composition.
4. A controlled `value=""` remains controlled. Refusing a clear proposal restores the text; an
   accepted clear proposes and displays `''` while retaining focus.
5. Disabled and read-only fields do not accept edits or activate clear/reveal actions; read-only
   remains distinct from disabled.
6. Each supported type maps to its web input type; password reveal is opt-in, initially concealed,
   toggles presentation only, and uses the supplied localized action labels.
7. Required/type/pattern/length constraints use browser-native validity and messages on web; native
   does not claim HTML regex/email validation. Explicit invalid/error state remains externally
   controlled.
8. Web form submission/reset/fieldset disabledness and form-state restoration follow FACE. Angular
   CVA covers touched, reset, disabled and blur update strategy. Native exposes explicit submit
   callback behavior and no HTML form association.
9. Semantic/numeric sizes, variants, decorations, theme hooks, light/dark, RTL, font scaling and the
   native 44-unit minimum touch target remain independent of text content.

## Evidence and implementation handoff

Research sources informed this design; no source code or assets are copied and no library dependency
is added:

- [HTML input](https://html.spec.whatwg.org/multipage/input.html) and
  [form-associated custom elements](https://html.spec.whatwg.org/multipage/custom-elements.html#form-associated-custom-elements)
  (platform standards).
- WAI form [labels](https://www.w3.org/WAI/tutorials/forms/labels/) and
  [notifications](https://www.w3.org/WAI/tutorials/forms/notifications/).
- React Aria TextField (Apache-2.0), Web Awesome input (MIT), and React Native TextInput (MIT) as
  public behavior comparisons, not implementation sources.

Required evidence is shared/unit and contract-drift tests; real browser form and editing behavior;
React and Angular browser integration; React Native mocked tests and React Native Web browser checks;
and separate Android/iOS device or simulator checks. Mocks, typechecks and native exports do not
prove native device interaction. If any required device check is unavailable, status remains
in-progress. Documentation in English/Spanish, representative demos, AI references and the
changeset accompany the implementation.

### Verification matrix

| Area | Evidence and limitations |
| --- | --- |
| Shared contract | Core behavior, deterministic shared scenarios and platform contract-drift tests. |
| Web browser | Real keyboard/form submission, required/email native validation and localized messages, label focus, reset, read-only submission and disabled-fieldset exclusion verified in Chromium. A numeric minimum of 80 CSS pixels produced an 82-pixel outer control including borders. |
| Angular browser | Actual `FormControl` with `updateOn: 'blur'`: input remains a view draft until blur, then updates value/touched; reset and disabled propagation verified. |
| React browser | Actual keyboard typing of `123456789` is accepted without dropped characters using an ordinary consumer `setState` handler. Rejected edits/clear, controlled empty string, original `CustomEvent` forwarding and accepted clear retaining input focus verified in Chromium. |
| Docs/browser review | Boolean checkboxes, type/keyboard/size selects, custom height and optional icons exercised. Each icon select has four samples plus None; no icon catalog module is fetched. Advanced options start collapsed. Focus uses a same-color inset boundary, including filled/invalid fields; clear hover remains transparent. All eight Cosmos/Nebula light/dark outlined/filled combinations have boundary contrast at least 3.07:1 and text at least 15.07:1. Mobile-width layout and logical RTL verified at a 390-pixel viewport. |
| Final hardening browser checks | Chromium: actual reveal/read-only/re-enable controls restore concealed password state. Forced-colors emulation produces a 2-pixel inward solid outline with no box shadow. A focused search preview visually shows one custom clear action. At a 260-pixel container, long label/help/error and both long affixes leave the control within its bounds and a 53-pixel editable input; affixes truncate with ellipsis. WebKit-specific rendering and native-device long-affix layout remain unverified. |
| Native tests | Mocked React Native behavior and shared scenarios, plus a real React Native Web renderer regression for required/read-only DOM semantics. |
| Native web browser | Accepted/rejected edits and clear, focus retention, password reveal, read-only action suppression and an 80-unit control verified through real browser interactions. |
| Android runtime | Expo Go on the Pixel 9 API 35 emulator: keyboard editing, controlled acceptance/rejection, accepted/rejected clear, password conceal/reveal and disabled/read-only states exercised. Exact outer numeric height was not measured on Android. |
| Native exports | Android and iOS production JavaScript exports succeeded. These are not native binary builds or iOS runtime tests. |
| Outstanding device evidence | iOS simulator/device, VoiceOver/TalkBack, real keyboard IME composition and device text-scaling behavior remain unverified. Synthetic composition tests and exports do not replace these checks. |

No unavailable check has been deferred by the user. Keep the catalog readiness override
`in-progress`; structural completeness does not authorize promotion to stable.

Final repository validation: Biome CI and all 49 Turborepo typecheck/test/build tasks passed.
Terminology and generated AI-reference freshness checks also passed. The docs build reports the
existing empty `i18n` collection warning; no docs typecheck errors or warnings were reported.

### Handoff to design-system

Use the anatomy and six independent hooks above. Verify contrast, visible focus, outlined/filled
states, light/dark, RTL, responsive width and font scaling; do not introduce public tone/color props.

### Handoff to component-builder

Implement the Lit element as the web behavior owner and keep React/Angular as forwarding adapters.
Use local accessible button primitives for clear/reveal until `icon-button` is stable. Preserve FACE,
controlled proposal/restore, cursor and IME behavior, and browser-native constraint messages.
Native uses React Native input semantics, 44-unit targets and an explicit submit callback; do not
simulate HTML regex/email validation or HTML forms.
