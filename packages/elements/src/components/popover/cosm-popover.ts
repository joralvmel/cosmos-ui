import {
  type ContractProps,
  type PopoverCloseReason,
  type PopoverOpenChangeDetail,
  popoverContract,
} from '@joralvmel/cosmos-core';
import { x } from '@joralvmel/cosmos-icons/x';
import { css, html, LitElement, nothing } from 'lit';
import '../icon/cosm-icon.js';
import '../icon-button/cosm-icon-button.js';
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
    display: flex;
    flex-direction: column;
    overflow: visible;
  }
  .body { min-height: 0; overflow: auto; }
  .close { align-self: flex-end; flex: none; margin-bottom: var(--cosm-space-xs, 0.25rem); }
  .arrow { position: absolute; overflow: visible; pointer-events: none; }
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
 * @csspart body - Scrollable content.
 * @csspart close - Optional close IconButton.
 * @csspart arrow - Decorative pointer matching the panel.
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
    triggerMode: { attribute: 'trigger-mode' },
    closable: { type: Boolean },
    closeLabel: { attribute: 'close-label' },
    gap: { type: Number },
    arrow: { type: Boolean },
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
  declare triggerMode: Props['triggerMode'];
  declare closable: Props['closable'];
  declare closeLabel: Props['closeLabel'];
  declare gap: Props['gap'];
  declare arrow: Props['arrow'];
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
  #hovered = false;
  #focused = false;
  #hoverDismissed = false;
  #hoverTimer: ReturnType<typeof setTimeout> | undefined;
  #openingReason: 'trigger' | 'hover' | 'focus' | undefined;
  #themeObserver: MutationObserver | undefined;
  #pressStartedClosed = false;

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
    this.triggerMode = props.triggerMode.default;
    this.closable = props.closable.default;
    this.closeLabel = props.closeLabel.default;
    this.gap = props.gap.default;
    this.arrow = props.arrow.default;
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
    this.addEventListener('pointerdown', this.#onTriggerPointerDown);
    this.addEventListener('pointerover', this.#onPointerOver);
    this.addEventListener('pointerout', this.#onPointerOut);
    this.addEventListener('focusin', this.#onFocusIn);
    this.addEventListener('focusout', this.#onFocusOut);
    document.addEventListener('pointermove', this.#onPointerMove);
    this.#themeObserver = new MutationObserver(() => this.#positionPanel());
    for (let ancestor: HTMLElement | null = this; ancestor; ancestor = ancestor.parentElement) {
      this.#themeObserver.observe(ancestor, {
        attributes: true,
        attributeFilter: ['class', 'style', 'data-theme', 'data-mode'],
      });
    }
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
    this.removeEventListener('pointerdown', this.#onTriggerPointerDown);
    this.removeEventListener('pointerover', this.#onPointerOver);
    this.removeEventListener('pointerout', this.#onPointerOut);
    this.removeEventListener('focusin', this.#onFocusIn);
    this.removeEventListener('focusout', this.#onFocusOut);
    document.removeEventListener('pointermove', this.#onPointerMove);
    clearTimeout(this.#hoverTimer);
    this.#themeObserver?.disconnect();
    this.#hidePanelFromTopLayer();
    this.#removeOpenListeners();
    this.#restoreTriggerAttributes();
    super.disconnectedCallback();
  }

  protected override willUpdate(): void {
    if (!Number.isFinite(this.gap) || this.gap < 0) {
      throw new RangeError('cosm-popover gap must be a finite non-negative number.');
    }
    if (this.closable && !this.closeLabel?.trim()) {
      throw new Error('cosm-popover requires a non-empty closeLabel when closable.');
    }
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
        if (
          this.initialFocus &&
          this.#openingReason !== 'hover' &&
          this.#openingReason !== 'focus'
        ) {
          this.#focusPanel();
        }
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
      changed.has('shift') ||
      changed.has('gap') ||
      changed.has('arrow') ||
      changed.has('closable')
    ) {
      this.#positionPanel();
    }
    if (changed.has('triggerMode')) {
      clearTimeout(this.#hoverTimer);
      this.#hoverDismissed = false;
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

  #propose(open: boolean, reason: PopoverCloseReason): void {
    if (open === this.open) return;
    this.#edited = true;
    if (open) {
      this.#pendingRestoreReason = undefined;
      this.#openingReason = reason === 'hover' || reason === 'focus' ? reason : 'trigger';
    }

    let event: CustomEvent<PopoverOpenChangeDetail>;
    if (open) {
      event = new CustomEvent<PopoverOpenChangeDetail>('cosm-open-change', {
        detail: { open: true, reason: this.#openingReason ?? 'trigger' },
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

    if (reason !== 'hover' && reason !== 'focus' && this.triggerMode === 'hover') {
      this.#hoverDismissed = this.#hovered || this.#focused;
      clearTimeout(this.#hoverTimer);
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
      // Touch focus can open hover mode between pointerdown and its resulting click.
      if (this.#pressStartedClosed && this.open && this.#openingReason === 'focus') {
        this.#pressStartedClosed = false;
        return;
      }
      this.#pressStartedClosed = false;
      this.#onTriggerClick();
    }
  };

  #onTriggerPointerDown = (event: PointerEvent): void => {
    const trigger = this.#triggerElement();
    this.#pressStartedClosed = Boolean(
      this.triggerMode === 'hover' &&
        !this.open &&
        trigger &&
        event.composedPath().includes(trigger)
    );
  };

  #inside(target: EventTarget | null): boolean {
    if (!(target instanceof Node)) return false;
    let node: Node | null = target;
    while (node) {
      if (node === this || this.contains(node)) return true;
      const root = node.getRootNode();
      node = root instanceof ShadowRoot ? root.host : null;
    }
    return false;
  }

  #scheduleHoverClose(reason: 'hover' | 'focus'): void {
    clearTimeout(this.#hoverTimer);
    if (this.#hovered || this.#focused) return;
    this.#hoverDismissed = false;
    if (!this.open || this.triggerMode !== 'hover') return;
    this.#hoverTimer = setTimeout(() => {
      if (!this.#hovered && !this.#focused) this.#propose(false, reason);
    }, 150);
  }

  #onPointerOver = (event: PointerEvent): void => {
    if (event.pointerType === 'touch' || this.triggerMode !== 'hover') return;
    this.#hovered = true;
    clearTimeout(this.#hoverTimer);
    const trigger = this.#triggerElement();
    if (!this.#hoverDismissed && trigger && event.composedPath().includes(trigger)) {
      this.#propose(true, 'hover');
    }
  };

  #onPointerOut = (event: PointerEvent): void => {
    if (event.pointerType === 'touch' || this.#inside(event.relatedTarget)) return;
    this.#hovered = false;
    this.#scheduleHoverClose('hover');
  };

  #inHoverBridge(x: number, y: number): boolean {
    const trigger = this.#triggerElement()?.getBoundingClientRect();
    const panel = this.#panel();
    if (!trigger || !panel || !this.open) return false;
    const rect = panel.getBoundingClientRect();
    const side = panel.dataset.placement;
    const vertical = side === 'top' || side === 'bottom';
    const start = vertical
      ? side === 'bottom'
        ? trigger.bottom
        : rect.bottom
      : side === 'right'
        ? trigger.right
        : rect.right;
    const end = vertical
      ? side === 'bottom'
        ? rect.top
        : trigger.top
      : side === 'right'
        ? rect.left
        : trigger.left;
    const main = vertical ? y : x;
    if (end <= start || main < start || main > end) return false;
    const from = side === 'bottom' || side === 'right' ? trigger : rect;
    const to = from === trigger ? rect : trigger;
    const progress = (main - start) / (end - start);
    const min = vertical ? 'left' : 'top';
    const max = vertical ? 'right' : 'bottom';
    const low = from[min] + (to[min] - from[min]) * progress;
    const high = from[max] + (to[max] - from[max]) * progress;
    const cross = vertical ? x : y;
    return cross >= low - 4 && cross <= high + 4;
  }

  #onPointerMove = (event: PointerEvent): void => {
    if (event.pointerType === 'touch' || this.triggerMode !== 'hover') return;
    this.#hovered =
      event.composedPath().includes(this) || this.#inHoverBridge(event.clientX, event.clientY);
    if (this.#hovered) clearTimeout(this.#hoverTimer);
    else this.#scheduleHoverClose('hover');
  };

  #onFocusIn = (event: FocusEvent): void => {
    this.#focused = true;
    clearTimeout(this.#hoverTimer);
    const trigger = this.#triggerElement();
    if (
      this.triggerMode === 'hover' &&
      !this.#hoverDismissed &&
      trigger &&
      event.composedPath().includes(trigger)
    ) {
      this.#propose(true, 'focus');
    }
  };

  #onFocusOut = (event: FocusEvent): void => {
    if (this.#inside(event.relatedTarget)) return;
    this.#focused = false;
    this.#scheduleHoverClose('focus');
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
    const assigned = this.#triggerSlot()?.assignedElements({ flatten: true }) ?? [];
    const current = new Set(assigned);
    for (const element of assigned) {
      const button = element.shadowRoot?.querySelector('button');
      if (button) current.add(button);
    }
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
    for (const element of assigned) {
      if (
        element.localName === 'cosm-icon-button' &&
        'updateComplete' in element &&
        !element.shadowRoot?.querySelector('button')
      ) {
        void Promise.resolve(element.updateComplete).then(() => {
          if (element.isConnected && this.isConnected) this.#syncTriggerExpanded();
        });
      }
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
    const button = element.shadowRoot?.querySelector<HTMLButtonElement>('button');
    if (button) return !button.disabled;
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
    (
      this.renderRoot.querySelector<HTMLElement>('.close') ??
      this.#focusablePanelContent() ??
      this.#panel()
    )?.focus();
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

    const distance = this.gap + (this.arrow ? 8 : 0);
    switch (side) {
      case 'top':
        return { left: horizontalAlign, top: trigger.top - panelHeight - distance };
      case 'bottom':
        return { left: horizontalAlign, top: trigger.bottom + distance };
      case 'left':
        return { left: trigger.left - panelWidth - distance, top: verticalAlign };
      case 'right':
        return { left: trigger.right + distance, top: verticalAlign };
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
    this.#positionArrow(panel, triggerRect, panelRect, point, side, bounds);
  }

  #positionArrow(
    panel: HTMLElement,
    trigger: DOMRect,
    rect: DOMRect,
    point: { left: number; top: number },
    side: PopoverSide,
    bounds: Bounds
  ): void {
    const arrow = this.renderRoot.querySelector<SVGSVGElement>('.arrow');
    if (!arrow) return;
    const vertical = side === 'top' || side === 'bottom';
    const center = vertical
      ? trigger.left + trigger.width / 2 - point.left
      : trigger.top + trigger.height / 2 - point.top;
    const computed = getComputedStyle(panel);
    const radius = Math.max(
      ...[
        computed.borderTopLeftRadius,
        computed.borderTopRightRadius,
        computed.borderBottomLeftRadius,
        computed.borderBottomRightRadius,
      ].map(value => Number.parseFloat(value) || 0)
    );
    const size = vertical ? rect.width : rect.height;
    const border = Number.parseFloat(computed.borderTopWidth) || 0;
    const depth = 8;
    const tip =
      side === 'top'
        ? point.top + rect.height + depth
        : side === 'bottom'
          ? point.top - depth
          : side === 'left'
            ? point.left + rect.width + depth
            : point.left - depth;
    const facing =
      side === 'top'
        ? tip <= trigger.top
        : side === 'bottom'
          ? tip >= trigger.bottom
          : side === 'left'
            ? tip <= trigger.left
            : tip >= trigger.right;
    const tipWithinBounds = vertical
      ? tip >= bounds.top && tip <= bounds.bottom
      : tip >= bounds.left && tip <= bounds.right;
    arrow.style.display =
      this.arrow && facing && tipWithinBounds && center >= radius + 8 && center <= size - radius - 8
        ? ''
        : 'none';
    arrow.style.height = vertical ? `${8 + border}px` : '16px';
    arrow.style.width = vertical ? '16px' : `${8 + border}px`;
    arrow.style.left = vertical
      ? `${center - 8 - border}px`
      : side === 'right'
        ? `${-8 - border}px`
        : `${rect.width - border * 2}px`;
    arrow.style.top = vertical
      ? side === 'bottom'
        ? `${-8 - border}px`
        : `${rect.height - border * 2}px`
      : `${center - 8 - border}px`;
    const path = arrow.querySelector('path');
    if (!path) return;
    path.setAttribute(
      'd',
      vertical
        ? side === 'bottom'
          ? `M0 ${8 + border} L8 0 L16 ${8 + border}`
          : `M0 0 L8 ${8 + border} L16 0`
        : side === 'right'
          ? `M${8 + border} 0 L0 8 L${8 + border} 16`
          : `M0 0 L${8 + border} 8 L0 16`
    );
    path.setAttribute('fill', computed.backgroundColor);
    path.setAttribute('stroke', computed.borderTopColor);
    path.setAttribute('stroke-width', String(border));
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
        ${this.arrow ? html`<svg part="arrow" class="arrow" aria-hidden="true" focusable="false"><path /></svg>` : nothing}
        ${
          this.closable
            ? html`<cosm-icon-button
          part="close" class="close" variant="ghost" tone="neutral" size="sm"
          .label=${this.closeLabel} @cosm-press=${() => this.#propose(false, 'close-button')}
        ><cosm-icon .icon=${x}></cosm-icon></cosm-icon-button>`
            : nothing
        }
        <div part="body" class="body"><slot></slot></div>
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
