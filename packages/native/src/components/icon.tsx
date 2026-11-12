import { type ContractProps, iconContract } from '@joralvmel/cosmos-core';
import { type IconDefinition, isIconDefinition } from '@joralvmel/cosmos-icons';
import { Platform, processColor } from 'react-native';
import { Circle, Ellipse, Line, Path, Polygon, Polyline, Rect, Svg } from 'react-native-svg';
import { useTheme } from '../theme/theme-provider.js';

type ContractIconProps = ContractProps<
  typeof iconContract,
  'native',
  { IconDefinition: IconDefinition }
>;

export interface IconProps extends ContractIconProps {
  icon: ContractIconProps['icon'];
}

/** Props handled by the native component; checked against the contract by the drift test. */
export const iconPropNames = [
  'icon',
  'size',
  'stroke',
  'fill',
  'strokeWidth',
  'label',
  'decorative',
] as const satisfies readonly (keyof ContractIconProps)[];

const dimensions = { sm: 16, md: 20, lg: 24 } as const;
const svgNodes = {
  path: Path,
  circle: Circle,
  ellipse: Ellipse,
  line: Line,
  polyline: Polyline,
  polygon: Polygon,
  rect: Rect,
};

/** Native icon renderer using react-native-svg and the active Cosmos foreground color. */
export function Icon({
  icon,
  size = iconContract.props.size.default,
  stroke = iconContract.props.stroke.default,
  fill = iconContract.props.fill.default,
  strokeWidth = iconContract.props.strokeWidth.default,
  label,
  decorative = iconContract.props.decorative.default,
}: IconProps) {
  const theme = useTheme();
  if (!isIconDefinition(icon)) {
    throw new TypeError('Icon requires a valid IconDefinition in its "icon" property.');
  }
  if (!decorative && !label?.trim()) {
    throw new TypeError('Icon requires a non-empty "label" when decorative is false.');
  }
  if (
    !(typeof size === 'number' && Number.isFinite(size) && size > 0) &&
    size !== 'sm' &&
    size !== 'md' &&
    size !== 'lg'
  )
    throw new TypeError('Icon size must be sm, md, lg or a positive finite number.');
  if (!Number.isFinite(strokeWidth) || strokeWidth < 0)
    throw new TypeError('Icon strokeWidth must be a nonnegative finite number.');
  const paint = (value: string) => {
    if (
      typeof value !== 'string' ||
      !value.trim() ||
      /url\s*\(|javascript:|[;{}\\]/i.test(value) ||
      [...value].some(character => character.charCodeAt(0) < 32)
    )
      throw new TypeError('Icon paint must be a supported color without a URL.');
    if (value === 'none') return value;
    if (value === 'currentColor') return theme.colors.fg;
    const css = (globalThis as { CSS?: { supports: (property: string, value: string) => boolean } })
      .CSS;
    const supported =
      Platform.OS === 'web'
        ? !css || css.supports('fill', value)
        : processColor(value) !== undefined && processColor(value) !== null;
    if (!supported) throw new TypeError('Icon paint must be a supported color without a URL.');
    return value;
  };
  const dimension = typeof size === 'number' ? size : dimensions[size];
  const accessibility =
    Platform.OS === 'web'
      ? {
          'aria-hidden': decorative ? true : undefined,
          role: decorative ? undefined : ('img' as const),
          'aria-label': decorative ? undefined : label,
          focusable: false,
        }
      : {
          accessible: !decorative,
          accessibilityRole: decorative ? undefined : ('image' as const),
          accessibilityLabel: decorative ? undefined : label,
          accessibilityElementsHidden: decorative,
          importantForAccessibility: decorative
            ? ('no-hide-descendants' as const)
            : ('yes' as const),
        };

  // Root color resolves currentColor in node attributes (e.g. brain-circuit dots) to the theme
  // foreground, matching the inherited text color of the web element.
  return (
    <Svg
      width={dimension}
      height={dimension}
      viewBox={icon.viewBox}
      color={theme.colors.fg}
      fill={paint(fill)}
      stroke={paint(stroke)}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...accessibility}
    >
      {icon.nodes.map(([tag, attributes], index) => {
        const Node = svgNodes[tag];
        // biome-ignore lint/suspicious/noArrayIndexKey: Static SVG node order is intrinsic to each icon definition.
        return <Node key={`${tag}-${index}`} {...attributes} />;
      })}
    </Svg>
  );
}
