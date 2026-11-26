import {
  type ContractProps,
  type DialogCloseReason,
  type DialogOpenChangeDetail,
  type DialogReferences,
  dialogContract,
} from '@joralvmel/cosmos-core';
import { arrowDown } from '@joralvmel/cosmos-icons/arrow-down';
import { arrowLeft } from '@joralvmel/cosmos-icons/arrow-left';
import { arrowRight } from '@joralvmel/cosmos-icons/arrow-right';
import { arrowUp } from '@joralvmel/cosmos-icons/arrow-up';
import { locateFixed } from '@joralvmel/cosmos-icons/locate-fixed';
import { move } from '@joralvmel/cosmos-icons/move';
import { x } from '@joralvmel/cosmos-icons/x';
import { css, html, LitElement, nothing } from 'lit';
import '../../components/icon/cosm-icon.js';
import '../../components/icon-button/cosm-icon-button.js';
import { CosmElement } from '../../internal/cosm-element.js';
import { define } from '../../internal/define.js';
import { boxSizing, focusRing } from '../../internal/styles.js';

type Props = ContractProps<typeof dialogContract, 'web', DialogReferences<HTMLElement | null>>;

const movementStep = 16;
const movementEpsilon = 1e-7;

/** Nearest center-relative grid point or exact boundary; ties choose the lower offset. */
function snapMovement(value: number, min: number, max: number): number {
  if (min >= max) return min;
  const clamped = Math.max(min, Math.min(max, value));
  const below = Math.floor(clamped / movementStep) * movementStep;
  const above = Math.ceil(clamped / movementStep) * movementStep;
  const candidates = [min, max, below, above].filter(point => point >= min && point <= max);
  return candidates.reduce((best, point) => {
    const distance = Math.abs(point - clamped);
    const bestDistance = Math.abs(best - clamped);
    return distance < bestDistance || (distance === bestDistance && point < best) ? point : best;
  });
}

function nextMovement(value: number, direction: -1 | 1): number {
  if (direction > 0)
    return (Math.floor((value + movementEpsilon) / movementStep) + 1) * movementStep;
  return (Math.ceil((value - movementEpsilon) / movementStep) - 1) * movementStep;
}

const styles = css`
  :host {
    color: var(--cosm-fg, oklch(0.24 0.01 268));
    font-family: var(--cosm-font-sans, system-ui, sans-serif);
  }
  dialog {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    max-width: none;
    max-height: none;
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    overflow: hidden;
    z-index: var(--cosm-dialog-z-index, 1000);
  }
  dialog:not([open]) { display: none; }
  dialog::backdrop { background: transparent; }
  .backdrop {
    position: absolute;
    inset: 0;
    background: var(--cosm-dialog-backdrop, var(--cosm-overlay, oklch(0 0 0 / 55%)));
  }
  .layout {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--cosm-space-lg, 1rem);
    pointer-events: none;
  }
  .base {
    pointer-events: auto;
    display: flex;
    flex-direction: column;
    width: max-content;
    max-width: min(100%, var(--_cosm-dialog-viewport-width, 100vw), var(--_cosm-dialog-max-width, 640px));
    max-height: min(100%, var(--_cosm-dialog-viewport-height, 100vh));
    min-height: 0;
    border: 1px solid var(--cosm-dialog-border, var(--cosm-border, oklch(0.88 0.01 268)));
    border-radius: var(--cosm-dialog-radius, var(--cosm-radius-lg, 0.75rem));
    background: var(--cosm-dialog-surface, var(--cosm-surface, oklch(1 0 0)));
    font-size: var(--cosm-text-md, 1rem);
    line-height: var(--cosm-leading-normal, 1.5);
    box-shadow: var(--cosm-dialog-shadow, var(--cosm-shadow-lg, 0 8px 24px oklch(0 0 0 / 16%)));
  }
  :host([full-width]) .base { width: min(100%, var(--_cosm-dialog-max-width, 640px)); }
  dialog[data-fullscreen] .layout { padding: 0; }
  dialog[data-fullscreen] .base {
    width: 100%;
    height: 100%;
    max-width: none;
    max-height: none;
    border: 0;
    border-radius: 0;
    box-shadow: none;
  }
  .header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--cosm-space-sm, 0.5rem);
    flex: none;
    padding: var(--cosm-dialog-padding, var(--cosm-space-xl, 1.5rem));
    padding-bottom: var(--cosm-space-sm, 0.5rem);
    border-top: var(--cosm-space-xs, 0.25rem) solid var(--cosm-primary, oklch(0.55 0.2 268));
    border-start-start-radius: inherit;
    border-start-end-radius: inherit;
  }
  .header[data-movable] { cursor: move; touch-action: none; user-select: none; }
  .title {
    flex: 1;
    min-width: 0;
    font-size: var(--cosm-text-xl, 1.25rem);
    font-weight: var(--cosm-weight-semibold, 600);
    line-height: var(--cosm-leading-tight, 1.25);
    overflow-wrap: anywhere;
  }
  .move-controls { display: flex; flex-basis: 100%; flex-wrap: wrap; align-items: center; gap: var(--cosm-space-xs, 0.25rem); }
  .move-controls[hidden] { display: none; }
  .description {
    padding-inline: var(--cosm-dialog-padding, var(--cosm-space-xl, 1.5rem));
    padding-bottom: var(--cosm-space-sm, 0.5rem);
    color: var(--cosm-fg-muted, oklch(0.47 0.018 268));
    font-size: var(--cosm-text-sm, 0.875rem);
  }
  .body {
    overflow: auto;
    min-height: 0;
    flex: 1 1 auto;
    padding: var(--cosm-dialog-padding, var(--cosm-space-xl, 1.5rem));
    padding-top: var(--cosm-space-lg, 1rem);
  }
  .actions {
    flex: none;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: var(--cosm-space-sm, 0.5rem);
    padding: var(--cosm-space-lg, 1rem) var(--cosm-dialog-padding, var(--cosm-space-xl, 1.5rem));
    border-top: 1px solid var(--cosm-border, oklch(0.88 0.01 268));
  }
  .description[hidden] { display: none; }
  @media (prefers-reduced-motion: reduce) { dialog { scroll-behavior: auto; } }
`;

/**
 * Modal dialog with consumer-composed content and cancelable close requests.
 * Slotted forms using method="dialog" propose an action close instead of bypassing ownership.
 * The internal native dialog is not a public handle; unexpected native closes are recovered
 * when its close event fires. Use requestClose() for a synchronously cancelable request.
 * @tag cosm-dialog
 * @slot title - Accessible title.
 * @slot description - Optional short description.
 * @slot - Scrollable body.
 * @slot actions - Consumer actions.
 * @csspart backdrop - Backdrop.
 * @csspart base - Dialog surface.
 * @csspart header - Title and close area.
 * @csspart title - Title container.
 * @csspart description - Description container.
 * @csspart body - Scrollable body.
 * @csspart actions - Actions container.
 * @csspart close - Close IconButton.
 * @csspart move-trigger - Button that reveals movement controls.
 * @csspart move-controls - Movement button group.
 * @csspart move-up - Move up button.
 * @csspart move-down - Move down button.
 * @csspart move-left - Move left button.
 * @csspart move-right - Move right button.
 * @csspart move-center - Center button.
 * @fires {CustomEvent<DialogOpenChangeDetail>} cosm-open-change - Visibility proposal.
 * @cssprop --cosm-dialog-z-index - Modal stacking level.
 * @cssprop --cosm-dialog-max-width - Maximum standard width.
 * @cssprop --cosm-dialog-backdrop - Backdrop color.
 * @cssprop --cosm-dialog-surface - Surface color.
 * @cssprop --cosm-dialog-border - Surface border color.
 * @cssprop --cosm-dialog-radius - Surface radius.
 * @cssprop --cosm-dialog-shadow - Surface shadow.
 * @cssprop --cosm-dialog-padding - Section spacing.
 */
export class CosmDialog extends CosmElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };
  static override properties = {
    open: { type: Boolean, reflect: true, noAccessor: true },
    defaultOpen: { type: Boolean, attribute: 'default-open' },
    presentation: { reflect: true },
    size: { reflect: true },
    maxWidth: { type: Number, attribute: 'max-width' },
    fullWidth: { type: Boolean, attribute: 'full-width', reflect: true },
    responsiveFullscreen: { type: Boolean, attribute: 'responsive-fullscreen' },
    movable: { type: Boolean },
    moveControlsLabel: { attribute: 'move-controls-label' },
    moveUpLabel: { attribute: 'move-up-label' },
    moveDownLabel: { attribute: 'move-down-label' },
    moveLeftLabel: { attribute: 'move-left-label' },
    moveRightLabel: { attribute: 'move-right-label' },
    moveCenterLabel: { attribute: 'move-center-label' },
    closeLabel: { attribute: 'close-label' },
    closeOnEscape: { type: Boolean, attribute: 'close-on-escape' },
    closeOnBackdropPress: { type: Boolean, attribute: 'close-on-backdrop-press' },
    initialFocusTarget: { attribute: false },
    returnFocusTarget: { attribute: false },
  };
  static override styles = [boxSizing, focusRing, styles];

  declare defaultOpen: boolean;
  declare presentation: NonNullable<Props['presentation']>;
  declare size: NonNullable<Props['size']>;
  declare maxWidth: number | undefined;
  declare fullWidth: boolean;
  declare responsiveFullscreen: boolean;
  declare movable: boolean;
  declare moveControlsLabel: string;
  declare moveUpLabel: string;
  declare moveDownLabel: string;
  declare moveLeftLabel: string;
  declare moveRightLabel: string;
  declare moveCenterLabel: string;
  declare closeLabel: string;
  declare closeOnEscape: boolean;
  declare closeOnBackdropPress: boolean;
  declare initialFocusTarget: HTMLElement | null | undefined;
  declare returnFocusTarget: HTMLElement | null | undefined;
  openControlled = false;
  #open = false;
  #initialized = false;
  #edited = false;
  #descriptionPresent = false;
  #returnTarget: HTMLElement | null = null;
  #lastFocused: HTMLElement | null = null;
  #fallbackInert = new Map<HTMLElement, boolean>();
  #position = { x: 0, y: 0 };
  #drag: { id: number; pointerX: number; pointerY: number; x: number; y: number } | undefined;
  #resizeObserver: ResizeObserver | undefined;
  #wasFullscreen = false;
  #movementExpanded = false;

  constructor() {
    super();
    const props = dialogContract.props;
    this.defaultOpen = props.defaultOpen.default;
    this.presentation = props.presentation.default;
    this.size = props.size.default;
    this.maxWidth = undefined;
    this.fullWidth = props.fullWidth.default;
    this.responsiveFullscreen = props.responsiveFullscreen.default;
    this.movable = props.movable.default;
    this.moveControlsLabel = props.moveControlsLabel.default;
    this.moveUpLabel = props.moveUpLabel.default;
    this.moveDownLabel = props.moveDownLabel.default;
    this.moveLeftLabel = props.moveLeftLabel.default;
    this.moveRightLabel = props.moveRightLabel.default;
    this.moveCenterLabel = props.moveCenterLabel.default;
    this.closeLabel = props.closeLabel.default;
    this.closeOnEscape = props.closeOnEscape.default;
    this.closeOnBackdropPress = props.closeOnBackdropPress.default;
    this.initialFocusTarget = undefined;
    this.returnFocusTarget = undefined;
  }

  get open(): boolean {
    return this.#open;
  }
  set open(value: boolean | undefined) {
    this.openControlled = value !== undefined;
    if (value !== undefined) this.#setOpen(Boolean(value));
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('submit', this.#onSubmit);
    this.ownerDocument.defaultView?.addEventListener('resize', this.#onViewportChange);
    this.ownerDocument.defaultView?.visualViewport?.addEventListener(
      'resize',
      this.#onViewportChange
    );
    this.ownerDocument.defaultView?.visualViewport?.addEventListener(
      'scroll',
      this.#onViewportChange
    );
    this.#syncViewportSize();
    if (this.open)
      void this.updateComplete.then(() => {
        if (this.isConnected && this.open) this.#show();
      });
  }

  override disconnectedCallback(): void {
    this.removeEventListener('submit', this.#onSubmit);
    this.ownerDocument.defaultView?.removeEventListener('resize', this.#onViewportChange);
    this.ownerDocument.defaultView?.visualViewport?.removeEventListener(
      'resize',
      this.#onViewportChange
    );
    this.ownerDocument.defaultView?.visualViewport?.removeEventListener(
      'scroll',
      this.#onViewportChange
    );
    this.#cancelDrag();
    this.#resizeObserver?.disconnect();
    this.#resizeObserver = undefined;
    this.#hide(false);
    super.disconnectedCallback();
  }

  protected override willUpdate(): void {
    if (this.size == null) this.size = dialogContract.props.size.default;
    if (this.fullWidth == null) this.fullWidth = dialogContract.props.fullWidth.default;
    if (this.responsiveFullscreen == null)
      this.responsiveFullscreen = dialogContract.props.responsiveFullscreen.default;
    if (this.movable == null) this.movable = dialogContract.props.movable.default;
    if (this.moveControlsLabel == null)
      this.moveControlsLabel = dialogContract.props.moveControlsLabel.default;
    if (this.moveUpLabel == null) this.moveUpLabel = dialogContract.props.moveUpLabel.default;
    if (this.moveDownLabel == null) this.moveDownLabel = dialogContract.props.moveDownLabel.default;
    if (this.moveLeftLabel == null) this.moveLeftLabel = dialogContract.props.moveLeftLabel.default;
    if (this.moveRightLabel == null)
      this.moveRightLabel = dialogContract.props.moveRightLabel.default;
    if (this.moveCenterLabel == null)
      this.moveCenterLabel = dialogContract.props.moveCenterLabel.default;
    if (this.maxWidth != null && (!Number.isFinite(this.maxWidth) || this.maxWidth <= 0))
      throw new RangeError('cosm-dialog maxWidth must be positive and finite.');
    if (!['sm', 'md', 'lg'].includes(this.size))
      throw new TypeError('cosm-dialog size must be sm, md or lg.');
    if (!this.closeLabel?.trim()) throw new Error('cosm-dialog requires a non-empty closeLabel.');
    if (!this.movable || this.#isFullscreen()) {
      this.#focusAwayFromMovementControls();
      this.#movementExpanded = false;
    }
    if (!this.#initialized) {
      this.#initialized = true;
      if (!this.openControlled && !this.#edited) this.#setOpen(this.defaultOpen);
    }
    const sizes = { sm: 400, md: 640, lg: 960 };
    const width =
      this.maxWidth == null
        ? `var(--cosm-dialog-max-width, ${sizes[this.size]}px)`
        : `${this.maxWidth}px`;
    this.style.setProperty('--_cosm-dialog-max-width', width);
  }

  protected override updated(changed: Map<PropertyKey, unknown>): void {
    const fullscreen = this.#isFullscreen();
    if ((fullscreen && !this.#wasFullscreen) || !this.movable) {
      this.#cancelDrag();
      this.#setPosition(0, 0);
    }
    this.#wasFullscreen = fullscreen;
    if (changed.has('open')) {
      if (this.open && this.isConnected) {
        this.#setPosition(0, 0);
        this.#show();
      } else if (!this.open) {
        this.#movementExpanded = false;
        this.#cancelDrag();
        this.#hide(true);
      }
    }
    const trigger = this.renderRoot.querySelector<HTMLElementTagNameMap['cosm-icon-button']>(
      'cosm-icon-button[part="move-trigger"]'
    );
    if (trigger) {
      void trigger.updateComplete.then(() => {
        trigger.shadowRoot
          ?.querySelector('button')
          ?.setAttribute('aria-expanded', String(this.#movementExpanded));
      });
    }
    const base = this.renderRoot.querySelector<HTMLElement>('[part="base"]');
    if (base && !this.#resizeObserver && typeof ResizeObserver !== 'undefined') {
      this.#resizeObserver = new ResizeObserver(() =>
        this.#setPosition(this.#position.x, this.#position.y)
      );
      this.#resizeObserver.observe(base);
    }
    if (this.open && this.movable && !fullscreen)
      this.#setPosition(this.#position.x, this.#position.y);
  }

  requestOpen(): void {
    if (!this.open) this.#propose(true, 'action');
  }
  requestClose(): void {
    if (this.open) this.#propose(false, 'action');
  }

  #setOpen(value: boolean): void {
    if (value === this.#open) return;
    const old = this.#open;
    if (value) {
      const active = this.ownerDocument.activeElement;
      this.#returnTarget = active instanceof HTMLElement ? active : null;
    }
    this.#open = value;
    this.requestUpdate('open', old);
  }

  #propose(open: boolean, reason: DialogCloseReason): void {
    if (open === this.open) return;
    this.#edited = true;
    let event: CustomEvent<DialogOpenChangeDetail>;
    if (open) {
      event = new CustomEvent('cosm-open-change', {
        detail: { open: true, reason: 'action' },
        bubbles: true,
        composed: true,
      });
    } else {
      const detail: DialogOpenChangeDetail = {
        open: false,
        reason,
        get defaultPrevented() {
          return event.defaultPrevented;
        },
        preventDefault() {
          event.preventDefault();
        },
      };
      event = new CustomEvent('cosm-open-change', {
        detail,
        bubbles: true,
        composed: true,
        cancelable: true,
      });
    }
    this.dispatchEvent(event);
    if (!event.defaultPrevented && !this.openControlled) this.#setOpen(open);
  }

  #show(recover = false): void {
    const dialog = this.renderRoot.querySelector('dialog');
    if (!dialog || dialog.open) return;
    const recoveryTarget = recover ? this.#lastFocused : null;
    const active = this.ownerDocument.activeElement;
    if (
      !recover &&
      (!this.#returnTarget || this.#returnTarget === this.ownerDocument.body) &&
      active instanceof HTMLElement &&
      active !== this
    ) {
      this.#returnTarget = active;
    }
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else {
      dialog.setAttribute('open', '');
      this.#setFallbackInert();
    }
    const target = recover ? recoveryTarget : this.initialFocusTarget;
    if (target && this.#containsComposed(target) && target.isConnected) target.focus();
    else {
      const close = this.renderRoot.querySelector('cosm-icon-button[part="close"]');
      const moves = this.renderRoot.querySelector('[part="move-controls"]');
      const moveTrigger = this.renderRoot.querySelector('[part="move-trigger"]');
      const first = this.#focusableElements().find(
        element =>
          (!close || !this.#inside(element, close)) &&
          (!moves || !this.#inside(element, moves)) &&
          (!moveTrigger || !this.#inside(element, moveTrigger))
      );
      (first ?? this.renderRoot.querySelector<HTMLElement>('[part="base"]'))?.focus();
    }
  }

  #hide(restore: boolean): void {
    const dialog = this.renderRoot.querySelector('dialog');
    const wasOpen = Boolean(dialog?.open);
    if (dialog?.open) {
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
    }
    for (const [element, inert] of this.#fallbackInert) element.inert = inert;
    this.#fallbackInert.clear();
    if (restore && wasOpen) {
      const target = [this.returnFocusTarget, this.#returnTarget].find(
        candidate => candidate?.isConnected && !candidate.matches(':disabled, [inert]')
      );
      if (target) target.focus();
      else this.ownerDocument.body.focus();
    }
  }

  #setFallbackInert(): void {
    for (let node: HTMLElement | null = this; node?.parentElement; node = node.parentElement) {
      for (const sibling of node.parentElement.children) {
        if (sibling !== node && sibling instanceof HTMLElement) {
          if (!this.#fallbackInert.has(sibling)) this.#fallbackInert.set(sibling, sibling.inert);
          sibling.inert = true;
        }
      }
    }
  }

  #inside(target: Node, ancestor: Node): boolean {
    let node: Node | null = target;
    while (node) {
      if (node === ancestor) return true;
      node = node.parentNode ?? (node instanceof ShadowRoot ? node.host : null);
    }
    return false;
  }

  #containsComposed(target: Node): boolean {
    return this.#inside(target, this);
  }

  #focusAwayFromMovementControls(): void {
    const controls = this.renderRoot.querySelector('[part="move-controls"]');
    const trigger = this.renderRoot.querySelector('[part="move-trigger"]');
    let active = this.ownerDocument.activeElement;
    while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
    if (
      !active ||
      (!(controls && this.#inside(active, controls)) && !(trigger && this.#inside(active, trigger)))
    )
      return;
    const close = this.renderRoot.querySelector('cosm-icon-button[part="close"]');
    const next = this.#focusableElements().find(
      element =>
        (!controls || !this.#inside(element, controls)) &&
        (!trigger || !this.#inside(element, trigger)) &&
        (!close || !this.#inside(element, close))
    );
    (next ?? this.renderRoot.querySelector<HTMLElement>('[part="base"]'))?.focus();
  }

  #isFullscreen(): boolean {
    return (
      this.presentation === 'fullscreen' ||
      (this.responsiveFullscreen && (this.ownerDocument.defaultView?.innerWidth ?? 1024) < 640)
    );
  }

  #syncViewportSize(): void {
    const view = this.ownerDocument.defaultView;
    const viewport = view?.visualViewport;
    if (view) {
      this.style.setProperty(
        '--_cosm-dialog-viewport-width',
        `${viewport?.width ?? view.innerWidth}px`
      );
      this.style.setProperty(
        '--_cosm-dialog-viewport-height',
        `${viewport?.height ?? view.innerHeight}px`
      );
    }
  }

  #onViewportChange = (): void => {
    this.#syncViewportSize();
    this.requestUpdate();
  };

  #setPosition(x: number, y: number): void {
    const base = this.renderRoot.querySelector<HTMLElement>('[part="base"]');
    if (!this.movable || this.#isFullscreen()) {
      this.#position = { x: 0, y: 0 };
    } else if (base) {
      const view = this.ownerDocument.defaultView;
      const viewport = view?.visualViewport;
      const rect = base.getBoundingClientRect();
      const left = viewport?.offsetLeft ?? 0;
      const top = viewport?.offsetTop ?? 0;
      const right = left + (viewport?.width ?? view?.innerWidth ?? 0);
      const bottom = top + (viewport?.height ?? view?.innerHeight ?? 0);
      const minX = left - (rect.left - this.#position.x);
      const maxX = right - (rect.right - this.#position.x);
      const minY = top - (rect.top - this.#position.y);
      const maxY = bottom - (rect.bottom - this.#position.y);
      const clamp = (value: number, min: number, max: number) =>
        min <= max ? Math.max(min, Math.min(max, value)) : min;
      this.#position = this.#drag
        ? { x: clamp(x, minX, maxX), y: clamp(y, minY, maxY) }
        : { x: snapMovement(x, minX, maxX), y: snapMovement(y, minY, maxY) };
    } else this.#position = { x, y };
    if (base) base.style.transform = `translate(${this.#position.x}px, ${this.#position.y}px)`;
  }

  #move(direction: 'up' | 'down' | 'left' | 'right' | 'center'): void {
    if (!this.open || !this.movable || this.#isFullscreen()) return;
    const { x, y } = this.#position;
    if (direction === 'center') this.#setPosition(0, 0);
    if (direction === 'up') this.#setPosition(x, nextMovement(y, -1));
    if (direction === 'down') this.#setPosition(x, nextMovement(y, 1));
    if (direction === 'left') this.#setPosition(nextMovement(x, -1), y);
    if (direction === 'right') this.#setPosition(nextMovement(x, 1), y);
  }

  #cancelDrag(): void {
    const drag = this.#drag;
    this.#drag = undefined;
    if (drag) {
      const header = this.renderRoot.querySelector<HTMLElement>('[part="header"]');
      if (header?.hasPointerCapture?.(drag.id)) header.releasePointerCapture(drag.id);
      this.#setPosition(drag.x, drag.y);
    }
  }

  #onPointerDown = (event: PointerEvent): void => {
    if (
      !this.open ||
      !this.movable ||
      this.#isFullscreen() ||
      !event.isPrimary ||
      event.button !== 0
    )
      return;
    const path = event.composedPath();
    const headerIndex = path.indexOf(event.currentTarget as EventTarget);
    const interactive = path
      .slice(0, headerIndex < 0 ? path.length : headerIndex)
      .some(
        node =>
          node instanceof Element &&
          node.matches(
            'button, a[href], input, select, textarea, [role="button"], [tabindex], [contenteditable], cosm-icon-button'
          )
      );
    if (interactive) return;
    const header = event.currentTarget as HTMLElement;
    this.#drag = {
      id: event.pointerId,
      pointerX: event.clientX,
      pointerY: event.clientY,
      ...this.#position,
    };
    header.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  };

  #onPointerMove = (event: PointerEvent): void => {
    const drag = this.#drag;
    if (!drag || drag.id !== event.pointerId) return;
    this.#setPosition(
      drag.x + event.clientX - drag.pointerX,
      drag.y + event.clientY - drag.pointerY
    );
  };

  #onPointerUp = (event: PointerEvent): void => {
    if (this.#drag?.id !== event.pointerId) return;
    this.#drag = undefined;
    this.#setPosition(this.#position.x, this.#position.y);
    const header = event.currentTarget as HTMLElement;
    if (header.hasPointerCapture?.(event.pointerId)) header.releasePointerCapture(event.pointerId);
  };

  #onPointerCancel = (event: PointerEvent): void => {
    if (this.#drag?.id === event.pointerId) this.#cancelDrag();
  };

  #focusableElements(): HTMLElement[] {
    const result: HTMLElement[] = [];
    const selector =
      'button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';
    const visit = (element: Element): void => {
      if (element.matches('[hidden], [inert], [aria-hidden="true"]')) return;
      if (element instanceof HTMLElement) {
        const style = this.ownerDocument.defaultView?.getComputedStyle(element);
        if (style?.display === 'none' || style?.visibility === 'hidden') return;
        if (element.matches(selector) && element.tabIndex >= 0) result.push(element);
      }
      if (element instanceof HTMLSlotElement) {
        for (const assigned of element.assignedElements({ flatten: true })) visit(assigned);
      } else {
        const root = element.shadowRoot ?? element;
        for (const child of root.children) visit(child);
      }
    };
    const dialog = this.renderRoot.querySelector('dialog');
    if (dialog) visit(dialog);
    return result;
  }

  #onKeydown = (event: KeyboardEvent): void => {
    if (event.defaultPrevented) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      if (this.#drag) this.#cancelDrag();
      else if (this.#movementExpanded) {
        this.#movementExpanded = false;
        this.renderRoot.querySelector<HTMLElement>('[part="move-trigger"]')?.focus();
        this.requestUpdate();
      } else if (this.closeOnEscape) this.#propose(false, 'escape');
    } else if (event.key === 'Tab') {
      const candidates = this.#focusableElements();
      if (!candidates.length) {
        event.preventDefault();
        this.renderRoot.querySelector<HTMLElement>('[part="base"]')?.focus();
        return;
      }
      let active = this.ownerDocument.activeElement;
      while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
      const index = candidates.findIndex(
        candidate => candidate === active || candidate.contains(active)
      );
      if (
        (!event.shiftKey && (index === candidates.length - 1 || index < 0)) ||
        (event.shiftKey && index <= 0)
      ) {
        event.preventDefault();
        (event.shiftKey ? candidates[candidates.length - 1] : candidates[0])?.focus();
      }
    }
  };

  #onCancel = (event: Event): void => {
    event.preventDefault();
    if (this.closeOnEscape) this.#propose(false, 'escape');
  };

  #onSubmit = (event: Event): void => {
    if (event.defaultPrevented || !this.open || !(event.target instanceof HTMLFormElement)) return;
    const form = event.target;
    // A consumer-owned nested native dialog owns its own dialog-method submission.
    if (form.closest('dialog')) return;
    const submitter = event instanceof SubmitEvent ? event.submitter : null;
    const override = submitter?.getAttribute('formmethod');
    const method = override === null || override === undefined ? form.method : override;
    if (method.trim().toLowerCase() !== 'dialog') return;
    event.preventDefault();
    this.#propose(false, 'action');
  };

  #onFocusIn = (event: FocusEvent): void => {
    const focused = event.composedPath().find(node => node instanceof HTMLElement);
    if (focused instanceof HTMLElement && this.#containsComposed(focused))
      this.#lastFocused = focused;
  };

  #onNativeClose = (): void => {
    const dialog = this.renderRoot.querySelector('dialog');
    if (this.isConnected && this.open && dialog && !dialog.open) this.#show(true);
  };

  #onDescriptionChange = (event: Event): void => {
    const slot = event.currentTarget as HTMLSlotElement;
    const present = slot
      .assignedNodes({ flatten: true })
      .some(node => node.nodeType === Node.ELEMENT_NODE || Boolean(node.textContent?.trim()));
    if (present !== this.#descriptionPresent) {
      this.#descriptionPresent = present;
      this.requestUpdate();
    }
  };

  protected override render() {
    const movable = this.movable && !this.#isFullscreen();
    const controls = [
      { direction: 'up', label: this.moveUpLabel, fallback: 'Move up', icon: arrowUp },
      { direction: 'down', label: this.moveDownLabel, fallback: 'Move down', icon: arrowDown },
      { direction: 'left', label: this.moveLeftLabel, fallback: 'Move left', icon: arrowLeft },
      { direction: 'right', label: this.moveRightLabel, fallback: 'Move right', icon: arrowRight },
      {
        direction: 'center',
        label: this.moveCenterLabel,
        fallback: 'Center dialog',
        icon: locateFixed,
      },
    ] as const;
    return html`
      <dialog aria-labelledby="dialog-title" aria-describedby=${this.#descriptionPresent ? 'dialog-description' : nothing}
        aria-modal="true" ?data-fullscreen=${this.#isFullscreen()} @cancel=${this.#onCancel} @close=${this.#onNativeClose}
        @focusin=${this.#onFocusIn} @keydown=${this.#onKeydown}>
        <div part="backdrop" class="backdrop" @click=${() => {
          if (this.closeOnBackdropPress) this.#propose(false, 'backdrop');
        }}></div>
        <div class="layout">
          <div part="base" class="base" tabindex="-1">
            <div part="header" class="header" ?data-movable=${movable}
              @pointerdown=${this.#onPointerDown} @pointermove=${this.#onPointerMove}
              @pointerup=${this.#onPointerUp} @pointercancel=${this.#onPointerCancel}
              @lostpointercapture=${this.#onPointerCancel}>
              <div part="title" class="title" id="dialog-title"><slot name="title"></slot></div>
              ${
                movable
                  ? html`<cosm-icon-button part="move-trigger" .label=${this.moveControlsLabel?.trim() || 'Move dialog'}
                variant="ghost" tone="neutral" @cosm-press=${() => {
                  this.#movementExpanded = !this.#movementExpanded;
                  this.requestUpdate();
                }}>
                <cosm-icon .icon=${move} .decorative=${true}></cosm-icon>
              </cosm-icon-button>`
                  : nothing
              }
              <cosm-icon-button part="close" .label=${this.closeLabel} variant="ghost" tone="neutral"
                @cosm-press=${() => this.#propose(false, 'close-button')}>
                <cosm-icon .icon=${x} .decorative=${true}></cosm-icon>
              </cosm-icon-button>
              ${
                movable
                  ? html`<div part="move-controls" class="move-controls" role="group" ?hidden=${!this.#movementExpanded} aria-label=${this.moveControlsLabel?.trim() || 'Move dialog'}>
                ${controls.map(
                  control => html`<cosm-icon-button part=${`move-${control.direction}`}
                  .label=${control.label?.trim() || control.fallback} variant="ghost" tone="neutral"
                  @cosm-press=${() => this.#move(control.direction)}>
                    <cosm-icon .icon=${control.icon} .decorative=${true}></cosm-icon>
                  </cosm-icon-button>`
                )}
              </div>`
                  : nothing
              }
            </div>
            <div part="description" class="description" id="dialog-description" ?hidden=${!this.#descriptionPresent}><slot name="description" @slotchange=${this.#onDescriptionChange}></slot></div>
            <div part="body" class="body"><slot></slot></div>
            <div part="actions" class="actions"><slot name="actions"></slot></div>
          </div>
        </div>
      </dialog>`;
  }
}

define('cosm-dialog', CosmDialog);

declare global {
  interface HTMLElementTagNameMap {
    'cosm-dialog': CosmDialog;
  }
}
