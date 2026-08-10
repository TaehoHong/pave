# 07. Codebase Guide

> Agent navigation index backed by current repository evidence. This guide
> narrows source discovery; it never replaces verification against code.

## How to Use This Guide

1. Find the entries related to the requested behavior.
2. Check whether their evidence paths changed after the last commit that
   updated this guide, including staged and unstaged changes.
3. Read the target, direct callers and callees, relevant tests, and named
   canonical examples.
4. Expand the search only when ownership is missing, stale, or contradicted.

## Module Map

| Area | Paths | Responsibility | Entry points | Depends on | Tests | Evidence paths |
| --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |

## Shared Capability Catalog

Use the canonical owner instead of creating a sibling implementation.

| Capability | Canonical files or symbols | Used by | Contract or constraints | Evidence paths |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

## Code Conventions and Canonical Examples

Record conventions that are observable in current code, plus the best source
example. Do not promote a one-off pattern into a rule.

| Concern | Convention | Canonical example | Applies to | Evidence paths |
| --- | --- | --- | --- | --- |
| Naming and file layout |  |  |  |  |
| Error handling |  |  |  |  |
| Logging and observability |  |  |  |  |
| Configuration and dependency injection |  |  |  |  |
| Data validation and transformation |  |  |  |  |
| Tests and fixtures |  |  |  |  |

## Dependency and Ownership Rules

- Allowed dependency direction:
- Boundaries that must not be bypassed:
- Shared behavior that must not be reimplemented:

## Verification Map

| Area | Narrow command | Broader command | Expected result | Evidence paths |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

## Excluded Paths

| Paths | Reason | Source of truth |
| --- | --- | --- |
|  | Generated, vendored, archived, or irrelevant to normal discovery |  |

## Known Gaps

Record only verified omissions, stale entries, or areas not yet mapped.

## Troubleshooting References

Use historical records to avoid repeating an investigation, but verify their
affected paths and guards against current code before treating them as current.

| Area or boundary | Records | Current rule or guard | Evidence paths |
| --- | --- | --- | --- |
|  |  |  |  |

## Linked Sources

Existing project documentation that owns part of this subject. Keep the linked
source canonical; record only what it owns and what it leaves open.

| Source | Owns | Not covered | Evidence paths |
| --- | --- | --- | --- |
|  |  |  |  |
