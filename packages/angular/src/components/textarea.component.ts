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
import type { ContractProps, TextareaChangeDetail, textareaContract } from '@joralvmel/cosmos-core';
import type { CosmTextarea } from '@joralvmel/cosmos-elements/textarea';
import '@joralvmel/cosmos-elements/textarea';

type Props = ContractProps<typeof textareaContract, 'angular'>;

/**
 * Angular proxy of `<cosm-textarea>`. DOM outputs re-emit the original `CustomEvent`; Forms
 * integration follows `ControlValueAccessor` (including blur-based update strategies).
 *
 * ```html
 * <cosm-textarea label="Message" formControlName="message" />
 * ```
 */
@Component({
  selector: 'cosm-textarea',
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CosmTextareaComponent),
      multi: true,
    },
  ],
  host: {
    '(cosm-change)': 'handleChange($event)',
    '(focusout)': 'markTouched()',
  },
})
export class CosmTextareaComponent implements ControlValueAccessor {
  /** The underlying custom element. */
  readonly element: CosmTextarea = inject<ElementRef<CosmTextarea>>(ElementRef).nativeElement;

  #onChange: (value: string) => void = () => {};
  #onTouched: () => void = () => {};

  @Input({ required: true }) set label(value: Props['label']) {
    this.element.label = value;
  }
  @Input({ transform: booleanAttribute }) set labelHidden(value: boolean) {
    this.element.labelHidden = value;
  }
  /** A direct value input is controlled; Angular Forms writes use `writeValue` instead. */
  @Input() set value(value: Props['value']) {
    this.element.valueControlled = value !== undefined;
    if (value !== undefined) this.element.value = value;
  }
  @Input() set defaultValue(value: Props['defaultValue']) {
    this.element.defaultValue = value ?? '';
  }
  @Input() set rows(value: Props['rows']) {
    if (value !== undefined) this.element.rows = value;
  }
  @Input() set variant(value: Props['variant']) {
    if (value !== undefined) this.element.variant = value;
  }
  @Input() set size(value: Props['size']) {
    if (value !== undefined) this.element.size = value;
  }
  @Input() set placeholder(value: Props['placeholder']) {
    this.element.placeholder = value ?? '';
  }
  @Input() set helpText(value: Props['helpText']) {
    this.element.helpText = value ?? '';
  }
  @Input() set error(value: Props['error']) {
    this.element.error = value ?? '';
  }
  @Input({ transform: booleanAttribute }) set invalid(value: boolean) {
    this.element.invalid = value;
  }
  @Input({ transform: booleanAttribute }) set required(value: boolean) {
    this.element.required = value;
  }
  @Input({ transform: booleanAttribute }) set disabled(value: boolean) {
    this.element.disabled = value;
  }
  @Input({ transform: booleanAttribute }) set readOnly(value: boolean) {
    this.element.readOnly = value;
  }
  @Input() set maxLength(value: Props['maxLength']) {
    this.element.maxLength = value;
  }
  @Input() set name(value: Props['name']) {
    this.element.name = value;
  }

  @Output() readonly valueChange = new EventEmitter<CustomEvent<TextareaChangeDetail>>();

  /** Re-emits the original event and feeds its proposal into Angular Forms. */
  handleChange(event: CustomEvent<TextareaChangeDetail>): void {
    this.valueChange.emit(event);
    this.#onChange(event.detail.value);
  }

  /** Marks the control touched when the editable control loses focus. */
  markTouched(): void {
    this.#onTouched();
  }

  writeValue(value: string | null | undefined): void {
    // CVA owns the view draft until Angular commits it (notably for updateOn: 'blur').
    this.element.valueControlled = false;
    this.element.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.#onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.#onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.element.disabled = isDisabled;
  }
}
