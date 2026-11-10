import type { CatalogEntry, ComponentStatus } from '@joralvmel/cosmos-core';

export type PieceKey =
  | 'contract'
  | 'scenarios'
  | 'web'
  | 'react'
  | 'angular'
  | 'native'
  | 'nativeDemo'
  | 'tests'
  | 'docsEn'
  | 'docsEs'
  | 'llms'
  | 'changeset';

/** `undefined` means the piece does not apply to the platforms of the component. */
export type Pieces = Record<PieceKey, boolean | undefined>;

export interface ComponentReport {
  name: string;
  title: string;
  category: CatalogEntry['category'];
  batch: CatalogEntry['batch'];
  priority: CatalogEntry['priority'];
  platforms: string[];
  dependsOn: string[];
  pattern: string;
  target: ComponentStatus;
  claimed: 'stable' | undefined;
  notes: string[];
  status: ComponentStatus;
  pieces: Pieces;
  /** Files that still contain TODO(generator) markers (keep the component in progress). */
  todos: string[];
  missing: PieceKey[];
  blockedBy: string[];
}

export interface StatusReport {
  summary: { total: number; stable: number; inProgress: number; planned: number };
  next: string[];
  gaps: { name: string; missing: PieceKey[]; blockedBy: string[] }[];
  components: ComponentReport[];
}

export declare const ROOT: string;
export declare function findRoot(start: string): string | undefined;
export declare const PIECES: Record<PieceKey, string>;
export declare function piecePaths(name: string): Record<string, string>;
export declare function detectPieces(
  root: string,
  entry: CatalogEntry,
  changesets?: string
): Pieces;
export declare function computeStatus(pieces: Pieces): ComponentStatus;
export declare function getStatusReport(
  root?: string,
  entries?: readonly CatalogEntry[]
): StatusReport;
export declare function toMarkdown(report: StatusReport): string;
