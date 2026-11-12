#!/usr/bin/env node
// Keeps one open issue per scheduled report, identified by its exact title.
//
//   node tools/github/upsert-issue.mjs --title "..." --label security --body-file report.md --findings true
//
// With findings it creates the issue or replaces the body of the open one; without findings it closes
// the open one (if any) with a comment. Needs `gh` authenticated (GH_TOKEN in workflows).
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

/** Decides what to do with the report issue. */
export function planIssue({ existing, findings }) {
  if (findings) return existing ? { action: 'update', number: existing } : { action: 'create' };
  return existing ? { action: 'close', number: existing } : { action: 'none' };
}

const gh = args => execFileSync(process.env.GH_PATH || 'gh', args, { encoding: 'utf8' });

function option(args, name) {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
}

function main() {
  const args = process.argv.slice(2);
  const title = option(args, '--title');
  const label = option(args, '--label');
  const bodyFile = option(args, '--body-file');
  const findings = option(args, '--findings') === 'true';
  if (!title || !bodyFile) {
    console.error(
      'Usage: upsert-issue.mjs --title <t> --body-file <f> --findings <bool> [--label l]'
    );
    process.exitCode = 2;
    return;
  }
  const open = JSON.parse(
    gh([
      'issue',
      'list',
      '--state',
      'open',
      '--search',
      `"${title}" in:title`,
      '--json',
      'number,title',
    ])
  );
  const existing = open.find(issue => issue.title === title)?.number;
  const plan = planIssue({ existing, findings });
  if (plan.action === 'create') {
    gh([
      'issue',
      'create',
      '--title',
      title,
      '--body-file',
      bodyFile,
      ...(label ? ['--label', label] : []),
    ]);
  } else if (plan.action === 'update') {
    gh(['issue', 'edit', String(plan.number), '--body-file', bodyFile]);
  } else if (plan.action === 'close') {
    gh([
      'issue',
      'close',
      String(plan.number),
      '--comment',
      'Resolved: the latest report is clean.',
    ]);
  }
  console.log(`${plan.action}${plan.number ? ` #${plan.number}` : ''}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
