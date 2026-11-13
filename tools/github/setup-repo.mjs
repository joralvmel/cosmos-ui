#!/usr/bin/env node
// Configures the GitHub repository with the GitHub CLI (`gh`).
//
//   node tools/github/setup-repo.mjs                      dry run: prints every API call
//   node tools/github/setup-repo.mjs --apply              applies them
//   node tools/github/setup-repo.mjs --repo owner/name    another repository (default: origin)
//
// Settings that the API cannot change are listed in MANUAL_STEPS and printed at the end.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { labels } from './labels.mjs';

/** Status checks (workflow job names) required before merging into main and develop. */
export const requiredChecks = [
  'Lint, terms, typecheck, test & build',
  'Changeset present',
  'Commit emails and PR title',
  'Build docs',
  'Dependency review',
];

export const MANUAL_STEPS = [
  'Settings → Secrets and variables → Actions → Secrets: add COSMOS_BLOCKED_TERMS (one term per line).',
  'Settings → Secrets and variables → Actions → Variables: set COSMOS_DOCS_ENABLED and COSMOS_PUBLISH_ENABLED to "true" when ready (see the Publishing guide).',
  'Settings → Secrets and variables → Actions → Variables (optional): set COSMOS_DEPENDABOT_AUTOMERGE to "true" to auto-merge minor/patch development tooling updates once their checks pass.',
  'Settings → Pages → Build and deployment → Source: "GitHub Actions".',
  'Settings → Environments: create "npm" (optional: required reviewers before publishing) and "github-pages".',
  'Settings → Code security: enable secret scanning push protection (free for public repositories).',
  'Settings → Rules (optional): a ruleset that requests a Copilot code review on every pull request.',
  'Your account → Settings → Emails: enable "Keep my email addresses private" and "Block command line pushes that expose my email".',
  'The merge button remembers the last method per user: squash work PRs into develop; use "Create a merge commit" for releases into main and synchronization back into develop. Never delete main or develop.',
];

function protection() {
  return {
    required_status_checks: { strict: true, contexts: requiredChecks },
    // Admins can still merge in an emergency (e.g. a single maintainer who cannot approve their own PR).
    enforce_admins: false,
    required_pull_request_reviews: {
      required_approving_review_count: 0,
      require_code_owner_reviews: false,
      dismiss_stale_reviews: true,
    },
    restrictions: null,
    required_linear_history: false,
    required_conversation_resolution: true,
    allow_force_pushes: false,
    allow_deletions: false,
  };
}

/** Builds the list of API calls. `existingLabels` comes from `GET /labels` (names). */
export function buildPlan({ repo, existingLabels = [] }) {
  const base = `repos/${repo}`;
  const existing = new Set(existingLabels.map(name => name.toLowerCase()));
  return [
    {
      description:
        'Merge options: squash (PR title + body) and merge commits for releases; no rebase; delete branches after merge; auto-merge; develop as default branch',
      method: 'PATCH',
      path: base,
      body: {
        allow_squash_merge: true,
        allow_merge_commit: true,
        allow_rebase_merge: false,
        allow_auto_merge: true,
        delete_branch_on_merge: true,
        allow_update_branch: true,
        squash_merge_commit_title: 'PR_TITLE',
        squash_merge_commit_message: 'PR_BODY',
        merge_commit_title: 'PR_TITLE',
        merge_commit_message: 'PR_BODY',
        default_branch: 'develop',
        has_issues: true,
        has_projects: false,
        has_wiki: false,
      },
    },
    {
      description:
        'Workflow permissions: read-only token by default; allow Actions to open pull requests (Changesets "Version Packages")',
      method: 'PUT',
      path: `${base}/actions/permissions/workflow`,
      body: { default_workflow_permissions: 'read', can_approve_pull_request_reviews: true },
    },
    {
      description: 'Dependabot alerts',
      method: 'PUT',
      path: `${base}/vulnerability-alerts`,
    },
    {
      description: 'Dependabot security updates',
      method: 'PUT',
      path: `${base}/automated-security-fixes`,
    },
    {
      description: 'Private vulnerability reporting',
      method: 'PUT',
      path: `${base}/private-vulnerability-reporting`,
    },
    ...['main', 'develop'].map(branch => ({
      description: `Protect ${branch}: pull request without mandatory approval, required checks, no force push or deletion`,
      method: 'PUT',
      path: `${base}/branches/${branch}/protection`,
      body: protection(),
    })),
    ...labels.map(label =>
      existing.has(label.name.toLowerCase())
        ? {
            description: `Update label "${label.name}"`,
            method: 'PATCH',
            path: `${base}/labels/${encodeURIComponent(label.name)}`,
            body: { new_name: label.name, color: label.color, description: label.description },
          }
        : {
            description: `Create label "${label.name}"`,
            method: 'POST',
            path: `${base}/labels`,
            body: label,
          }
    ),
  ];
}

const ghBinary = () => process.env.GH_PATH || 'gh';

function gh(args, input) {
  return execFileSync(ghBinary(), args, {
    encoding: 'utf8',
    input,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
}

function originRepo() {
  const url = execFileSync('git', ['remote', 'get-url', 'origin'], { encoding: 'utf8' }).trim();
  const match = /github\.com[/:]([^/]+\/[^/.]+?)(\.git)?$/.exec(url);
  if (!match) throw new Error(`Cannot read owner/name from origin (${url}); use --repo owner/name`);
  return match[1];
}

function main() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  const repoIndex = args.indexOf('--repo');
  const repo = repoIndex === -1 ? originRepo() : args[repoIndex + 1];
  if (!repo || !/^[\w.-]+\/[\w.-]+$/.test(repo)) throw new Error(`Invalid repository "${repo}"`);

  let existingLabels = [];
  try {
    existingLabels = JSON.parse(
      gh(['api', `repos/${repo}/labels`, '--paginate', '--jq', '[.[].name]']) || '[]'
    );
  } catch (error) {
    if (apply) throw error;
    console.warn('Could not read labels with gh (installed and logged in?); assuming none.\n');
  }
  const plan = buildPlan({ repo, existingLabels });
  console.log(`${apply ? 'Applying' : 'Dry run for'} ${repo} (${plan.length} calls)\n`);

  let failures = 0;
  for (const call of plan) {
    console.log(`${call.method} ${call.path}\n  ${call.description}`);
    if (!apply) continue;
    try {
      const request = [
        'api',
        '--method',
        call.method,
        call.path,
        '-H',
        'Accept: application/vnd.github+json',
      ];
      gh(
        call.body ? [...request, '--input', '-'] : request,
        call.body ? JSON.stringify(call.body) : undefined
      );
      console.log('  ✓ done');
    } catch (error) {
      failures++;
      const stderr =
        error instanceof Error && 'stderr' in error ? String(error.stderr).trim() : error;
      console.error(`  ✗ failed: ${stderr}`);
    }
  }

  console.log('\nManual steps (GitHub UI):');
  for (const step of MANUAL_STEPS) console.log(`  - ${step}`);
  if (!apply) console.log('\nNothing changed. Run again with --apply to configure the repository.');
  process.exitCode = failures > 0 ? 1 : 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
