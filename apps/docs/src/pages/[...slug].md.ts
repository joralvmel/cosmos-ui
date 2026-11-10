import { getCollection } from 'astro:content';
import { mdxToMarkdown } from '@joralvmel/cosmos-tools/ai';
import { getStatusReport } from '@joralvmel/cosmos-tools/status';
import type { APIRoute, GetStaticPaths } from 'astro';

/**
 * Markdown version of every docs page (`/components/button.md`, `/es/components/button.md`…), with
 * docs components replaced by Markdown generated from the contracts. Used by the "Copy page for AI"
 * button, /llms-full.txt and AI assistants.
 */
export const getStaticPaths = (async () => {
  const report = getStatusReport();
  const entries = await getCollection('docs');
  return entries.map(entry => ({
    params: { slug: entry.id },
    props: {
      markdown: mdxToMarkdown(
        `---\ntitle: ${entry.data.title}\ndescription: ${entry.data.description ?? ''}\n---\n${entry.body ?? ''}`,
        { report }
      ),
    },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
  new Response(props.markdown, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
