"""
Plugin initialization and registration.
"""

from .cgr_plugin import CGRProcessor
from .dptm_plugin import DPTMProcessor
from .ptm_plugin import PTMProcessor
from .tm_plugin import TMProcessor

__all__ = ["DPTMProcessor", "CGRProcessor", "TMProcessor", "PTMProcessor"]
