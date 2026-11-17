import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  inject,
  Output,
} from '@angular/core';
import type {
  ContractProps,
  PopoverOpenChangeDetail,
  popoverContract,
} from '@joralvmel/cosmos-core';
import type { CosmPopover } from '@joralvmel/cosmos-elements/popover';
import '@joralvmel/cosmos-elements/popover';

type Props = ContractProps<typeof popoverContract, 'angular'>;

function optionalBooleanAttribute(value: unknown): boolean | undefined {
  return value === undefined ? undefined : booleanAttribute(value);
}

/**
 * Angular proxy of `<cosm-popover>`. Inputs are forwarded to the element and `(openChange)`
 * re-emits the original cancelable DOM `CustomEvent`.
 *
 * ```html
 * <cosm-popover [open]="isOpen" (openChange)="onOpenChange($event)">
 *   <button slot="trigger">Show details</button>
 *   <p>Consumer-owned content and semantics.</p>
 * </cosm-popover>
 * ```
 */
@Component({
  selector: 'cosm-popover',
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(cosm-open-change)': 'openChange.emit($event)' },
})
export class CosmPopoverComponent {
  /** The underlying custom element and imperative `requestClose()` handle. */
  readonly element: CosmPopover = inject<ElementRef<CosmPopover>>(ElementRef).nativeElement;

  @Input({ transform: optionalBooleanAttribute }) set open(value: boolean | undefined) {
    this.element.open = value;
  }
  @Input({ transform: booleanAttribute }) set defaultOpen(value: boolean) {
    this.element.defaultOpen = value;
  }
  @Input({ transform: booleanAttribute }) set closeOnEscape(value: boolean) {
    this.element.closeOnEscape = value;
  }
  @Input({ transform: booleanAttribute }) set closeOnOutsidePress(value: boolean) {
    this.element.closeOnOutsidePress = value;
  }
  @Input({ transform: booleanAttribute }) set initialFocus(value: boolean) {
    this.element.initialFocus = value;
  }
  @Input({ transform: booleanAttribute }) set restoreFocus(value: boolean) {
    this.element.restoreFocus = value;
  }
  @Input() set side(value: Props['side']) {
    if (value !== undefined) this.element.side = value;
  }
  @Input() set align(value: Props['align']) {
    if (value !== undefined) this.element.align = value;
  }
  @Input({ transform: booleanAttribute }) set flip(value: boolean) {
    this.element.flip = value;
  }
  @Input({ transform: booleanAttribute }) set shift(value: boolean) {
    this.element.shift = value;
  }

  @Output() readonly openChange = new EventEmitter<CustomEvent<PopoverOpenChangeDetail>>();

  /** Proposes an action close only while the panel is open. */
  requestClose(): void {
    this.element.requestClose();
  }
}
