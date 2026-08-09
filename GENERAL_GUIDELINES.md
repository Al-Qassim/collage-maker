# General Software Development Guidelines

These guidelines are intended to be reusable across projects rather than tied to one application or domain.

## Architecture and Boundaries

- Separate domain models, data services, UI components, and UI logic into clear top-level areas.
- Keep domain models independent of React, browser APIs, persistence details, and presentation concerns.
- Do not confuse domain models with screen state, view models, or component props.
- Give each public model or contract its own clearly named file.
- Expose persistence and external capabilities through public service interfaces.
- Put browser-specific, platform-specific, and infrastructure implementations behind those interfaces.
- Inject services into application logic instead of importing global APIs such as `localStorage` directly.
- Keep reducers pure. Put side effects in commands or service implementations.
- Command implementations should dispatch reducer actions and depend on service interfaces, not concrete infrastructure classes.
- Preserve existing behavior while reorganizing code; architectural refactoring should not silently remove features.

## Public APIs and Folder Structure

- Keep high-priority concepts and public contracts shallow and easy to discover.
- Place lower-priority implementation details in deeper, purpose-specific folders.
- Prefer shallow files for screen state, command interfaces, providers, and service contracts.
- Place reducers, command implementations, interactions, storage adapters, and helper algorithms below their public contracts.
- Avoid redundant feature directories when the surrounding application already provides sufficient context.
- Name files and concepts according to established terminology when one exists.

## UI Components

- Keep UI components focused on one responsibility.
- Avoid oversized screen components and split independent sections into dedicated components.
- Avoid deeply nested JSX. Extract helpers or child components when structure becomes difficult to scan.
- Avoid passing excessive unrelated parameters. Group related data into explicit view and action contracts when appropriate.
- Keep UI functions at roughly four indentation levels or fewer where practical.
- When a component has separate styles, colocate the component and its CSS module in the same dedicated folder.
- Use CSS modules for component-specific styling.
- Reserve global CSS for genuine global concerns such as resets, typography, design tokens, and document-level behavior.
- Hide controls when their action is unavailable rather than displaying controls that do nothing.
- Constrain potentially unbounded content and make it independently scrollable so later controls remain accessible.
- Put first-row and last-row spacing inside scrollable content when that spacing should scroll away with the content.

## State, Commands, and History

- Define screen state and command interfaces explicitly.
- Let reducers describe state transitions and commands coordinate user intent, side effects, and persistence.
- Treat continuous controls such as sliders and drag gestures as transactions:
  1. Create one history checkpoint when adjustment begins.
  2. Apply transient updates without adding history entries while the interaction is active.
  3. Commit and persist only the final value when the interaction ends.
- Preserve live visual feedback during transient updates.
- Make one continuous gesture correspond to one undo/redo operation.
- Ensure undo and redo also keep persisted state consistent when persistence is involved.
- Use stable, explicit defaults and normalize persisted data before using it.

## Services and Persistence

- Access local persistence through an application-facing interface.
- Group related service interfaces when the application needs to inject several capabilities together.
- Keep serialization, browser storage keys, downloads, and platform APIs inside infrastructure implementations.
- Do not make UI command implementations directly responsible for browser-specific mechanics.
- Persist explicit user choices and let those choices take precedence over inferred defaults.
- Avoid unnecessary persistence writes during high-frequency interactions.

## Defaults and Preferences

- Use system preferences as first-launch defaults when appropriate, such as light or dark appearance.
- Infer locale-sensitive defaults from browser locale information when reliable enough for the product.
- Fall back safely when locale or platform APIs are unavailable or malformed.
- Once users explicitly choose a preference, preserve it instead of repeatedly overriding it with system inference.

## Localization and Directionality

- Localize user-facing labels rather than scattering hard-coded strings throughout components.
- Apply document direction according to the selected language.
- Scope directionality carefully: an RTL interface does not imply that every visual workspace or spatial model should become RTL.
- Keep direction-sensitive UI behavior separate from direction-independent domain behavior.

## Interaction Semantics

- Use conventional names for conventional behavior, such as “cover” or “aspect fill” for proportional scaling that fills a container.
- Keep previews and exported output consistent by sharing the same transformation semantics.
- Make snapping thresholds explicit constants and keep snapping logic isolated and testable.
- Ensure controls reflect the current structural context and do not expose impossible operations.

## Quality and Delivery

- Format changed files consistently.
- Run static type checking and a production build before considering work complete.
- Keep public documentation up to date with setup, architecture, validation, and deployment instructions.
- Initialize projects with an appropriate `.gitignore` and meaningful commits.
- Automate repeatable deployment through CI when the application is hosted.
- Verify the deployed result rather than assuming a successful push means the site is available.
