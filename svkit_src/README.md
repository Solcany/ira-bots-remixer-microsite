# IRA bot remixer (SvelteKit)

Svelte 5 + TypeScript port of the 2019 prototype in `../src`, keeping PixiJS (now v8) for the canvas and its glitch/fade transitions.

```sh
pnpm install
pnpm dev        # dev server
pnpm check      # svelte-check / types
pnpm test       # vitest
pnpm build      # static site in build/ (adapter-static)
```

To serve from a sub-path (e.g. a portfolio page), set `paths.base` in `vite.config.ts`; all asset URLs go through `asset()` / `resolve()` from `$app/paths`.

## Structure

Primitive leaves take props and report events through callbacks; smart parents own state and decide what happens.

```
routes/
  +layout.svelte            header, fonts, background music
  +page.svelte              intro (smart)
  stage/+page.svelte        the brain: owns the Remixer, wires the canvas, panel and step nav
lib/
  remixer.svelte.ts         step flow, chosen bot, hover preview, busy guard, localStorage
  packing.ts, sample.ts     pure helpers (tested)
  content.ts                panel copy
  stage/config.ts           sizes, counts, colours, text styles
  pixi/context.ts           parent-container context for Pixi primitives
  pixi/glitch.ts            the pick transition (glitch + pixelate)
  components/
    ui/                     DOM primitives: Button, StepItem, DragHandle, DraggablePanel, Loader, …
    stage/StepNav.svelte    footer step bar
    pixi/                   Pixi primitives (render no DOM): PixiApp, Layer, Sprite, Label, Rings
    canvas/                 PhotoField, WordField, BotCard, and StageCanvas (owns Pixi app, assets, layout)
```

Pixi primitives attach their display object to the nearest `Layer`/`PixiApp` from context. They stay mounted and are toggled with props (`visible`, `interactive`), so draw order follows markup order and layers can fade out.
