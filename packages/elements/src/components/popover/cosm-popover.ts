import {
  type ContractProps,
  type PopoverCloseReason,
  type PopoverOpenChangeDetail,
  popoverContract,
} from '@joralvmel/cosmos-core';
import { css, html, LitElement } from 'lit';
import { CosmElement } from '../../internal/cosm-element.js';
import { define } from '../../internal/define.js';
import { boxSizing, focusRing } from '../../internal/styles.js';

type Props = Required<ContractProps<typeof popoverContract, 'web'>>;
export type PopoverSide = Props['side'];
export type PopoverAlign = Props['align'];

const styles = css`
  :host {
    display: inline-block;
    color: var(--cosm-fg, oklch(0.24 0.01 268));
    font-family: var(--cosm-font-sans, system-ui, sans-serif);
  }
  .trigger {
    display: inline-flex;
  }
  .panel {
    position: fixed;
    inset: auto;
    margin: 0;
    z-index: var(--cosm-popover-z-index, 1000);
    width: max-content;
    padding: var(--cosm-popover-padding, var(--cosm-space-lg, 1rem));
    border: 1px solid var(--cosm-border-strong, oklch(0.64 0.01 268));
    border-radius: var(--cosm-popover-radius, var(--cosm-radius-md, 0.5rem));
    background: var(--cosm-bg, oklch(0.985 0.007 268));
    color: var(--cosm-fg, oklch(0.24 0.01 268));
    box-shadow: var(--cosm-popover-shadow, var(--cosm-shadow-lg, 0 8px 24px oklch(0 0 0 / 16%)));
    overflow: auto;
  }
  .panel[hidden] {
    display: none;
  }
  .safe-area-probe {
    position: fixed;
    visibility: hidden;
    pointer-events: none;
    padding:
      env(safe-area-inset-top, 0px)
      env(safe-area-inset-right, 0px)
      env(safe-area-inset-bottom, 0px)
      env(safe-area-inset-left, 0px);
  }
`;

type Bounds = { left: number; top: number; right: number; bottom: number };

/**
 * Non-modal content anchored to a consumer-provided trigger. Trigger naming, trigger
 * appearance and panel semantics are supplied by the consumer.
 *
 * @tag cosm-popover
 * @slot trigger - Consumer-supplied keyboard-operable trigger.
 * @slot - Consumer-supplied panel content and semantics.
 * @csspart trigger - Container for the trigger slot.
 * @csspart panel - Non-modal anchored surface.
 * @fires {CustomEvent<PopoverOpenChangeDetail>} cosm-open-change - Proposes a visibility change.
 * @cssprop --cosm-popover-z-index - Stacking level of the panel.
 * @cssprop --cosm-popover-padding - Panel padding.
 * @cssprop --cosm-popover-radius - Panel corner radius.
 * @cssprop --cosm-popover-shadow - Panel shadow.
 * @remarks Uses the native manual Popover API to escape clipping and transformed ancestors when
 * available. Without that API, it falls back to fixed positioning, which can still be clipped or
 * displaced by ancestor overflow, transforms or containment.
 */
export class CosmPopover extends CosmElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override properties = {
    open: { type: Boolean, reflect: true },
    defaultOpen: { type: Boolean, attribute: 'default-open' },
    closeOnEscape: { type: Boolean, attribute: 'close-on-escape' },
    closeOnOutsidePress: { type: Boolean, attribute: 'close-on-outside-press' },
    initialFocus: { type: Boolean, attribute: 'initial-focus' },
    restoreFocus: { type: Boolean, attribute: 'restore-focus' },
    side: { reflect: true },
    align: { reflect: true },
    flip: { type: Boolean },
    shift: { type: Boolean },
  };

  static override styles = [boxSizing, focusRing, styles];

  declare defaultOpen: Props['defaultOpen'];
  declare closeOnEscape: Props['closeOnEscape'];
  declare closeOnOutsidePress: Props['closeOnOutsidePress'];
  declare initialFocus: Props['initialFocus'];
  declare restoreFocus: Props['restoreFocus'];
  declare side: PopoverSide;
  declare align: PopoverAlign;
  declare flip: Props['flip'];
  declare shift: Props['shift'];

  /** Set by adapters to distinguish a bound `open` value from autonomous state. */
  openControlled = false;

  #open = false;
  #writingOpen = false;
  #initialized = false;
  #edited = false;
  #pendingRestoreReason: PopoverCloseReason | undefined;
  #focusWasInsideBeforeClose = false;
  #openListenersInstalled = false;
  #inTopLayer = false;
  #resizeObserver: ResizeObserver | undefined;
  #triggerAttributes = new Map<Element, string | null>();

  get open(): boolean {
    return this.#open;
  }

  set open(value: boolean | undefined) {
    if (value === undefined) {
      this.openControlled = false;
      return;
    }
    if (!this.#writingOpen) this.openControlled = true;
    this.#setOpen(Boolean(value));
  }

  constructor() {
    super();
    const props = popoverContract.props;
    this.defaultOpen = props.defaultOpen.default;
    this.closeOnEscape = props.closeOnEscape.default;
    this.closeOnOutsidePress = props.closeOnOutsidePress.default;
    this.initialFocus = props.initialFocus.default;
    this.restoreFocus = props.restoreFocus.default;
    this.side = props.side.default;
    this.align = props.align.default;
    this.flip = props.flip.default;
    this.shift = props.shift.default;
    this.#setOpen(props.open.default);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('click', this.#onHostClick);
    this.#syncTriggerExpanded();
    if (this.open) {
      void this.updateComplete.then(() => {
        if (this.isConnected && this.open) {
          this.#showPanelInTopLayer();
          this.#installOpenListeners();
          this.#positionPanel();
        }
      });
    }
  }

  override disconnectedCallback(): void {
    this.removeEventListener('click', this.#onHostClick);
    this.#hidePanelFromTopLayer();
    this.#removeOpenListeners();
    this.#restoreTriggerAttributes();
    super.disconnectedCallback();
  }

  protected override willUpdate(): void {
    if (!this.#initialized) {
      this.#initialized = true;
      if (!this.openControlled && !this.#edited) this.#setOpen(this.defaultOpen);
    }
  }

  protected override updated(changed: Map<PropertyKey, unknown>): void {
    if (changed.has('open')) {
      this.#syncTriggerExpanded();
      if (this.open) {
        this.#showPanelInTopLayer();
        this.#installOpenListeners();
        this.#positionPanel();
        if (this.initialFocus) this.#focusPanel();
      } else {
        this.#hidePanelFromTopLayer();
        this.#removeOpenListeners();
        if (this.#pendingRestoreReason && this.#pendingRestoreReason !== 'outside') {
          this.#restoreFocusToTrigger();
        }
        this.#pendingRestoreReason = undefined;
        this.#focusWasInsideBeforeClose = false;
      }
    }
    if (
      changed.has('side') ||
      changed.has('align') ||
      changed.has('flip') ||
      changed.has('shift')
    ) {
      this.#positionPanel();
    }
  }

  /** Requests closure with reason `action` only while the panel is open. */
  requestClose(): void {
    if (this.open) this.#propose(false, 'action');
  }

  #setOpen(value: boolean): void {
    if (value === this.#open) return;
    const previous = this.#open;
    this.#focusWasInsideBeforeClose =
      previous && !value ? this.#isInsidePanel(this.#activeElement()) : false;
    this.#open = value;
    this.requestUpdate('open', previous);
  }

  #commitOpen(value: boolean): void {
    this.#writingOpen = true;
    this.open = value;
    this.#writingOpen = false;
  }

  #propose(open: boolean, reason: PopoverCloseReason | 'trigger'): void {
    if (open === this.open) return;
    this.#edited = true;
    if (open) this.#pendingRestoreReason = undefined;

    let event: CustomEvent<PopoverOpenChangeDetail>;
    if (open) {
      event = new CustomEvent<PopoverOpenChangeDetail>('cosm-open-change', {
        detail: { open: true, reason: 'trigger' },
        bubbles: true,
        composed: true,
        cancelable: false,
      });
    } else {
      let detailPrevented = false;
      const detail: PopoverOpenChangeDetail = {
        open: false,
        reason,
        get defaultPrevented() {
          return detailPrevented || Boolean(event?.defaultPrevented);
        },
        preventDefault() {
          detailPrevented = true;
          event?.preventDefault();
        },
      };
      event = new CustomEvent<PopoverOpenChangeDetail>('cosm-open-change', {
        detail,
        bubbles: true,
        composed: true,
        cancelable: true,
      });
    }

    // Constructing the event here lets detail.preventDefault() and event.preventDefault()
    // share cancellation state synchronously, including while a wrapper callback is running.
    this.dispatchEvent(event);
    const canceled = event.defaultPrevented;
    if (!open && canceled) {
      this.#pendingRestoreReason = undefined;
      return;
    }
    if (open) {
      if (!this.openControlled) this.#commitOpen(true);
      return;
    }

    this.#pendingRestoreReason = reason;
    if (!this.openControlled) this.#commitOpen(false);
  }

  #onTriggerClick = (): void => {
    this.#propose(!this.open, 'trigger');
  };

  #onHostClick = (event: MouseEvent): void => {
    const path = event.composedPath();
    if (
      this.#triggerSlot()
        ?.assignedElements({ flatten: true })
        .some(element => path.includes(element))
    ) {
      this.#onTriggerClick();
    }
  };

  #onTriggerSlotChange = (): void => {
    this.#syncTriggerExpanded();
  };

  #onKeyDown = (event: KeyboardEvent): void => {
    if (this.open && this.closeOnEscape && event.key === 'Escape' && !event.defaultPrevented) {
      event.preventDefault();
      this.#propose(false, 'escape');
    }
  };

  #onDocumentPointerDown = (event: PointerEvent): void => {
    if (!this.open || !this.closeOnOutsidePress) return;
    if (event.composedPath().includes(this)) return;
    // Do not cancel, stop or redirect the outside interaction.
    this.#propose(false, 'outside');
  };

  #onViewportChange = (): void => {
    this.#positionPanel();
  };

  #onResize = (): void => {
    this.#positionPanel();
  };

  #installOpenListeners(): void {
    if (!this.isConnected || this.#openListenersInstalled) return;
    this.#openListenersInstalled = true;
    document.addEventListener('keydown', this.#onKeyDown);
    document.addEventListener('pointerdown', this.#onDocumentPointerDown, true);
    window.addEventListener('resize', this.#onViewportChange);
    window.addEventListener('scroll', this.#onViewportChange, true);
    window.addEventListener('orientationchange', this.#onViewportChange);
    window.visualViewport?.addEventListener('resize', this.#onViewportChange);
    window.visualViewport?.addEventListener('scroll', this.#onViewportChange);
    const trigger = this.#triggerElement();
    const panel = this.#panel();
    if (typeof ResizeObserver !== 'undefined' && trigger && panel) {
      this.#resizeObserver = new ResizeObserver(this.#onResize);
      this.#resizeObserver.observe(trigger);
      this.#resizeObserver.observe(panel);
    }
  }

  #removeOpenListeners(): void {
    this.#openListenersInstalled = false;
    document.removeEventListener('keydown', this.#onKeyDown);
    document.removeEventListener('pointerdown', this.#onDocumentPointerDown, true);
    window.removeEventListener('resize', this.#onViewportChange);
    window.removeEventListener('scroll', this.#onViewportChange, true);
    window.removeEventListener('orientationchange', this.#onViewportChange);
    window.visualViewport?.removeEventListener('resize', this.#onViewportChange);
    window.visualViewport?.removeEventListener('scroll', this.#onViewportChange);
    this.#resizeObserver?.disconnect();
    this.#resizeObserver = undefined;
  }

  #triggerSlot(): HTMLSlotElement | null {
    return this.renderRoot.querySelector<HTMLSlotElement>('slot[name="trigger"]');
  }

  #panelSlot(): HTMLSlotElement | null {
    return this.renderRoot.querySelector<HTMLSlotElement>('.panel slot');
  }

  #panel(): HTMLElement | null {
    return this.renderRoot.querySelector<HTMLElement>('.panel');
  }

  #showPanelInTopLayer(): void {
    const panel = this.#panel();
    if (!panel) return;
    if (typeof panel.showPopover !== 'function' || typeof panel.hidePopover !== 'function') {
      panel.removeAttribute('popover');
      return;
    }
    if (this.#inTopLayer) return;
    panel.showPopover();
    this.#inTopLayer = true;
  }

  #hidePanelFromTopLayer(): void {
    const panel = this.#panel();
    if (!panel || !this.#inTopLayer || typeof panel.hidePopover !== 'function') return;
    if (!panel.isConnected) {
      this.#inTopLayer = false;
      return;
    }
    panel.hidePopover();
    this.#inTopLayer = false;
  }

  #triggerElement(): HTMLElement | null {
    return (this.#triggerSlot()?.assignedElements({ flatten: true })[0] as HTMLElement) ?? null;
  }

  #syncTriggerExpanded(): void {
    const current = new Set(this.#triggerSlot()?.assignedElements({ flatten: true }) ?? []);
    for (const [element, previous] of this.#triggerAttributes) {
      if (!current.has(element)) {
        if (previous === null) element.removeAttribute('aria-expanded');
        else element.setAttribute('aria-expanded', previous);
        this.#triggerAttributes.delete(element);
      }
    }
    for (const element of current) {
      if (!this.#triggerAttributes.has(element)) {
        this.#triggerAttributes.set(element, element.getAttribute('aria-expanded'));
      }
      element.setAttribute('aria-expanded', String(this.open));
    }
  }

  #restoreTriggerAttributes(): void {
    for (const [element, previous] of this.#triggerAttributes) {
      if (previous === null) element.removeAttribute('aria-expanded');
      else element.setAttribute('aria-expanded', previous);
    }
    this.#triggerAttributes.clear();
  }

  #focusable(element: HTMLElement): boolean {
    if (element.hasAttribute('hidden') || element.closest('[hidden], [inert]')) return false;
    if ('disabled' in element && (element as HTMLButtonElement).disabled) return false;
    if (element.getAttribute('aria-disabled') === 'true') return false;
    return (
      element.tabIndex >= 0 ||
      (element.hasAttribute('tabindex') && element.tabIndex === -1) ||
      element.matches('a[href], area[href], button, input, select, textarea, summary, iframe')
    );
  }

  #focusablePanelContent(): HTMLElement | null {
    const slot = this.#panelSlot();
    for (const assigned of slot?.assignedElements({ flatten: true }) ?? []) {
      const root = assigned as HTMLElement;
      if (this.#focusable(root)) return root;
      for (const descendant of root.querySelectorAll<HTMLElement>(
        'a[href], area[href], button, input, select, textarea, summary, iframe, [tabindex]'
      )) {
        if (this.#focusable(descendant)) return descendant;
      }
    }
    return null;
  }

  #focusPanel(): void {
    (this.#focusablePanelContent() ?? this.#panel())?.focus();
  }

  #activeElement(): Element | null {
    return this.shadowRoot?.activeElement ?? document.activeElement;
  }

  #isInsidePanel(element: Element | null): boolean {
    if (!element) return false;
    const panel = this.#panel();
    if (panel?.contains(element)) return true;
    return (this.#panelSlot()?.assignedElements({ flatten: true }) ?? []).some(
      assigned => assigned === element || assigned.contains(element)
    );
  }

  #restoreFocusToTrigger(): void {
    const active = this.#activeElement();
    const focusWasLostByHiding =
      this.#focusWasInsideBeforeClose &&
      (active === document.body || active === document.documentElement || active === this);
    if (!this.restoreFocus || (!this.#isInsidePanel(active) && !focusWasLostByHiding)) return;
    const trigger = this.#triggerElement();
    if (!trigger?.isConnected || !this.#focusable(trigger)) return;
    trigger.focus();
  }

  #viewportBounds(): Bounds {
    const viewport = window.visualViewport;
    const left = viewport?.offsetLeft ?? 0;
    const top = viewport?.offsetTop ?? 0;
    const width = viewport?.width ?? window.innerWidth;
    const height = viewport?.height ?? window.innerHeight;
    const probe = this.renderRoot.querySelector<HTMLElement>('.safe-area-probe');
    const padding = probe ? getComputedStyle(probe) : null;
    const safeTop = Number.parseFloat(padding?.paddingTop ?? '') || 0;
    const safeRight = Number.parseFloat(padding?.paddingRight ?? '') || 0;
    const safeBottom = Number.parseFloat(padding?.paddingBottom ?? '') || 0;
    const safeLeft = Number.parseFloat(padding?.paddingLeft ?? '') || 0;
    return {
      left: left + safeLeft + 8,
      top: top + safeTop + 8,
      right: left + width - safeRight - 8,
      bottom: top + height - safeBottom - 8,
    };
  }

  #coordinates(
    side: PopoverSide,
    trigger: DOMRect,
    panelWidth: number,
    panelHeight: number
  ): { left: number; top: number } {
    const rtl = getComputedStyle(this).direction === 'rtl';
    const horizontalAlign =
      this.align === 'center'
        ? trigger.left + (trigger.width - panelWidth) / 2
        : this.align === 'start'
          ? rtl
            ? trigger.right - panelWidth
            : trigger.left
          : rtl
            ? trigger.left
            : trigger.right - panelWidth;
    const verticalAlign =
      this.align === 'center'
        ? trigger.top + (trigger.height - panelHeight) / 2
        : this.align === 'start'
          ? trigger.top
          : trigger.bottom - panelHeight;

    switch (side) {
      case 'top':
        return { left: horizontalAlign, top: trigger.top - panelHeight };
      case 'bottom':
        return { left: horizontalAlign, top: trigger.bottom };
      case 'left':
        return { left: trigger.left - panelWidth, top: verticalAlign };
      case 'right':
        return { left: trigger.right, top: verticalAlign };
    }
  }

  #mainOverflow(
    side: PopoverSide,
    point: { left: number; top: number },
    panel: DOMRect,
    bounds: Bounds
  ) {
    if (side === 'top' || side === 'bottom') {
      return (
        Math.max(0, bounds.top - point.top) + Math.max(0, point.top + panel.height - bounds.bottom)
      );
    }
    return (
      Math.max(0, bounds.left - point.left) + Math.max(0, point.left + panel.width - bounds.right)
    );
  }

  #positionPanel(): void {
    if (!this.open) return;
    const trigger = this.#triggerElement();
    const panel = this.#panel();
    if (!trigger || !panel) return;
    const bounds = this.#viewportBounds();
    const availableWidth = Math.max(0, bounds.right - bounds.left);
    const availableHeight = Math.max(0, bounds.bottom - bounds.top);
    panel.style.maxWidth = `${availableWidth}px`;
    panel.style.maxHeight = `${availableHeight}px`;

    const triggerRect = trigger.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const opposite: Record<PopoverSide, PopoverSide> = {
      top: 'bottom',
      bottom: 'top',
      left: 'right',
      right: 'left',
    };
    let side = this.side;
    let point = this.#coordinates(side, triggerRect, panelRect.width, panelRect.height);
    if (this.flip) {
      const flippedSide = opposite[side];
      const flippedPoint = this.#coordinates(
        flippedSide,
        triggerRect,
        panelRect.width,
        panelRect.height
      );
      if (
        this.#mainOverflow(flippedSide, flippedPoint, panelRect, bounds) <
        this.#mainOverflow(side, point, panelRect, bounds)
      ) {
        side = flippedSide;
        point = flippedPoint;
      }
    }
    if (this.shift) {
      point.left = Math.min(
        Math.max(point.left, bounds.left),
        Math.max(bounds.left, bounds.right - panelRect.width)
      );
      point.top = Math.min(
        Math.max(point.top, bounds.top),
        Math.max(bounds.top, bounds.bottom - panelRect.height)
      );
    }
    panel.style.left = `${point.left}px`;
    panel.style.top = `${point.top}px`;
    panel.dataset.placement = side;
  }

  protected override render() {
    return html`
      <div
        part="trigger"
        class="trigger"
        aria-expanded=${String(this.open)}
      >
        <slot name="trigger" @slotchange=${this.#onTriggerSlotChange}></slot>
      </div>
      <div part="panel" class="panel" popover="manual" ?hidden=${!this.open} tabindex="-1">
        <slot></slot>
      </div>
      <span class="safe-area-probe" aria-hidden="true"></span>
    `;
  }
}

define('cosm-popover', CosmPopover);

declare global {
  interface HTMLElementTagNameMap {
    'cosm-popover': CosmPopover;
  }
  interface HTMLElementEventMap {
    'cosm-open-change': CustomEvent<PopoverOpenChangeDetail>;
  }
}
