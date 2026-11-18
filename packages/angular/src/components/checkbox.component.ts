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
import type { CheckboxCheckedChangeDetail, checkboxContract } from '@joralvmel/cosmos-core';
import type { CosmCheckbox } from '@joralvmel/cosmos-elements/checkbox';
import '@joralvmel/cosmos-elements/checkbox';

type Props = import('@joralvmel/cosmos-core').ContractProps<typeof checkboxContract, 'angular'>;

/**
 * Angular proxy of `<cosm-checkbox>`. The output forwards the original DOM `CustomEvent`; Forms
 * integrates through `ControlValueAccessor` with a boolean value.
 *
 * ```html
 * <cosm-checkbox label="Accept terms" formControlName="accepted" />
 * ```
 */
@Component({
  selector: 'cosm-checkbox',
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CosmCheckboxComponent),
      multi: true,
    },
  ],
  host: {
    '(cosm-checked-change)': 'handleChange($event)',
    '(focusout)': 'markTouched()',
  },
})
export class CosmCheckboxComponent implements ControlValueAccessor {
  /** The underlying custom element. */
  readonly element: CosmCheckbox = inject<ElementRef<CosmCheckbox>>(ElementRef).nativeElement;

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
    this.element.checkedControlled = true;
  }
  @Input({ transform: booleanAttribute }) set defaultChecked(value: boolean) {
    this.element.defaultChecked = value;
  }
  @Input({ transform: booleanAttribute }) set indeterminate(value: boolean) {
    this.element.indeterminate = value;
  }
  @Input() set size(value: Props['size']) {
    if (value !== undefined) this.element.size = value;
  }
  @Input({ transform: booleanAttribute }) set disabled(value: boolean) {
    this.element.disabled = value;
  }
  @Input({ transform: booleanAttribute }) set required(value: boolean) {
    this.element.required = value;
  }
  @Input({ transform: booleanAttribute }) set invalid(value: boolean) {
    this.element.invalid = value;
  }
  @Input() set helpText(value: Props['helpText']) {
    this.element.helpText = value ?? '';
  }
  @Input() set errorText(value: Props['errorText']) {
    this.element.errorText = value ?? '';
  }
  @Input() set name(value: Props['name']) {
    this.element.name = value;
  }
  @Input() set value(value: Props['value']) {
    if (value !== undefined) this.element.value = value;
  }

  @Output() readonly checkedChange = new EventEmitter<CustomEvent<CheckboxCheckedChangeDetail>>();

  /** Re-emits the original event and feeds its proposal into Angular Forms. */
  handleChange(event: CustomEvent<CheckboxCheckedChangeDetail>): void {
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
