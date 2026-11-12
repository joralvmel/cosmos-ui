/** Platforms that implement a component contract. */
export const platforms = ['web', 'react', 'angular', 'native'] as const;
export type Platform = (typeof platforms)[number];

interface BasePropSpec {
  description: string;
  /** Prop must be provided by the consumer; no contract default exists. */
  required?: boolean;
  /** Reflected to an attribute on the Web Component (used for styling). */
  reflect?: boolean;
  /** Limits the prop to some platforms (e.g. `type` exists only on the web). */
  platforms?: readonly Platform[];
}

export type PropSpec =
  | (BasePropSpec & { type: 'string'; default?: string })
  | (BasePropSpec & { type: 'number'; default?: number })
  | (BasePropSpec & { type: 'boolean'; default: boolean })
  | (BasePropSpec & { type: 'enum'; values: readonly string[]; default: string })
  | (BasePropSpec & {
      type: 'union';
      variants: readonly ({ type: 'enum'; values: readonly string[] } | { type: 'number' })[];
      default?: string | number;
    })
  | (BasePropSpec & {
      type: 'reference';
      reference: string;
      /** Named examples used by generated documentation controls and source snippets. */
      options?: readonly string[];
      example?: string;
    });

/** Public event with its name on every platform (see docs/adr/0003-state-ownership-and-events.md). */
export interface EventSpec {
  description: string;
  /** Name of the TypeScript type of `detail` / the callback argument, exported by core. */
  detail: string;
  cancelable?: boolean;
  names: { dom: `cosm-${string}`; react: `on${string}`; angular: string; native: `on${string}` };
}

/** Public state and who owns it: bound states are controlled, unbound states are autonomous. */
export interface StateSpec {
  prop: string;
  /** Event that proposes a new value. */
  event: string;
  defaultProp?: string;
}

export interface KeyboardSpec {
  keys: readonly string[];
  action: string;
}

export interface ComponentContract {
  name: string;
  /** Custom element tag on the web. */
  tag: `cosm-${string}`;
  description: string;
  /** Platforms that implement the component; all of them when omitted (e.g. `['native']`). */
  platforms?: readonly Platform[];
  /** WAI-ARIA role of the interactive element. */
  role: string;
  /** Reference pattern (WAI-ARIA APG or HTML spec URL). */
  pattern: string;
  props: Record<string, PropSpec>;
  events: Record<string, EventSpec>;
  states: readonly StateSpec[];
  slots: Record<string, string>;
  parts: Record<string, string>;
  cssProperties: Record<string, string>;
  keyboard: readonly KeyboardSpec[];
}

/** Identity helper that keeps literal types, so platform props can be derived from the contract. */
export function defineContract<const C extends ComponentContract>(contract: C): C {
  return contract;
}

/** Whether a platform implements the component. */
export function supports(contract: ComponentContract, platform: Platform): boolean {
  return !contract.platforms || contract.platforms.includes(platform);
}

type ValueOf<S, References extends Record<string, unknown>> = S extends {
  type: 'enum';
  values: readonly (infer V)[];
}
  ? V
  : S extends { type: 'union'; variants: readonly (infer Variant)[] }
    ? ValueOf<Variant, References>
    : S extends { type: 'boolean' }
      ? boolean
      : S extends { type: 'number' }
        ? number
        : S extends { type: 'string' }
          ? string
          : S extends { type: 'reference'; reference: infer K extends keyof References }
            ? References[K]
            : never;

type AvailableOn<S, P extends Platform> = S extends { platforms: readonly (infer X)[] }
  ? P extends X
    ? true
    : false
  : true;

/** Props of a contract available on a platform, all optional (defaults live in the contract). */
export type ContractProps<
  C extends ComponentContract,
  P extends Platform,
  References extends Record<string, unknown> = Record<never, never>,
> = {
  -readonly [K in keyof C['props'] as AvailableOn<C['props'][K], P> extends true
    ? C['props'][K] extends { required: true }
      ? K
      : never
    : never]-?: ValueOf<C['props'][K], References>;
} & {
  -readonly [K in keyof C['props'] as AvailableOn<C['props'][K], P> extends true
    ? C['props'][K] extends { required: true }
      ? never
      : K
    : never]?: ValueOf<C['props'][K], References>;
};

/** Names of the props a platform must expose. */
export function propNames(contract: ComponentContract, platform: Platform): string[] {
  return Object.entries(contract.props)
    .filter(([, spec]) => !spec.platforms || spec.platforms.includes(platform))
    .map(([name]) => name);
}

/** Event names a platform must expose, e.g. `['onPress']` for React. */
export function eventNames(
  contract: ComponentContract,
  platform: 'dom' | 'react' | 'angular' | 'native'
): string[] {
  return Object.values(contract.events).map(event => event.names[platform]);
}

/** Default values declared by the contract, for the props available on a platform. */
export function defaults(contract: ComponentContract, platform: Platform): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(contract.props)
      .filter(([, spec]) => 'default' in spec && spec.default !== undefined)
      .filter(([, spec]) => !spec.platforms || spec.platforms.includes(platform))
      .map(([name, spec]) => [name, 'default' in spec ? spec.default : undefined])
  );
}
