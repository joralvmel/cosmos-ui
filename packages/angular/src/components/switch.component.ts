import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  inject,
  Output,
} from '@angular/core';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import type { SwitchCheckedChangeDetail, switchContract } from '@joralvmel/cosmos-core';
import type { CosmSwitch } from '@joralvmel/cosmos-elements/switch';
import '@joralvmel/cosmos-elements/switch';

type Props = import('@joralvmel/cosmos-core').ContractProps<typeof switchContract, 'angular'>;

/**
 * Angular proxy of `<cosm-switch>`. The output forwards the original DOM `CustomEvent`; Forms
 * integrates through `ControlValueAccessor` with a boolean value.
 *
 * ```html
 * <cosm-switch label="Product notifications" formControlName="notifications" />
 * ```
 */
@Component({
  selector: 'cosm-switch',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CosmSwitchComponent),
      multi: true,
    },
  ],
  host: {
    '(cosm-checked-change)': 'handleChange($event)',
    '(focusout)': 'markTouched()',
  },
})
export class CosmSwitchComponent implements ControlValueAccessor {
  /** The underlying custom element. */
  readonly element: CosmSwitch = inject<ElementRef<CosmSwitch>>(ElementRef).nativeElement;

  #onChange: (value: boolean) => void = () => {};
  #onTouched: () => void = () => {};

  @Input({ required: true }) set label(value: Props['label']) {
    this.element.label = value;
  }
  @Input({ transform: booleanAttribute }) set hideLabel(value: boolean) {
    this.element.hideLabel = value;
  }
  /** A direct checked input is controlled; Angular Forms writes use `writeValue`. */
  @Input() set checked(value: Props['checked']) {
    if (value !== undefined) this.element.checked = value;
    this.element.checkedControlled = value !== undefined;
  }
  @Input({ transform: booleanAttribute }) set defaultChecked(value: boolean) {
    this.element.defaultChecked = value;
  }
  @Input() set size(value: Props['size']) {
    if (value !== undefined) this.element.size = value;
  }
  @Input({ transform: booleanAttribute }) set disabled(value: boolean) {
    this.element.disabled = value;
  }
  @Input({ transform: booleanAttribute }) set invalid(value: boolean) {
    this.element.invalid = value;
  }
  @Input() set helpText(value: Props['helpText']) {
    this.element.helpText = value ?? '';
  }
  @Input() set name(value: Props['name']) {
    this.element.name = value;
  }
  @Input() set value(value: Props['value']) {
    if (value !== undefined) this.element.value = value;
  }

  @Output() readonly checkedChange = new EventEmitter<CustomEvent<SwitchCheckedChangeDetail>>();

  /** Re-emits the original event and feeds its proposal into Angular Forms. */
  handleChange(event: CustomEvent<SwitchCheckedChangeDetail>): void {
    this.checkedChange.emit(event);
    this.#onChange(event.detail.checked);
  }

  /** Marks the control touched when it loses focus. */
  markTouched(): void {
    this.#onTouched();
  }

  writeValue(value: boolean | null | undefined): void {
    this.element.checked = value === true;
    this.element.checkedControlled = false;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.#onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.#onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.element.disabled = isDisabled;
  }
}
