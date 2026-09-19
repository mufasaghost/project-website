# Astro Starter Kit: Minimal

```
npm init astro -- --template minimal
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/minimal)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command           | Action                                       |
|:----------------  |:-------------------------------------------- |
| `npm install`     | Installs dependencies                        |
| `npm run dev`     | Starts local dev server at `localhost:3000`  |
| `npm run build`   | Build your production site to `./dist/`      |
| `npm run preview` | Preview your build locally, before deploying |

## 👀 Want to learn more?

Feel free to check [our documentation](https://github.com/withastro/astro) or jump into our [Discord server](https://astro.build/chat).

## Jev (TypeSafe AI)

This repo is currently a static site with no server-side handler (contact
form, API route, etc.) to hang a real classification use case on. So Jev —
[TypeSafe AI](https://typesafe.ai)'s fast, typed-decision model — is wired
in as a small, isolated, ready-to-use module rather than forced into a page:

- `src/lib/jev.ts` — the wrapper (`askJev`). Lazily imports
  `@typesafe-ai/sdk`, reads `TYPESAFE_API_KEY` from the environment only,
  and degrades gracefully (a clear `JevUnavailableError`, never a crash) if
  the package isn't installed or the key isn't set.
- `src/lib/jev.example.ts` — a worked example (contact-message triage) for
  when this site gets a real form/API handler to plug it into.

Set `TYPESAFE_API_KEY` in the environment to use it; see the
[docs](https://docs.typesafe.ai/) for details.
