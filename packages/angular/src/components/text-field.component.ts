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
  TextFieldChangeDetail,
  TextFieldSubmitDetail,
  textFieldContract,
} from '@joralvmel/cosmos-core';
import type { CosmTextField } from '@joralvmel/cosmos-elements/text-field';
import type { IconDefinition } from '@joralvmel/cosmos-icons';
import '@joralvmel/cosmos-elements/text-field';

type Props = ContractProps<typeof textFieldContract, 'angular', { IconDefinition: IconDefinition }>;

/**
 * Angular proxy of `<cosm-text-field>`. DOM outputs re-emit the original `CustomEvent`; Forms
 * integration follows `ControlValueAccessor` (including blur-based update strategies).
 *
 * ```html
 * <cosm-text-field label="Email" formControlName="email" />
 * ```
 */
@Component({
  selector: 'cosm-text-field',
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CosmTextFieldComponent),
      multi: true,
    },
  ],
  host: {
    '(cosm-change)': 'handleChange($event)',
    '(cosm-submit)': 'submit.emit($event)',
    '(focusout)': 'markTouched()',
  },
})
export class CosmTextFieldComponent implements ControlValueAccessor {
  /** The underlying custom element. */
  readonly element: CosmTextField = inject<ElementRef<CosmTextField>>(ElementRef).nativeElement;

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
  @Input() set type(value: Props['type']) {
    if (value !== undefined) this.element.type = value;
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
  @Input() set minLength(value: Props['minLength']) {
    this.element.minLength = value;
  }
  @Input() set maxLength(value: Props['maxLength']) {
    this.element.maxLength = value;
  }
  @Input() set pattern(value: Props['pattern']) {
    this.element.pattern = value;
  }
  @Input() set name(value: Props['name']) {
    this.element.name = value;
  }
  @Input() set autoComplete(value: Props['autoComplete']) {
    this.element.autoComplete = value;
  }
  @Input() set inputMode(value: Props['inputMode']) {
    this.element.inputMode = value ?? '';
  }
  @Input() set startIcon(value: Props['startIcon']) {
    this.element.startIcon = value;
  }
  @Input() set endIcon(value: Props['endIcon']) {
    this.element.endIcon = value;
  }
  @Input() set prefix(value: Props['prefix']) {
    this.element.prefix = value ?? '';
  }
  @Input() set suffix(value: Props['suffix']) {
    this.element.suffix = value ?? '';
  }
  @Input({ transform: booleanAttribute }) set clearable(value: boolean) {
    this.element.clearable = value;
  }
  @Input() set clearLabel(value: Props['clearLabel']) {
    this.element.clearLabel = value;
  }
  @Input({ transform: booleanAttribute }) set passwordReveal(value: boolean) {
    this.element.passwordReveal = value;
  }
  @Input() set revealPasswordLabel(value: Props['revealPasswordLabel']) {
    this.element.revealPasswordLabel = value;
  }
  @Input() set hidePasswordLabel(value: Props['hidePasswordLabel']) {
    this.element.hidePasswordLabel = value;
  }

  @Output() readonly valueChange = new EventEmitter<CustomEvent<TextFieldChangeDetail>>();
  @Output() readonly submit = new EventEmitter<CustomEvent<TextFieldSubmitDetail>>();

  /** Re-emits the original event and feeds its proposal into Angular Forms. */
  handleChange(event: CustomEvent<TextFieldChangeDetail>): void {
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
