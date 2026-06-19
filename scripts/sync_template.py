#!/usr/bin/env python3
"""Sync PAVE runtime templates into a repository.

This currently uses the same copy behavior as init_repo.py. Existing
files are preserved unless --force is passed.
"""

from __future__ import annotations

from init_repo import main


if __name__ == "__main__":
    raise SystemExit(main())
