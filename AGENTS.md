# AGENTS.md

This file defines the working rules for coding agents in this Expo React Native repo. Follow it unless the user explicitly gives a more specific instruction.

## Project Shape

- This is an Expo Router React Native app.
- Route files live under `app/`.
- Role-specific flows live under `app/(sender)` and `app/(traveller)`.
- Tab screens live under `app/(tabs)`.
- Shared UI belongs in `components/ui`.
- Shared form or feature screens belong in `components/forms/<feature>`.
- API calls belong in `services`.
- Shared state belongs in `context`.
- Reusable domain types belong in `types`.

Keep route files thin. A route should read params, call navigation, and pass props into a presentational component. Put layout-heavy UI in `components/forms/...` or another shared component folder.

## Theme Rules

- Import theme tokens with `import { Theme } from "@/constants/Theme";`.
- Use `Theme.colors`, `Theme.spacing`, `Theme.borderRadius`, `Theme.typography`, and `Theme.screenPadding` instead of hard-coded values.
- Do not introduce new raw colors unless one of these is true:
  - The exact color already appears as an established local pattern.
  - The color is added to `constants/Theme.tsx` first.
  - The user provides a design reference that requires it.
- Primary brand color is `Theme.colors.primary` (`#163330`).
- Accent/action color is `Theme.colors.yellow` (`#CDFF00`).
- Default app background is `Theme.colors.background.secondary`.
- Default card background is `Theme.colors.white`.
- Default body text is `Theme.colors.text.dark`.
- Secondary text uses `Theme.colors.text.gray` or `Theme.colors.text.lightGray`.

## Typography

- Use the loaded Inter fonts from `app/_layout.tsx`:
  - `Inter-Regular`
  - `Inter-SemiBold`
  - `Inter-Bold`
  - `Inter-Italic`
- Prefer explicit `fontFamily` over `fontWeight` for app UI.
- Do not use unregistered font names such as `inter` or `Figtree-*` in new code.
- Keep text compact inside cards, tabs, buttons, and headers. Do not use hero-sized type inside operational screens.
- Do not use negative `letterSpacing` in new UI unless matching an existing screen exactly.

## Design Structure

- Build operational screens as quiet, scannable app surfaces, not landing pages.
- Standard screen background: light neutral background with white cards.
- Standard card shape: white background, `Theme.borderRadius.md` or nearby established radius, subtle shadow/elevation.
- Standard list card layout:
  - Left circular icon/avatar.
  - Middle title, subtitle, optional detail.
  - Right status/meta/rating.
- Standard top tabs:
  - Compact pill buttons.
  - Active pill uses `Theme.colors.yellow`.
  - Inactive pill uses a neutral gray background.
  - Text uses Inter and must fit on one line when possible.
- Use `Ionicons` from `@expo/vector-icons` for icon buttons and list/card icons.
- Do not nest cards inside cards.
- Do not add decorative gradients, bokeh/orb backgrounds, or marketing-style hero sections to app workflow screens.
- Ensure mobile text does not overflow or overlap. Use stable heights, padding, and flex behavior for tabs/cards/toolbars.

## Navigation

- Use Expo Router route groups consistently:
  - Sender routes: `/(sender)/...`
  - Traveller routes: `/(traveller)/...`
  - Tab routes: `/(tabs)/...`
- Register new stack screens in the matching `_layout.tsx`.
- Prefer object navigation:

```ts
router.push({
  pathname: "/(sender)/shipmentDetails",
  params: { shipmentId },
});
```

- For role-aware screens, branch once by role and keep route targets explicit.
- When tab categories represent different data schemas, use discriminated unions with a `kind` field and route each kind explicitly.

## TypeScript And Data

- Avoid `any`.
- Use discriminated unions for heterogeneous lists.
- Keep mock data typed.
- Normalize mixed schemas only at the rendering boundary.
- Keep route params string-safe. Convert non-string values before passing them through `router.push`.
- Prefer small helper functions for:
  - selecting role-specific tabs,
  - mapping category data to card display models,
  - building route params.

## Component Rules

- Prefer presentational components with clear props.
- Keep side effects in route screens, contexts, or hooks.
- Reuse `components/ui/CustomButton` for primary/secondary actions where it fits.
- Keep shared detail screens generic only when the layouts are genuinely the same. If the behavior diverges, create a role/category-specific wrapper route.
- Add comments only for non-obvious logic.

## File And Edit Hygiene

- Use ASCII in new files unless the surrounding file already uses Unicode for a clear reason.
- Do not reformat unrelated files.
- Do not revert user changes.
- Keep changes scoped to the user request.
- If full-project checks fail because of unrelated existing issues, report those files clearly.

## Verification

For changed TypeScript/React Native files, run targeted lint when feasible:

```bash
npx eslint path/to/file.tsx
```

For broader changes, run:

```bash
npx tsc --noEmit --pretty false
npm run lint
```

If either full check fails on unrelated existing issues, do not fix unrelated code unless the user asks. Report the failures and confirm the targeted changed-file check result.
