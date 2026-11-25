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
  PaginationChangeDetail,
  paginationContract,
} from '@joralvmel/cosmos-core';
import type { CosmPagination } from '@joralvmel/cosmos-elements/pagination';
import '@joralvmel/cosmos-elements/pagination';

type Props = ContractProps<typeof paginationContract, 'angular'>;

/**
 * Pagination proxy: `<cosm-pagination label="Results" [totalPages]="10" (pageChange)="navigate($event.detail.page)" />`.
 */
@Component({
  selector: 'cosm-pagination',
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(cosm-change)': 'handleChange($event)' },
})
export class CosmPaginationComponent {
  readonly element: CosmPagination = inject<ElementRef<CosmPagination>>(ElementRef).nativeElement;

  @Input({ required: true }) set totalPages(value: number) {
    this.element.totalPages = value;
  }
  @Input() set page(value: Props['page']) {
    this.element.page = value;
  }
  @Input() set defaultPage(value: number) {
    this.element.defaultPage = value;
  }
  @Input({ required: true }) set label(value: string) {
    this.element.label = value;
  }
  @Input() set previousLabel(value: string) {
    this.element.previousLabel = value;
  }
  @Input() set nextLabel(value: string) {
    this.element.nextLabel = value;
  }
  @Input() set firstLabel(value: string) {
    this.element.firstLabel = value;
  }
  @Input() set lastLabel(value: string) {
    this.element.lastLabel = value;
  }
  @Input() set pageLabel(value: string) {
    this.element.pageLabel = value;
  }
  @Input() set summaryLabel(value: string) {
    this.element.summaryLabel = value;
  }
  @Input() set locale(value: Props['locale']) {
    this.element.locale = value;
  }
  @Input() set direction(value: NonNullable<Props['direction']>) {
    this.element.direction = value;
  }
  @Input() set presentation(value: NonNullable<Props['presentation']>) {
    this.element.presentation = value;
  }
  @Input() set variant(value: NonNullable<Props['variant']>) {
    this.element.variant = value;
  }
  @Input() set size(value: NonNullable<Props['size']>) {
    this.element.size = value;
  }
  @Input({ transform: booleanAttribute }) set showFirstLast(value: boolean) {
    this.element.showFirstLast = value;
  }
  @Input({ transform: booleanAttribute }) set disabled(value: boolean) {
    this.element.disabled = value;
  }

  @Output() readonly pageChange = new EventEmitter<CustomEvent<PaginationChangeDetail>>();

  handleChange(event: Event): void {
    if (!(event instanceof CustomEvent)) throw new TypeError('Expected a pagination CustomEvent.');
    const detail: unknown = event.detail;
    if (
      typeof detail !== 'object' ||
      detail === null ||
      !('page' in detail) ||
      typeof detail.page !== 'number' ||
      !Number.isSafeInteger(detail.page) ||
      detail.page < 1
    ) {
      throw new TypeError('Expected a pagination change with a positive integer page.');
    }
    this.pageChange.emit(event as CustomEvent<PaginationChangeDetail>);
  }
}
