"""
API package for REST backend functionality
"""

from .app import create_app
from .models import *

__all__ = ["create_app"]
