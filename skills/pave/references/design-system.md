# Design System Compliance

## Purpose

Keep user-visible work consistent with the project's existing design system
instead of introducing one-off styles, components, or interaction patterns.

## Applies When

Apply this reference whenever a change alters a user-visible surface,
regardless of whether the request is a feature, bug fix, refactor, or small
edit:

- screens, routes, pages, layouts, or navigation;
- components, styles, themes, tokens, icons, or motion;
- form controls and their empty, loading, error, or disabled states;
- responsive behavior, spacing, typography, or color;
- placement, labels, and formatting of user-facing copy.

Backend, build, or tooling changes that render nothing are out of scope even
when they support a UI feature.

## Source of Truth

Resolve the design system in this order and stop at the first source that
exists:

1. durable repo design policy, including `docs/04-design-rules.md` when present;
2. repo design-system artifacts: design token or theme files, CSS variables,
   framework theme configuration, a shared component library directory, a style
   guide, or component stories;
3. the design system the repo already depends on or vendors;
4. the nearest existing canonical screen or component of the same kind.

Name the resolved source and one canonical example with file and line before
writing UI code. This is `repo-evidenced` context, not an assumption, and it is
not a user question.

When no design system exists, state that, follow the nearest existing
convention, and do not start a second parallel system. Introducing a new design
system is a material user-owned decision.

## Compliance Rules

- Reuse an existing component before creating a new one. Extend it at its
  shared owner instead of forking a near-duplicate.
- Use existing tokens for color, spacing, typography, radius, border, shadow,
  z-index, breakpoint, and motion. Do not hardcode a literal value that an
  existing token already covers.
- Follow the system's existing variant, size, and state vocabulary rather than
  introducing parallel names for the same concept.
- Cover the states the system defines for that component kind: default, hover,
  focus, active, disabled, loading, empty, and error.
- Keep the accessibility baseline: semantic elements, labeled controls, a
  working keyboard path, visible focus, sufficient contrast, and adequate target
  size.
- Use the system's breakpoints for responsive behavior.
- Follow existing product terminology, tone, and locale, number, and date
  formatting for user-facing copy.
- Place a genuinely new shared component, token, or variant at the shared owner
  using the system's own structural conventions, not inline at one call site.

## Deviation Gate

A deviation from the resolved design system is a material user-owned decision.
Do not apply one silently. Record it in the decision ledger with:

- the rule being broken and the resolved source it comes from;
- why the system cannot express the requirement;
- the smallest deviation that satisfies the requirement;
- whether the deviation stays local or should become a system change.

A user-visible edit that needs a new component, token, or variant, or any
deviation, is not an obvious low-risk change and uses the standard workflow.

## Compliance Gate

Confirm each item before claiming a user-visible change is complete:

- the resolved source of truth and a canonical example are named;
- reused components and tokens are cited with file evidence;
- no new hardcoded value duplicates an existing token;
- required states and the accessibility baseline are covered;
- responsive behavior uses the system's breakpoints;
- every deviation is recorded and user-confirmed;
- visual verification evidence exists, or its absence is reported as residual
  risk.

## Blocked Conditions

- Competing design systems own the same surface and the user has not chosen one.
- The requirement cannot be met without an unconfirmed deviation.
- No design-system source resolves and no existing convention covers the
  surface.
- Visual verification requires unavailable services, credentials, or devices.
