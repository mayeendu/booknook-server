# Repository Guidelines

## Project Structure & Module Organization

This is a small Node.js server project using ECMAScript modules (`"type": "module"`). The current root contains `index.js` as the package entry point and `package.json` for project metadata and scripts. No source subdirectories, tests, or assets are present yet. Keep new server code in `index.js` until the project grows; then group related code into clearly named directories such as `src/`, `routes/`, or `tests/` and update the entry point accordingly.

## Build, Test, and Development Commands

There are no build or development scripts configured. The existing `npm test` script is a placeholder that exits with an error, so it is not a passing test suite. Once the server is implemented, add explicit scripts to `package.json` (for example, `"start": "node index.js"` and a real test command) and document their behavior here. Run the application with `node index.js` only after it contains a server implementation.

## Coding Style & Naming Conventions

Use modern JavaScript and ES module `import`/`export` syntax. Prefer two-space indentation, semicolons, and single quotes, matching common Node.js conventions. Use `camelCase` for variables and functions, `PascalCase` for classes, and lowercase kebab-case for filenames (for example, `book-routes.js`). Keep handlers small and separate configuration from request logic as the server expands. No formatter or linter is currently configured.

## Testing Guidelines

No testing framework or test files are configured. Add tests alongside implementation work, using a consistent pattern such as `tests/<feature>.test.js`. Choose and configure a test runner in `package.json`, then ensure `npm test` runs it successfully. Do not claim coverage requirements until the project establishes them.

## Commit & Pull Request Guidelines

Git history is unavailable in this directory, so no repository-specific commit convention can be confirmed. Use short, imperative commit subjects (for example, `Add book routes`). Pull requests should explain the change and how it was verified; include linked issue context and screenshots only when relevant to the change.

## Security & Configuration

Do not commit secrets or local environment files. Keep credentials and environment-specific settings in environment variables, and document any required variables when adding configuration.
