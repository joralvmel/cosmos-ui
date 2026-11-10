import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

/**
 * Applies planned operations under `root`. All checks run before writing, so a failing plan
 * (existing file, missing anchor) leaves the repository untouched.
 */
export function apply(root, operations, { dryRun = false } = {}) {
  const files = new Map();
  const read = path => {
    if (!files.has(path)) {
      const full = join(root, path);
      if (!existsSync(full)) throw new Error(`Missing file: ${path}`);
      files.set(path, readFileSync(full, 'utf8').replace(/\r\n/g, '\n'));
    }
    return files.get(path);
  };

  for (const op of operations) {
    switch (op.type) {
      case 'create':
        if (existsSync(join(root, op.path)) || files.has(op.path)) {
          throw new Error(`Refusing to overwrite ${op.path}`);
        }
        files.set(op.path, op.content);
        break;
      case 'append':
        files.set(op.path, `${read(op.path).replace(/\n*$/, '\n')}${op.content}`);
        break;
      case 'prepend':
        files.set(op.path, `${op.content}${read(op.path)}`);
        break;
      case 'insert': {
        const content = read(op.path);
        const match = op.before.exec(content);
        if (!match) throw new Error(`Anchor ${op.before} not found in ${op.path}`);
        files.set(
          op.path,
          `${content.slice(0, match.index)}${op.content}${content.slice(match.index)}`
        );
        break;
      }
      case 'json': {
        const updated = op.update(JSON.parse(read(op.path)));
        files.set(op.path, `${JSON.stringify(updated, null, 2)}\n`);
        break;
      }
      default:
        throw new Error(`Unknown operation ${op.type}`);
    }
  }

  if (!dryRun) {
    for (const [path, content] of files) {
      mkdirSync(dirname(join(root, path)), { recursive: true });
      writeFileSync(join(root, path), content);
    }
  }
  return [...files.keys()];
}
