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
import type {
  ContractProps,
  RadioGroupChangeDetail,
  RadioGroupReferences,
  radioGroupContract,
} from '@joralvmel/cosmos-core';
import type { CosmRadioGroup } from '@joralvmel/cosmos-elements/radio-group';
import '@joralvmel/cosmos-elements/radio-group';

type Props = ContractProps<typeof radioGroupContract, 'angular', RadioGroupReferences>;

/**
 * Angular proxy of `<cosm-radio-group>`. DOM outputs forward the original `CustomEvent`; Forms
 * integrates through `ControlValueAccessor` with a string-or-null value.
 *
 * ```html
 * <cosm-radio-group
 *   label="Contact method"
 *   [options]="contactMethods"
 *   formControlName="contactMethod"
 * />
 * ```
 */
@Component({
  selector: 'cosm-radio-group',
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CosmRadioGroupComponent),
      multi: true,
    },
  ],
  host: {
    '(cosm-change)': 'handleChange($event)',
    '(focusout)': 'markTouched()',
  },
})
export class CosmRadioGroupComponent implements ControlValueAccessor {
  readonly element: CosmRadioGroup = inject<ElementRef<CosmRadioGroup>>(ElementRef).nativeElement;

  #onChange: (value: string | null) => void = () => {};
  #onTouched: () => void = () => {};

  @Input({ required: true }) set label(value: Props['label']) {
    this.element.label = value;
  }
  @Input({ required: true }) set options(value: Props['options']) {
    this.element.options = value;
  }
  /** A direct value input is controlled; Angular Forms writes use `writeValue` instead. */
  @Input() set value(value: Props['value']) {
    this.element.valueControlled = value !== undefined;
    if (value !== undefined) this.element.value = value;
  }
  @Input() set defaultValue(value: Props['defaultValue']) {
    if (value !== undefined) this.element.defaultValue = value;
  }
  @Input() set orientation(value: Props['orientation']) {
    if (value !== undefined) this.element.orientation = value;
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

  @Output() readonly valueChange = new EventEmitter<CustomEvent<RadioGroupChangeDetail>>();

  handleChange(event: CustomEvent<RadioGroupChangeDetail>): void {
    this.valueChange.emit(event);
    this.#onChange(event.detail.value);
  }

  markTouched(): void {
    this.#onTouched();
  }

  writeValue(value: string | null | undefined): void {
    this.element.value = value ?? null;
    this.element.valueControlled = false;
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.#onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.#onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.element.disabled = isDisabled;
  }
}
