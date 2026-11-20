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
  ListboxItem,
  SelectChangeDetail,
  SelectValue,
  selectContract,
} from '@joralvmel/cosmos-core';
import type { CosmSelect } from '@joralvmel/cosmos-elements/select';
import type { IconDefinition } from '@joralvmel/cosmos-icons';
import '@joralvmel/cosmos-elements/select';

type Props = ContractProps<
  typeof selectContract,
  'angular',
  { ListboxItems: readonly ListboxItem<IconDefinition>[]; SelectValue: SelectValue }
>;

/**
 * Angular proxy of `<cosm-select>`. DOM outputs forward the original `CustomEvent`; Forms
 * integrates through `ControlValueAccessor` with a string-or-null value.
 *
 * ```html
 * <cosm-select label="Fruit" [items]="fruitOptions" placeholder="Choose a fruit" formControlName="fruit" />
 * ```
 */
@Component({
  selector: 'cosm-select',
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CosmSelectComponent),
      multi: true,
    },
  ],
  host: {
    '(cosm-change)': 'handleChange($event)',
    '(focusout)': 'markTouched()',
  },
})
export class CosmSelectComponent implements ControlValueAccessor {
  readonly element: CosmSelect = inject<ElementRef<CosmSelect>>(ElementRef).nativeElement;

  #onChange: (value: string | null) => void = () => {};
  #onTouched: () => void = () => {};

  @Input({ required: true }) set label(value: Props['label']) {
    this.element.label = value;
  }
  @Input({ required: true }) set items(value: Props['items']) {
    this.element.items = value;
  }
  /** A direct value input is controlled; Angular Forms writes use `writeValue` instead. */
  @Input() set value(value: Props['value']) {
    this.element.valueControlled = value !== undefined;
    if (value !== undefined) this.element.value = value;
  }
  @Input() set defaultValue(value: Props['defaultValue']) {
    if (value !== undefined) this.element.defaultValue = value;
  }
  @Input({ required: true }) set placeholder(value: Props['placeholder']) {
    this.element.placeholder = value;
  }
  @Input() set size(value: Props['size']) {
    this.element.size = value ?? 'md';
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
  @Input({ transform: booleanAttribute }) set clearable(value: boolean) {
    this.element.clearable = value;
  }
  @Input() set clearLabel(value: Props['clearLabel']) {
    this.element.clearLabel = value ?? '';
  }
  @Input() set name(value: Props['name']) {
    this.element.name = value;
  }

  @Output() readonly valueChange = new EventEmitter<CustomEvent<SelectChangeDetail>>();

  handleChange(event: CustomEvent<SelectChangeDetail>): void {
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
