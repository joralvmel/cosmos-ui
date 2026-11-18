import { badgeContract, type ContractProps } from '@joralvmel/cosmos-core';
import { type IconDefinition, isIconDefinition } from '@joralvmel/cosmos-icons';
import { css, html, nothing } from 'lit';
import { CosmElement } from '../../internal/cosm-element.js';
import { define } from '../../internal/define.js';
import { boxSizing } from '../../internal/styles.js';
import '../icon/cosm-icon.js';

type Props = Required<
  ContractProps<typeof badgeContract, 'web', { IconDefinition: IconDefinition }>
>;
export type BadgeVariant = NonNullable<Props['variant']>;
export type BadgeTone = NonNullable<Props['tone']>;
export type BadgeSize = NonNullable<Props['size']>;

const styles = css`
  :host {
    --_tone-text: var(--cosm-fg, currentColor);
    --_tone-soft: var(--cosm-surface-raised, var(--cosm-bg, transparent));
    --_tone-solid: var(--cosm-fg, currentColor);
    --_tone-solid-fg: var(--cosm-bg, white);
    --_tone-border: var(--cosm-border-strong, currentColor);
    --_font-size: var(--cosm-text-sm, 0.875rem);
    --_padding-inline: var(--cosm-space-sm, 0.5rem);
    --_padding-block: var(--cosm-space-xs, 0.25rem);
    --_gap: var(--cosm-space-2xs, 0.125rem);
    display: inline-block;
    max-inline-size: 100%;
    color: var(--cosm-badge-color, var(--_tone-text));
    font-family: var(
      --cosm-badge-font-family,
      var(--cosm-font-sans, ui-sans-serif, system-ui, sans-serif)
    );
    font-size: var(--cosm-badge-font-size, var(--_font-size));
    font-weight: var(--cosm-badge-font-weight, var(--cosm-weight-medium, 500));
    line-height: var(--cosm-badge-line-height, var(--cosm-leading-normal, 1.5));
    vertical-align: middle;
  }
  :host([tone='info']) {
    --_tone-text: var(--cosm-info-text, var(--cosm-info, currentColor));
    --_tone-soft: var(--cosm-info-subtle, var(--cosm-bg, transparent));
    --_tone-solid: var(--cosm-info, currentColor);
    --_tone-solid-fg: var(--cosm-info-fg, var(--cosm-bg, white));
    --_tone-border: var(--cosm-info-text, var(--cosm-info, currentColor));
  }
  :host([tone='success']) {
    --_tone-text: var(--cosm-success-text, var(--cosm-success, currentColor));
    --_tone-soft: var(--cosm-success-subtle, var(--cosm-bg, transparent));
    --_tone-solid: var(--cosm-success, currentColor);
    --_tone-solid-fg: var(--cosm-success-fg, var(--cosm-bg, white));
    --_tone-border: var(--cosm-success-text, var(--cosm-success, currentColor));
  }
  :host([tone='warning']) {
    --_tone-text: var(--cosm-warning-text, var(--cosm-warning, currentColor));
    --_tone-soft: var(--cosm-warning-subtle, var(--cosm-bg, transparent));
    --_tone-solid: var(--cosm-warning, currentColor);
    --_tone-solid-fg: var(--cosm-warning-fg, var(--cosm-bg, white));
    --_tone-border: var(--cosm-warning-text, var(--cosm-warning, currentColor));
  }
  :host([tone='danger']) {
    --_tone-text: var(--cosm-danger-text, var(--cosm-danger, currentColor));
    --_tone-soft: var(--cosm-danger-subtle, var(--cosm-bg, transparent));
    --_tone-solid: var(--cosm-danger, currentColor);
    --_tone-solid-fg: var(--cosm-danger-fg, var(--cosm-bg, white));
    --_tone-border: var(--cosm-danger-text, var(--cosm-danger, currentColor));
  }
  :host([size='sm']) {
    --_font-size: var(--cosm-text-xs, 0.75rem);
    --_padding-inline: var(--cosm-space-xs, 0.25rem);
    --_padding-block: var(--cosm-space-2xs, 0.125rem);
    --_gap: var(--cosm-space-2xs, 0.125rem);
  }
  :host([size='lg']) {
    --_font-size: var(--cosm-text-md, 1rem);
    --_padding-inline: var(--cosm-space-md, 0.75rem);
    --_padding-block: var(--cosm-space-sm, 0.5rem);
    --_gap: var(--cosm-space-xs, 0.25rem);
  }
  .base {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    max-inline-size: 100%;
    gap: var(--cosm-badge-gap, var(--_gap));
    padding-block: var(--cosm-badge-padding-block, var(--_padding-block));
    padding-inline: var(--cosm-badge-padding-inline, var(--_padding-inline));
    border: 1px solid;
    border-radius: var(--cosm-badge-radius, var(--cosm-radius-md, 0.5rem));
    color: var(--cosm-badge-color, var(--_tone-text));
    background: var(--cosm-badge-background, var(--_tone-soft));
    border-color: var(--cosm-badge-border, transparent);
    white-space: normal;
    overflow-wrap: anywhere;
  }
  :host([variant='solid']) .base {
    color: var(--cosm-badge-color, var(--_tone-solid-fg));
    background: var(--cosm-badge-background, var(--_tone-solid));
  }
  :host([variant='outline']) .base {
    background: var(--cosm-badge-background, transparent);
    border-color: var(--cosm-badge-border, var(--_tone-border));
  }
  .label {
    min-inline-size: 0;
    overflow-wrap: anywhere;
  }
  .icon {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
  }
`;

/**
 * A noninteractive status or category label, optionally with a decorative leading icon.
 *
 * @tag cosm-badge
 * @slot - Label or caller-formatted count text.
 * @csspart base - Rounded label container.
 * @csspart label - Label or caller-formatted count text.
 * @csspart icon - Optional decorative leading icon wrapper.
 * @cssprop --cosm-badge-background - Badge background color.
 * @cssprop --cosm-badge-color - Badge text and icon color.
 * @cssprop --cosm-badge-border - Badge border color.
 * @cssprop --cosm-badge-padding-inline - Badge inline padding.
 * @cssprop --cosm-badge-padding-block - Badge block padding.
 * @cssprop --cosm-badge-gap - Space between the icon and label.
 * @cssprop --cosm-badge-font-family - Badge label font family.
 * @cssprop --cosm-badge-font-size - Badge label font size.
 * @cssprop --cosm-badge-font-weight - Badge label font weight.
 * @cssprop --cosm-badge-line-height - Badge label line height.
 * @cssprop --cosm-badge-radius - Badge corner radius.
 */
export class CosmBadge extends CosmElement {
  static override properties = {
    variant: { type: String, reflect: true },
    tone: { type: String, reflect: true },
    size: { type: String, reflect: true },
    startIcon: { attribute: false },
  };

  static override styles = [boxSizing, styles];

  declare variant: BadgeVariant;
  declare tone: BadgeTone;
  declare size: BadgeSize;
  declare startIcon: IconDefinition | undefined;

  constructor() {
    super();
    this.variant = badgeContract.props.variant.default as BadgeVariant;
    this.tone = badgeContract.props.tone.default as BadgeTone;
    this.size = badgeContract.props.size.default as BadgeSize;
    this.startIcon = undefined;
  }

  protected override willUpdate() {
    if (!['soft', 'solid', 'outline'].includes(this.variant))
      throw new TypeError('Badge variant must be soft, solid or outline.');
    if (!['neutral', 'info', 'success', 'warning', 'danger'].includes(this.tone))
      throw new TypeError('Badge tone must be neutral, info, success, warning or danger.');
    if (!['sm', 'md', 'lg'].includes(this.size))
      throw new TypeError('Badge size must be sm, md or lg.');
    if (this.startIcon !== undefined && !isIconDefinition(this.startIcon))
      throw new TypeError('Badge startIcon must be a valid IconDefinition.');
  }

  protected override render() {
    return html`<span part="base" class="base">
      ${
        this.startIcon
          ? html`<span part="icon" class="icon" aria-hidden="true"
            ><cosm-icon .icon=${this.startIcon} size=${this.size} decorative></cosm-icon
          ></span>`
          : nothing
      }
      <span part="label" class="label"><slot></slot></span>
    </span>`;
  }
}

define('cosm-badge', CosmBadge);

declare global {
  interface HTMLElementTagNameMap {
    'cosm-badge': CosmBadge;
  }
}
