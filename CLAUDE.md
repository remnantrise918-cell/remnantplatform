# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A single-file React application (`remnant-platform.jsx`) that generates AI-powered personal identity documents called "Remnant Profiles." Users enter their name and birthdate; the app calculates numerology/astrology data, calls the Anthropic API directly from the browser, and produces a downloadable standalone HTML file styled as a cinematic identity page.

There is no build system, package.json, test suite, or server layer in this repository. The file is designed to be dropped into a pre-configured React environment (e.g., Bolt, StackBlitz, v0, or CodeSandbox).

## Running the App

Since there is no package.json here, you need a host React environment. To use locally:

```bash
# In a new Vite + React project:
npm create vite@latest my-app -- --template react
cd my-app
cp /path/to/remnant-platform.jsx src/
# Then import and render <RemnantPlatform /> in src/main.jsx or src/App.jsx
npm run dev
```

The Anthropic API is called directly from the browser at `https://api.anthropic.com/v1/messages`. An API key must be available in the host environment or passed through. The current `fetchBlueprint` function sends requests with no `x-api-key` header — adding one is required for actual use.

## Architecture

### State Machine (Main App)

`RemnantPlatform` (default export) owns all app state and drives four sequential views via a `view` string:

```
landing → intake → generating → preview
```

- `landing`: Hero, HowItWorks, TierCards, Footer sections
- `intake`: IntakeModal overlay (collects name, DOB, optional role/mission)
- `generating`: LoadingScreen while `fetchBlueprint` runs
- `preview`: PreviewScreen with iframe preview + HTML download

### Tier System

Four tiers are defined in the `TIERS` constant. Each tier maps to:
1. A JSON schema in `SCHEMAS` — sent to Claude as the output format
2. A `build*HTML` function — produces the downloadable standalone HTML page

| Tier | Price | Builder function |
|------|-------|-----------------|
| seed | Free | `buildSeedHTML` |
| covenant | $9 | `buildCovenantHTML` |
| builder | $29 | `buildBuilderHTML` |
| legacy | $67 | `buildLegacyHTML` |

### AI Integration

`fetchBlueprint(tier, name, dob, role, mission, lp, sign, elem)` makes a direct POST to `https://api.anthropic.com/v1/messages` using model `claude-sonnet-4-20250514`. The system prompt (`SYS_BASE`) establishes the "Divine Blueprint Architect" persona. The response must be valid JSON matching the tier's schema; the function parses it and strips any accidental markdown fences.

### HTML Builders

Each `build*HTML` function returns a complete self-contained HTML document (with inline `<style>`, Google Fonts links, and all content embedded). These are not React pages — they are static deliverables users download and host anywhere. They share the `STAT()` helper (renders Life Path / Sun Sign / Element stat cards) and the `NOW()` timestamp.

### Utility Functions

- `reduce(n)` — numerological digit reduction, preserving master numbers 11, 22, 33
- `getLP(dob)` — computes Life Path number from a `YYYY-MM-DD` date string
- `getSign(dob)` — returns Western sun sign from month/day
- `ELEM`, `EICO`, `SSYM` — lookup maps for element, element icon, and sign symbol

### Styling Conventions

All styling is inline React style objects. Two shared font family objects (`cinzel`, `playfair`) are reused across components. The `G` constant holds the global color palette (dark background `#08070b`, gold accent `#d4af37`, purple accent `#c084fc` for Legacy tier). Each tier has its own `accent` color defined in `TIERS`.

## Syntax Notes

The original source contained two classes of problems that have been fixed:

1. **Unicode ellipsis spread operators** — `…cinzel` / `…playfair` / `…base` / `…style` patterns used U+2026 (`…`) instead of `...`. All style-object spreads now use three ASCII dots. String-literal ellipses (e.g., placeholder text) were intentionally left as-is.

2. **Markdown code fences inside JSX** — the main `return` block in `RemnantPlatform` was wrapped in ` ``` ` backtick fences, which is invalid JSX. These have been removed.
