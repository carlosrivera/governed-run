# governed.run

Astro static site for governed.run and the Continuous Software Generation thesis.

The site includes a concrete CSG artifact registry under `public/artifacts/` so the manifesto links to production-oriented policy, hook, skill, system prompt, loop-pattern, and validator files.

## Artifact registry

- `public/artifacts/manifest.json` is the machine-readable artifact manifest.
- `public/artifacts/hooks/` contains lifecycle hooks.
- `public/artifacts/skills/` contains production agent skills with intake requirements, blocked actions, validator rules, and evidence envelopes.
- `public/artifacts/system-prompts/` contains repository-level prompts such as `AGENTS.md`.
- `public/artifacts/policies/`, `validators/`, and `loop-patterns/` contain governance examples.

The homepage includes a static local intake control that inspects a selected artifact in the browser and produces a review envelope. It does not upload files to a server yet.
The manifesto remains on `/`; the artifact hub, catalog, and local submission review live on `/hub/`.

## Development

```sh
bun install
bun run dev
```

## Build

```sh
bun run build
```

The site is configured for GitHub Pages with `public/CNAME` set to `governed.run`.
