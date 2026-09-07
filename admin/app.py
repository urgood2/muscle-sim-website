#!/usr/bin/env python3
"""Compatibility launcher. QuickPost owns the composer and all publishing."""
import sys

try:
    from quickpost.cli import main
except ImportError:
    sys.exit("Install the QuickPost repository with pip install /path/to/quickpost, then run python admin/app.py.")

if __name__ == "__main__":
    main()
