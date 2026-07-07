# Agent skills

Project-specific agent skills for Cursor. Rules in `.cursor/rules/` point here.

## Layout

```
.agents/skills/
├── gluestack-ui-v4/     # Installed from gluestack/agent-skills (pnpm skills:install)
└── quoteflow/           # Local repo architecture skill (committed)
```

## Install / refresh Gluestack skills

From repo root:

```bash
pnpm skills:install
```

This updates `gluestack-ui-v4` and writes `skills-lock.json` at the repo root.

## Local skill: quoteflow

Read `.agents/skills/quoteflow/SKILL.md` before structural changes, new screens, or cross-package work.

## Do not edit

Avoid hand-editing files under `gluestack-ui-v4/` - reinstall with `pnpm skills:install` instead.
