import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { labels, packages } from '../github/labels.mjs';
import { buildPlan, MANUAL_STEPS, requiredChecks } from '../github/setup-repo.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const labelNames = new Set(labels.map(label => label.name));
const workflows = readdirSync(join(root, '.github/workflows')).map(file =>
  read(`.github/workflows/${file}`)
);

describe('setup-repo plan', () => {
  const plan = buildPlan({ repo: 'owner/name', existingLabels: ['type:bug'] });

  it('protects main and develop with reviews, required checks and no force push', () => {
    for (const branch of ['main', 'develop']) {
      const call = plan.find(
        item => item.path === `repos/owner/name/branches/${branch}/protection`
      );
      expect(call?.method).toBe('PUT');
      expect(call?.body.required_pull_request_reviews.required_approving_review_count).toBe(1);
      expect(call?.body.required_status_checks.contexts).toEqual(requiredChecks);
      expect(call?.body.allow_force_pushes).toBe(false);
    }
  });

  it('enables squash and merge commits, deletes merged branches and targets develop', () => {
    const repo = plan.find(item => item.path === 'repos/owner/name' && item.method === 'PATCH');
    expect(repo?.body).toMatchObject({
      allow_squash_merge: true,
      allow_merge_commit: true,
      allow_rebase_merge: false,
      delete_branch_on_merge: true,
      default_branch: 'develop',
    });
  });

  it('creates missing labels and updates existing ones', () => {
    expect(plan.find(item => item.description === 'Update label "type:bug"')?.method).toBe('PATCH');
    expect(plan.find(item => item.description === 'Create label "pkg:core"')?.method).toBe('POST');
    expect(plan.filter(item => item.description.includes('label'))).toHaveLength(labels.length);
  });

  it('documents the settings that need the GitHub UI', () => {
    expect(MANUAL_STEPS.join('\n')).toMatch(/COSMOS_BLOCKED_TERMS/);
  });

  it('requires only checks that exist as workflow job names', () => {
    for (const check of requiredChecks) {
      expect(
        workflows.some(text => text.includes(`name: ${check}`)),
        check
      ).toBe(true);
    }
  });
});

describe('labels', () => {
  it('has one label per package directory', () => {
    const dirs = readdirSync(join(root, 'packages'), { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)
      .sort();
    expect([...packages].sort()).toEqual(dirs);
  });

  describe('release workflow', () => {
    it('uses the Changesets v2 input names for versioning and publishing', () => {
      const workflow = read('.github/workflows/release.yml');
      const step = workflow.split('uses: changesets/action@v2')[1]?.split('\n        env:')[0];
      expect(step).toBeDefined();
      expect(step).toContain('version-script: npm run version-packages');
      expect(step).toContain('publish-script: npm run release');
      expect(step).toContain('pr-title: "chore: version packages"');
      expect(step).toContain('commit-message: "chore: version packages"');
      expect(step).toContain('create-github-releases: true');
      expect(step).not.toMatch(/^\s+(version|publish|title|commit|createGithubReleases):/m);
    });
  });

  it('only uses known labels in the labeler, issue templates and Dependabot', () => {
    const used = [
      ...read('.github/labeler.yml').matchAll(/^'([^']+)':$/gm),
      ...read('.github/ISSUE_TEMPLATE/bug_report.yml').matchAll(/'([a-z]+:[a-z]+)'/g),
      ...read('.github/ISSUE_TEMPLATE/component_request.yml').matchAll(/'([a-z]+:[a-z]+)'/g),
    ].map(match => match[1]);
    const dependabot = [...read('.github/dependabot.yml').matchAll(/labels: \[(.*)\]/g)].flatMap(
      match => match[1].split(',').map(item => item.trim().replace(/^['"]|['"]$/g, ''))
    );
    for (const name of [...used, ...dependabot]) expect(labelNames, name).toContain(name);
  });
});
