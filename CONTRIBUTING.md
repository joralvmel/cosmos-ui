# Contributing to Cosmos UI

Thanks for helping! The full guide lives in the docs site:
[Contribute → Getting started](https://joralvmel.github.io/cosmos-ui/contribute/getting-started/)
(source: [`apps/docs/src/content/docs/contribute`](apps/docs/src/content/docs/contribute)).

## In short

1. **Setup**: Node.js 24 (`.nvmrc`) and npm 11, then `npm ci` (it also enables the Git hooks).
2. **Identity**: commit with your own Git identity. Prefer your GitHub noreply email
   (GitHub → Settings → Emails). Signing off with `git commit -s`
   ([DCO](https://developercertificate.org/)) is recommended.
3. **Branch**: fork the repository (or create a branch if you have write access) from `develop`:
   `feat|fix|docs|chore|refactor|test/<scope>-<description>`, e.g. `feat/elements-switch`.
4. **Commits**: [Conventional Commits](https://www.conventionalcommits.org/)
   (`feat(elements): add cosm-switch`), checked by the `commit-msg` hook. Never use `--no-verify`.
5. **Validate**: `npx biome ci . && npx turbo run typecheck test build`.
6. **Changeset**: `npm run changeset` for every change to `packages/*`.
7. **Pull request** to `develop` using the template. CI must be green and one approval is required.
   Pull requests are squash-merged; the PR title becomes the commit message.

| Task | Command |
| --- | --- |
| Build / test / typecheck | `npm run build` · `npm test` · `npm run typecheck` |
| One package and its dependencies | `npx turbo run typecheck test build --filter=@joralvmel/cosmos-<pkg>...` |
| Lint and blocked terms | `npm run lint` (`npm run lint:fix` to autofix) |
| Component inventory | `npm run status` |
| Generate a component, chart or theme | `npm run generate -- <target> <kebab-name>` |
| Docs site | `npm run docs` |

## Guides (docs site, English and Spanish)

| Guide | Source |
| --- | --- |
| Getting started (setup, native demo, troubleshooting) | [`getting-started.mdx`](apps/docs/src/content/docs/contribute/getting-started.mdx) |
| Working with agents (agents, skills, prompts) | [`working-with-agents.mdx`](apps/docs/src/content/docs/contribute/working-with-agents.mdx) |
| Example: from issue to release (`cosm-switch`) | [`example-switch.mdx`](apps/docs/src/content/docs/contribute/example-switch.mdx) |
| Recipes (theme, token, Figma, modify a component, chart) | [`recipes.mdx`](apps/docs/src/content/docs/contribute/recipes.mdx) |
| Git workflow | [`git-workflow.mdx`](apps/docs/src/content/docs/contribute/git-workflow.mdx) |
| Release and publishing | [`publishing.mdx`](apps/docs/src/content/docs/contribute/publishing.mdx) |

More: [AGENTS.md](AGENTS.md) (also for AI agents), [architecture decisions](docs/adr),
[component anatomy](docs/conventions/component-anatomy.md) and [SECURITY.md](SECURITY.md).
