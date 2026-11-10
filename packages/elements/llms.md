# @joralvmel/cosmos-elements

Web Components (Lit). Import per component: import '@joralvmel/cosmos-elements/button'.
<cosm-button variant="solid|soft|outline|ghost" tone="primary|neutral|danger" size="sm|md|lg" disabled loading full-width type="button|submit|reset" label="accessible name">
Slots: default (label), start, end. Parts: base, label, spinner. CSS props: --cosm-button-radius, --cosm-button-gap, --cosm-button-font-weight.
Event: cosm-press (CustomEvent<{ source: 'pointer'|'keyboard'|'programmatic' }>, bubbles, composed). Loading keeps focus, sets aria-busy and ignores presses.
