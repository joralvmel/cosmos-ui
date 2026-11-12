import { type ContractProps, iconContract } from '@joralvmel/cosmos-core';
import { type IconDefinition, isIconDefinition } from '@joralvmel/cosmos-icons';
import { css, html, nothing } from 'lit';
import { CosmElement } from '../../internal/cosm-element.js';
import { define } from '../../internal/define.js';
import { boxSizing } from '../../internal/styles.js';

type Props = ContractProps<typeof iconContract, 'web', { IconDefinition: IconDefinition }>;
export type CosmIconSize = Exclude<Props['size'], undefined>;

const svgNamespace = 'http://www.w3.org/2000/svg';

const styles = css`
  :host {
    display: inline-block;
    width: var(--cosm-icon-size, var(--_cosm-icon-size, var(--cosm-icon-size-md, 20px)));
    height: var(--cosm-icon-size, var(--_cosm-icon-size, var(--cosm-icon-size-md, 20px)));
    vertical-align: middle;
  }
  :host([size='sm']) {
    width: var(--cosm-icon-size, var(--_cosm-icon-size, var(--cosm-icon-size-sm, 16px)));
    height: var(--cosm-icon-size, var(--_cosm-icon-size, var(--cosm-icon-size-sm, 16px)));
  }
  :host([size='lg']) {
    width: var(--cosm-icon-size, var(--_cosm-icon-size, var(--cosm-icon-size-lg, 24px)));
    height: var(--cosm-icon-size, var(--_cosm-icon-size, var(--cosm-icon-size-lg, 24px)));
  }
  svg {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`;

/**
 * Renders a structured SVG icon as a decorative graphic or a named informative image.
 *
 * @tag cosm-icon
 * @csspart icon - The rendered SVG image.
 * @cssprop --cosm-icon-size - Override the rendered icon width and height.
 */
export class CosmIcon extends CosmElement {
  static override properties = {
    icon: { attribute: false },
    size: {
      reflect: true,
      converter: {
        fromAttribute: (value: string | null) =>
          value !== null && value.trim() !== '' && Number.isFinite(Number(value))
            ? Number(value)
            : value,
        toAttribute: (value: CosmIconSize) => String(value),
      },
    },
    stroke: { type: String },
    fill: { type: String },
    strokeWidth: { type: Number, attribute: 'stroke-width' },
    label: { type: String },
    decorative: { type: Boolean, reflect: true },
  };

  static override styles = [boxSizing, styles];

  declare icon: Props['icon'];
  declare size: CosmIconSize;
  declare stroke: string;
  declare fill: string;
  declare strokeWidth: number;
  declare label: string | undefined;
  declare decorative: boolean;

  constructor() {
    super();
    this.size = iconContract.props.size.default;
    this.stroke = iconContract.props.stroke.default;
    this.fill = iconContract.props.fill.default;
    this.strokeWidth = iconContract.props.strokeWidth.default;
    this.label = undefined;
    this.decorative = iconContract.props.decorative.default;
  }

  protected override updated() {
    const icon = this.#requireIcon();
    if (!icon) return;
    const svg = this.renderRoot.querySelector('svg');
    if (!svg) return;
    svg.replaceChildren();
    for (const [tag, attributes] of icon.nodes) {
      const node = document.createElementNS(svgNamespace, tag);
      for (const [name, value] of Object.entries(attributes))
        node.setAttribute(name, String(value));
      svg.append(node);
    }
  }

  protected override willUpdate() {
    if (
      !(typeof this.size === 'number' && Number.isFinite(this.size) && this.size > 0) &&
      this.size !== 'sm' &&
      this.size !== 'md' &&
      this.size !== 'lg'
    )
      throw new TypeError('Icon size must be sm, md, lg or a positive finite number.');
    if (!Number.isFinite(this.strokeWidth) || this.strokeWidth < 0)
      throw new TypeError('Icon strokeWidth must be a nonnegative finite number.');
    for (const paint of [this.stroke, this.fill]) {
      if (
        typeof paint !== 'string' ||
        !paint.trim() ||
        /url\s*\(|javascript:|[;{}\\]/i.test(paint) ||
        [...paint].some(character => character.charCodeAt(0) < 32) ||
        (typeof CSS !== 'undefined' &&
          typeof CSS.supports === 'function' &&
          !CSS.supports('fill', paint))
      )
        throw new TypeError('Icon paint must be a supported SVG paint without a URL.');
    }
    if (typeof this.size === 'number')
      this.style.setProperty('--_cosm-icon-size', `${this.size}px`);
    else this.style.removeProperty('--_cosm-icon-size');
  }

  #requireIcon(): IconDefinition | undefined {
    if (this.icon === undefined) return undefined;
    if (!isIconDefinition(this.icon)) {
      throw new TypeError('cosm-icon requires a valid IconDefinition in its "icon" property.');
    }
    if (!this.decorative && !this.label?.trim()) {
      throw new TypeError('cosm-icon requires a non-empty "label" when decorative is false.');
    }
    return this.icon;
  }

  protected override render() {
    const icon = this.#requireIcon();
    if (!icon) {
      return html`<span part="error" role="alert">
        cosm-icon requires a valid IconDefinition in its "icon" property.
      </span>`;
    }
    return html`<svg
      part="icon"
      aria-hidden=${this.decorative ? 'true' : nothing}
      role=${this.decorative ? nothing : 'img'}
      aria-label=${this.decorative ? nothing : this.label}
      focusable="false"
      viewBox=${icon.viewBox}
      stroke=${this.stroke}
      fill=${this.fill}
      stroke-width=${this.strokeWidth}
    ></svg>`;
  }
}

define('cosm-icon', CosmIcon);

declare global {
  interface HTMLElementTagNameMap {
    'cosm-icon': CosmIcon;
  }
}
