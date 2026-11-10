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
import type { ButtonPressDetail } from '@joralvmel/cosmos-core';
import type {
  ButtonSize,
  ButtonTone,
  ButtonType,
  ButtonVariant,
  CosmButton,
} from '@joralvmel/cosmos-elements';
import '@joralvmel/cosmos-elements/button';

/**
 * Angular proxy of `<cosm-button>`. Inputs are forwarded as element properties; `(press)`
 * re-emits the original `cosm-press` `CustomEvent`.
 *
 * ```html
 * <cosm-button variant="soft" (press)="save($event.detail.source)">Save</cosm-button>
 * ```
 */
@Component({
  selector: 'cosm-button',
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(cosm-press)': 'press.emit($event)' },
})
export class CosmButtonComponent {
  /** The underlying custom element. */
  readonly element: CosmButton = inject<ElementRef<CosmButton>>(ElementRef).nativeElement;

  @Input() set variant(value: ButtonVariant) {
    this.element.variant = value;
  }
  @Input() set tone(value: ButtonTone) {
    this.element.tone = value;
  }
  @Input() set size(value: ButtonSize) {
    this.element.size = value;
  }
  @Input({ transform: booleanAttribute }) set disabled(value: boolean) {
    this.element.disabled = value;
  }
  @Input({ transform: booleanAttribute }) set loading(value: boolean) {
    this.element.loading = value;
  }
  @Input({ transform: booleanAttribute }) set fullWidth(value: boolean) {
    this.element.fullWidth = value;
  }
  @Input() set type(value: ButtonType) {
    this.element.type = value;
  }
  @Input() set label(value: string | undefined) {
    this.element.label = value;
  }

  @Output() readonly press = new EventEmitter<CustomEvent<ButtonPressDetail>>();
}
