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
import type { ContractProps, DialogOpenChangeDetail, dialogContract } from '@joralvmel/cosmos-core';
import type { CosmDialog } from '@joralvmel/cosmos-elements/dialog';
import '@joralvmel/cosmos-elements/dialog';

type Props = ContractProps<typeof dialogContract, 'angular'>;

function optionalBooleanAttribute(value: unknown): boolean | undefined {
  return value === undefined ? undefined : booleanAttribute(value);
}

/**
 * Angular proxy of `<cosm-dialog>`. Inputs are forwarded to the element; `(openChange)` re-emits
 * the original cancelable DOM `CustomEvent`.
 *
 * ```html
 * <cosm-dialog [open]="isOpen" (openChange)="onOpenChange($event)">
 *   <h2 slot="title">Dialog title</h2>
 *   <p>Consumer-owned dialog content and semantics.</p>
 * </cosm-dialog>
 * ```
 */
@Component({
  selector: 'cosm-dialog',
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(cosm-open-change)': 'openChange.emit($any($event))' },
})
export class CosmDialogComponent {
  /** The underlying custom element and imperative `requestOpen()` / `requestClose()` handle. */
  readonly element: CosmDialog = inject<ElementRef<CosmDialog>>(ElementRef).nativeElement;

  @Input({ transform: optionalBooleanAttribute }) set open(value: boolean | undefined) {
    this.element.open = value;
  }
  @Input({ transform: booleanAttribute }) set defaultOpen(value: boolean) {
    this.element.defaultOpen = value;
  }
  @Input() set presentation(value: Props['presentation']) {
    if (value !== undefined) this.element.presentation = value;
  }
  @Input() set size(value: Props['size']) {
    if (value !== undefined) this.element.size = value;
  }
  @Input() set maxWidth(value: Props['maxWidth']) {
    this.element.maxWidth = value;
  }
  @Input({ transform: booleanAttribute }) set fullWidth(value: boolean) {
    this.element.fullWidth = value;
  }
  @Input({ transform: booleanAttribute }) set responsiveFullscreen(value: boolean) {
    this.element.responsiveFullscreen = value;
  }
  @Input({ transform: booleanAttribute }) set movable(value: boolean) {
    this.element.movable = value;
  }
  @Input() set moveControlsLabel(value: Props['moveControlsLabel']) {
    if (value !== undefined) this.element.moveControlsLabel = value;
  }
  @Input() set moveUpLabel(value: Props['moveUpLabel']) {
    if (value !== undefined) this.element.moveUpLabel = value;
  }
  @Input() set moveDownLabel(value: Props['moveDownLabel']) {
    if (value !== undefined) this.element.moveDownLabel = value;
  }
  @Input() set moveLeftLabel(value: Props['moveLeftLabel']) {
    if (value !== undefined) this.element.moveLeftLabel = value;
  }
  @Input() set moveRightLabel(value: Props['moveRightLabel']) {
    if (value !== undefined) this.element.moveRightLabel = value;
  }
  @Input() set moveCenterLabel(value: Props['moveCenterLabel']) {
    if (value !== undefined) this.element.moveCenterLabel = value;
  }
  @Input() set closeLabel(value: Props['closeLabel']) {
    if (value !== undefined) this.element.closeLabel = value;
  }
  @Input({ transform: booleanAttribute }) set closeOnEscape(value: boolean) {
    this.element.closeOnEscape = value;
  }
  @Input({ transform: booleanAttribute }) set closeOnBackdropPress(value: boolean) {
    this.element.closeOnBackdropPress = value;
  }
  @Input() set initialFocusTarget(value: HTMLElement | null | undefined) {
    if (value !== undefined) this.element.initialFocusTarget = value;
  }
  @Input() set returnFocusTarget(value: HTMLElement | null | undefined) {
    if (value !== undefined) this.element.returnFocusTarget = value;
  }

  @Output() readonly openChange = new EventEmitter<CustomEvent<DialogOpenChangeDetail>>();

  /** Proposes an open action while preserving the element's controlled-state behavior. */
  requestOpen(): void {
    this.element.requestOpen();
  }

  /** Proposes a close action while preserving the element's controlled-state behavior. */
  requestClose(): void {
    this.element.requestClose();
  }
}
