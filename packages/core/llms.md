# @joralvmel/cosmos-core

Contracts: import { contracts, buttonContract, propNames, eventNames, defaults } from '@joralvmel/cosmos-core'.
Each contract: name, tag (cosm-*), role, pattern (APG URL), props {type, default, values, platforms}, events {names: {dom, react, angular, native}, detail},
states, slots, parts, cssProperties, keyboard.
Event mapping: DOM cosm-press → React onPress(event) → Angular (press)="…$event.detail" → React Native onPress(detail).
