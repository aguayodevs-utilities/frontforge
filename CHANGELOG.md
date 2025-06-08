# Changelog

All notable changes to this project will be documented in this file.

## [1.3.5] - 2025-06-08

### Changed

-   Updated `@aguayodevs-utilities/preact-shared` dependency to `^1.0.4` in `createPreact.ts` to ensure new Preact projects use the latest shared components.

### Fixed

-   Resolved `process.cwd()` type error in `frontforge/tsconfig.build.json` by adding `"node"` to the `lib` array.