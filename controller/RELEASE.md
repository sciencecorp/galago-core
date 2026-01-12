# Releasing New Versions

This document explains how to release new versions of Galago Controller.

## Version Format

We use [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

| Type      | When to use                                        | Example           |
| --------- | -------------------------------------------------- | ----------------- |
| **PATCH** | Bug fixes, small tweaks that don't change behavior | `0.1.0` → `0.1.1` |
| **MINOR** | New features, non-breaking changes                 | `0.1.0` → `0.2.0` |
| **MAJOR** | Breaking changes, major rewrites                   | `0.1.0` → `1.0.0` |

## How to Release

From the `controller/` directory:

```bash
# Bug fix release
npm version patch

# New feature release
npm version minor

# Breaking change release
npm version major
```

This updates `version` in `package.json` and creates a local git commit.

Then push to main:

```bash
git push
```

**Tags are created automatically** - A GitHub Actions workflow creates and pushes the tag when version changes are pushed to `main`.

## Version Checking

The app automatically checks for updates on startup by comparing the local version against the latest `package.json` on the `main` branch. Users see a toast notification if a newer version is available.

## Pre-release Checklist

Before releasing:

- [ ] All tests pass (`npm run test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Changes are merged to `main`
