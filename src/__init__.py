"""
Package initialization and imports for the new architecture.
"""

import os
import sys

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Adapters
from src.adapters import BioPythonSequenceLoader, MatplotlibTreeVisualizer
# Core components
from src.core import (AnalysisResult, AnalysisService, ISequenceLoader,
                      ISequenceProcessor, ITreeVisualizer, MethodConfig,
                      SequenceData, plugin_registry)
# Plugins
from src.plugins import CGRProcessor, DPTMProcessor, PTMProcessor, TMProcessor
# Utilities
from src.utils import app_config, resource_path

# UI components are imported only when needed (see main.py)
# from src.ui import AnalysisWindow, MainWindow, create_application, main
# This allows the API server to run without PyQt6/GUI dependencies

__version__ = "1.0.0"
__author__ = "BAU Research Team"
__description__ = "DNA Sequence Similarity Analysis with Plugin Architecture"

__all__ = [
    # Core
    "AnalysisService",
    "plugin_registry",
    "ISequenceProcessor",
    "ISequenceLoader",
    "ITreeVisualizer",
    "SequenceData",
    "AnalysisResult",
    "MethodConfig",
    # Plugins
    "DPTMProcessor",
    "CGRProcessor",
    "TMProcessor",
    "PTMProcessor",
    # Adapters
    "BioPythonSequenceLoader",
    "MatplotlibTreeVisualizer",
    # Utils
    "app_config",
    "resource_path",
    # UI components available via: from src.ui import MainWindow, AnalysisWindow, etc.
]

# Initialize the phylo directory on import
from src.utils.resources import get_phylo_tree_directory

get_phylo_tree_directory()
