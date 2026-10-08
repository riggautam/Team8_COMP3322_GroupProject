# Frontend Agent Instructions

Read the repository-root `AGENTS.md` first and follow it along with these frontend-specific practices.

## React and JavaScript
- Follow standard JavaScript and React practices, keeping code simple, readable, and consistent with nearby code.
- Prefer `async`/`await` for asynchronous operations. Use `.then()`, `.catch()`, and `.finally()` when they fit the API or flow better; handle errors explicitly.
- Extract reusable behavior into custom hooks when appropriate, especially internal API calls. API hooks should expose the relevant state (such as `data`, `error`, and `isLoading`) and handle loading, errors, and cleanup consistently.
- Reuse existing project hooks and components before adding new ones. Extract repeated or independently reusable UI (for example, dropdowns, URL inputs, navigation, buttons, and common form controls) into components with clear props; avoid abstractions for one-off UI.
- Reuse the project's shared colors and design tokens. Use the palette in `global.css` when it is available; do not introduce duplicate or conflicting color values.

## Performance and UX
- Include straightforward optimizations where they improve the experience: lazy-load appropriate routes or large components, avoid unnecessary re-renders and repeated work, and keep assets reasonable.
- Keep optimizations proportional to the feature; avoid complexity without a clear benefit.
- Cover loading, error, empty, and relevant responsive states for user-facing features.

## UI Design and Structure
- Keep the visual design simple and minimal. Do not add unnecessary effects, shadows, gradients, or decoration; add them only when explicitly requested or when they serve a clear design purpose.
- Before building a page or feature, think through the semantic DOM structure and component hierarchy. Use appropriate HTML elements and avoid wrapper elements that do not add meaning or functionality.
- Do not add layers of `div` elements just to force margins or formatting. Prefer clear layout structure and maintainable CSS so spacing and responsive behavior remain easy to adjust.
- Use REM fontsize
