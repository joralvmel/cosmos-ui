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
  ListboxItem,
  ListboxSelectionChangeDetail,
} from '@joralvmel/cosmos-core';
import type { CosmListbox } from '@joralvmel/cosmos-elements/listbox';
import type { IconDefinition } from '@joralvmel/cosmos-icons';
import '@joralvmel/cosmos-elements/listbox';

type Props = ContractProps<
  typeof import('@joralvmel/cosmos-core').listboxContract,
  'angular',
  { ListboxItems: readonly ListboxItem<IconDefinition>[]; ListboxValues: readonly string[] }
>;

/**
 * Angular proxy of `<cosm-listbox>`. Selection behavior remains in Lit; the output re-emits the
 * original DOM `CustomEvent`. A bound `selectedValues` input, including an empty array, is controlled.
 *
 * ```html
 * <cosm-listbox label="Choose fruit" [items]="items" (selectionChange)="onSelectionChange($event)" />
 * ```
 */
@Component({
  selector: 'cosm-listbox',
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(cosm-selection-change)': 'selectionChange.emit($event)',
  },
})
export class CosmListboxComponent {
  /** The underlying custom element. */
  readonly element: CosmListbox = inject<ElementRef<CosmListbox>>(ElementRef).nativeElement;

  @Input({ required: true }) set label(value: Props['label']) {
    this.element.label = value;
  }
  @Input({ transform: booleanAttribute }) set labelHidden(value: boolean) {
    this.element.labelHidden = value;
  }
  @Input({ required: true }) set items(value: Props['items']) {
    this.element.items = value;
  }
  @Input() set selectionMode(value: Props['selectionMode']) {
    if (value !== undefined) this.element.selectionMode = value;
  }
  /** A bound input is controlled even when its value is `[]`. */
  @Input() set selectedValues(value: Props['selectedValues']) {
    this.element.selectedValues = value;
    this.element.selectedValuesControlled = true;
  }
  @Input() set defaultSelectedValues(value: Props['defaultSelectedValues']) {
    if (value !== undefined) this.element.defaultSelectedValues = value;
  }
  @Input() set variant(value: Props['variant']) {
    if (value !== undefined) this.element.variant = value;
  }
  @Input() set size(value: Props['size']) {
    if (value !== undefined) this.element.size = value;
  }
  @Input({ transform: booleanAttribute }) set disabled(value: boolean) {
    this.element.disabled = value;
  }
  @Input({ transform: booleanAttribute }) set readOnly(value: boolean) {
    this.element.readOnly = value;
  }
  @Input() set locale(value: Props['locale']) {
    this.element.locale = value;
  }

  @Output() readonly selectionChange = new EventEmitter<
    CustomEvent<ListboxSelectionChangeDetail>
  >();
}
