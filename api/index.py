import sys
import os

# Make backend/ importable from the repo root
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "backend"))

from main import app  # noqa: F401  (Vercel looks for `app`)
