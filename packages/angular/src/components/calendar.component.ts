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
import type { CalendarChangeDetail, ContractProps, calendarContract } from '@joralvmel/cosmos-core';
import type { CosmCalendar } from '@joralvmel/cosmos-elements/calendar';
import '@joralvmel/cosmos-elements/calendar';

type Props = ContractProps<typeof calendarContract, 'angular'>;

/**
 * Angular proxy of `<cosm-calendar>`.
 *
 * ```html
 * <cosm-calendar [value]="selectedDate" (valueChange)="selectedDate = $event.detail.value" />
 * ```
 */
@Component({
  selector: 'cosm-calendar',
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(cosm-change)': 'valueChange.emit($event)',
  },
})
export class CosmCalendarComponent {
  /** The underlying custom element. */
  readonly element: CosmCalendar = inject<ElementRef<CosmCalendar>>(ElementRef).nativeElement;

  @Input() set value(value: Props['value']) {
    this.element.valueControlled = value !== undefined;
    this.element.value = value;
  }
  @Input() set defaultValue(value: Props['defaultValue']) {
    this.element.defaultValue = value;
  }
  @Input() set min(value: Props['min']) {
    this.element.min = value;
  }
  @Input() set max(value: Props['max']) {
    this.element.max = value;
  }
  @Input() set locale(value: Props['locale']) {
    this.element.locale = value;
  }
  @Input({ transform: booleanAttribute }) set disabled(value: boolean) {
    this.element.disabled = value;
  }

  @Output() readonly valueChange = new EventEmitter<CustomEvent<CalendarChangeDetail>>();
}
