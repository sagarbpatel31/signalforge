import os
import sys

# Make the backend package root importable as `app.*` regardless of pytest's cwd.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
