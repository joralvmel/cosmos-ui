import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { checkFiles, compile, findMatches, loadTerms, parseTerms } from '../check-terms.mjs';
import { checkMessage } from '../git/check-commit-msg.mjs';
import { checkIdentity, checkLog, isBot, loadIdentity } from '../git/check-identity.mjs';

let dir;
afterEach(() => {
  if (dir) rmSync(dir, { recursive: true, force: true });
  dir = undefined;
});

describe('check-terms', () => {
  it('parses lists with comments, commas and blank lines', () => {
    expect(parseTerms('# comment\nalpha, beta\n\n gamma ')).toEqual(['alpha', 'beta', 'gamma']);
  });

  it('prefers the environment over the local file', () => {
    dir = mkdtempSync(join(tmpdir(), 'cosmos-terms-'));
    mkdirSync(join(dir, '.local'));
    writeFileSync(join(dir, '.local', 'blocked-terms.txt'), 'local-term');
    expect(loadTerms({ env: {}, root: dir })).toEqual(['local-term']);
    expect(loadTerms({ env: { COSMOS_BLOCKED_TERMS: 'env-term' }, root: dir })).toEqual([
      'env-term',
    ]);
  });

  it('matches whole tokens case-insensitively and reports term numbers only', () => {
    const patterns = compile(['acme', '#a1b2c3']);
    expect(findMatches('Acme-button\nacmeish\nColor: #A1B2C3;', patterns)).toEqual([
      { line: 1, term: 1 },
      { line: 3, term: 2 },
    ]);
  });

  it('checks file paths and contents', () => {
    dir = mkdtempSync(join(tmpdir(), 'cosmos-terms-'));
    writeFileSync(join(dir, 'acme-notes.md'), 'nothing here');
    writeFileSync(join(dir, 'ok.md'), 'made by ACME');
    expect(checkFiles(dir, ['acme-notes.md', 'ok.md'], compile(['acme']))).toEqual([
      { file: 'acme-notes.md', line: 0, term: 1 },
      { file: 'ok.md', line: 1, term: 1 },
    ]);
  });
});

describe('check-identity', () => {
  const me = { name: 'dev', email: 'dev@example.com', githubLogin: 'dev' };

  it('does not block anyone when there is no local identity file', () => {
    dir = mkdtempSync(join(tmpdir(), 'cosmos-identity-'));
    expect(loadIdentity(dir)).toBeUndefined();
    expect(checkIdentity({ name: 'Anyone', email: 'anyone@example.org' }, undefined)).toEqual([]);
  });

  it('reads and validates the local identity file', () => {
    dir = mkdtempSync(join(tmpdir(), 'cosmos-identity-'));
    mkdirSync(join(dir, '.local'));
    writeFileSync(join(dir, '.local', 'git-identity.json'), JSON.stringify(me));
    expect(loadIdentity(dir)).toEqual(me);
    writeFileSync(join(dir, '.local', 'git-identity.json'), JSON.stringify({ name: 'dev' }));
    expect(() => loadIdentity(dir)).toThrow(/"email"/);
  });

  it('requires the identity of the local file when it exists', () => {
    expect(checkIdentity({ name: 'dev', email: 'DEV@example.com' }, me)).toEqual([]);
    expect(checkIdentity({ name: 'Other', email: 'other@example.org' }, me)).toHaveLength(2);
  });

  it('recognizes bots and GitHub web commits', () => {
    expect(isBot('dependabot[bot]', '49699333+dependabot[bot]@users.noreply.github.com')).toBe(
      true
    );
    expect(isBot('GitHub', 'noreply@github.com')).toBe(true);
    expect(isBot('dev', 'dev@example.com')).toBe(false);
  });

  it('flags commit emails that contain blocked terms and ignores bots', () => {
    const patterns = compile(['acme']);
    const lines = [
      'aaaaaaaaaaaa|dev|dev@example.com|dev|dev@example.com',
      'bbbbbbbbbbbb|dev|dev@acme.test|GitHub|noreply@github.com',
      'cccccccccccc|bot[bot]|1+bot[bot]@users.noreply.github.com|dev|dev@mail.acme.test',
    ];
    expect(checkLog(lines, patterns)).toEqual([
      'bbbbbbbbbb author email matches blocked term #1',
      'cccccccccc committer email matches blocked term #1',
    ]);
  });
});

describe('check-commit-msg', () => {
  it.each([
    'feat(elements): add cosm-switch',
    'feat(mcp,cli): add tools',
    'fix: handle empty values',
    'chore!: drop old API',
    'chore(deps): bump lit',
    'Merge branch develop',
  ])('accepts %j', message => {
    expect(checkMessage(message)).toBe(true);
  });

  it.each(['added stuff', 'feat: ', 'feature(x): y', 'feat(UI): y'])('rejects %j', message => {
    expect(checkMessage(message)).toBe(false);
  });
});
