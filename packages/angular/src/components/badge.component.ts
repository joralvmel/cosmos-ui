import { ChangeDetectionStrategy, Component, ElementRef, Input, inject } from '@angular/core';
import type {
  BadgeSize,
  BadgeTone,
  BadgeVariant,
  CosmBadge,
} from '@joralvmel/cosmos-elements/badge';
import type { IconDefinition } from '@joralvmel/cosmos-icons';
import '@joralvmel/cosmos-elements/badge';

/**
 * Angular proxy of `<cosm-badge>`.
 *
 * ```html
 * <cosm-badge tone="success">Ready</cosm-badge>
 * ```
 */
@Component({
  selector: 'cosm-badge',
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CosmBadgeComponent {
  readonly element: CosmBadge = inject<ElementRef<CosmBadge>>(ElementRef).nativeElement;

  @Input() set variant(value: BadgeVariant) {
    this.element.variant = value;
  }

  @Input() set tone(value: BadgeTone) {
    this.element.tone = value;
  }

  @Input() set size(value: BadgeSize) {
    this.element.size = value;
  }

  @Input() set startIcon(value: IconDefinition | undefined) {
    this.element.startIcon = value;
  }
}
