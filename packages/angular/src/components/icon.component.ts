import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  inject,
} from '@angular/core';
import type { CosmIcon, CosmIconSize } from '@joralvmel/cosmos-elements/icon';
import type { IconDefinition } from '@joralvmel/cosmos-icons';
import '@joralvmel/cosmos-elements/icon';

/**
 * Angular proxy of `<cosm-icon>`.
 *
 * ```html
 * <cosm-icon [icon]="house" size="md" [decorative]="false" label="Home" />
 * ```
 */
@Component({
  selector: 'cosm-icon',
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CosmIconComponent {
  readonly element: CosmIcon = inject<ElementRef<CosmIcon>>(ElementRef).nativeElement;

  @Input({ required: true }) set icon(value: IconDefinition) {
    this.element.icon = value;
  }

  @Input() set size(value: CosmIconSize) {
    this.element.size = value;
  }

  @Input() set stroke(value: string) {
    this.element.stroke = value;
  }

  @Input() set fill(value: string) {
    this.element.fill = value;
  }

  @Input() set strokeWidth(value: number) {
    this.element.strokeWidth = value;
  }

  @Input() set label(value: string | undefined) {
    this.element.label = value;
  }

  @Input({ transform: booleanAttribute }) set decorative(value: boolean) {
    this.element.decorative = value;
  }
}
