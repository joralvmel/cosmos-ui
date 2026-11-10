---
name: publish-setup
description: 'One-time checklist to start publishing to npm: npm account with 2FA, first manual publication in dependency order, trusted publishers, GitHub environment and variables, verification.'
---

# publish-setup

Main agent: `release-manager`. Read `AGENTS.md` first.

## Inputs

- None

## Steps

1. Explain to the owner the steps that need a human (npm account, 2FA codes, npmjs.com settings); never ask for or store tokens or passwords.
2. Run `npm ci` and `npm run check-packs`; fix every manifest problem first.
3. Print `npm run publish-order` and guide the owner through `npm login` and `npm publish --access public --otp <code>` in each package folder, in that order.
4. For each package, the owner adds the trusted publisher on npmjs.com: GitHub Actions, owner `joralvmel`, repository `cosmos-ui`, workflow `release.yml`, environment `npm`; then "Require two-factor authentication and disallow tokens".
5. With `devops`: create the `npm` environment, set `COSMOS_PUBLISH_ENABLED=true` and, for the docs, Pages source "GitHub Actions" plus `COSMOS_DOCS_ENABLED=true` (`gh variable set <NAME> --body true`).
6. Verify with `npm view @joralvmel/cosmos-<pkg>` for every package and record the result in the pull request or issue.

## Files

- None in the repository (npm and GitHub settings)

## Checklist

- [ ] 2FA enabled
- [ ] All packages exist on npm
- [ ] Trusted publisher on every package
- [ ] Variables and environment set
- [ ] Verified with npm view

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
