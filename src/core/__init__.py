"""
Core package initialization - imports and exports for the core functionality
"""

from .analysis_service import AnalysisService
from .interfaces import (AnalysisResult, IPluginRegistry, IProgressCallback,
                         ISequenceLoader, ISequenceProcessor, ITreeVisualizer,
                         MethodConfig, SequenceData)
from .plugin_loader import PluginLoader, plugin_loader
from .plugin_registry import PluginRegistry, plugin_registry

__all__ = [
    "ISequenceProcessor",
    "ISequenceLoader",
    "ITreeVisualizer",
    "IProgressCallback",
    "IPluginRegistry",
    "SequenceData",
    "AnalysisResult",
    "MethodConfig",
    "plugin_registry",
    "PluginRegistry",
    "AnalysisService",
    "plugin_loader",
    "PluginLoader",
]
