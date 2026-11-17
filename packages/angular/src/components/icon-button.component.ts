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
  IconButtonPressDetail,
  IconButtonPressedChangeDetail,
  iconButtonContract,
} from '@joralvmel/cosmos-core';
import type { CosmIconButton } from '@joralvmel/cosmos-elements/icon-button';
import '@joralvmel/cosmos-elements/icon-button';

type Props = ContractProps<typeof iconButtonContract, 'angular'>;

/** Angular proxy; outputs forward the original DOM CustomEvents. */
@Component({
  selector: 'cosm-icon-button',
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(cosm-press)': 'press.emit($event)',
    '(cosm-pressed-change)': 'pressedChange.emit($event)',
  },
})
export class CosmIconButtonComponent {
  readonly element: CosmIconButton = inject<ElementRef<CosmIconButton>>(ElementRef).nativeElement;

  @Input({ required: true }) set label(value: string) {
    this.element.label = value;
  }
  @Input() set mode(value: Props['mode']) {
    if (value !== undefined) this.element.mode = value;
  }
  @Input() set variant(value: Props['variant']) {
    if (value !== undefined) this.element.variant = value;
  }
  @Input() set tone(value: Props['tone']) {
    if (value !== undefined) this.element.tone = value;
  }
  @Input() set size(value: Props['size']) {
    if (value !== undefined) this.element.size = value;
  }
  @Input() set type(value: Props['type']) {
    if (value !== undefined) this.element.type = value;
  }
  @Input({ transform: booleanAttribute }) set disabled(value: boolean) {
    this.element.disabled = value;
  }
  @Input({ transform: booleanAttribute }) set defaultPressed(value: boolean) {
    this.element.defaultPressed = value;
  }
  @Input() set pressed(value: Props['pressed'] | string) {
    this.element.pressed = value === undefined ? undefined : booleanAttribute(value);
  }

  @Output() readonly press = new EventEmitter<CustomEvent<IconButtonPressDetail>>();
  @Output() readonly pressedChange = new EventEmitter<CustomEvent<IconButtonPressedChangeDetail>>();
}
