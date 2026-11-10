import type { StatusReport } from '../status/component-status.mjs';

export declare function splitFrontmatter(source: string): {
  data: Record<string, string>;
  body: string;
};
export declare function mdxToMarkdown(source: string, options?: { report?: StatusReport }): string;
