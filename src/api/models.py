"""
Pydantic models for API request/response schemas
"""

import base64
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, EmailStr, Field

# ---------------------------------------------------------------------------
# Auth models
# ---------------------------------------------------------------------------


class UserRegister(BaseModel):
    name: str
    email: EmailStr
    institute: str
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class SequenceFileModel(BaseModel):
    """Model for uploaded sequence file"""

    filename: str
    content: str = Field(..., description="Base64 encoded file content")


class AnalysisRequest(BaseModel):
    """Request model for sequence analysis"""

    files: List[SequenceFileModel] = Field(..., description="List of FASTA files")
    method: str = Field(..., description="Analysis method name")
    parameters: Dict[str, Any] = Field(
        default_factory=dict, description="Method parameters"
    )


class SequenceDataResponse(BaseModel):
    """Response model for sequence data"""

    name: str
    sequence: str
    length: int


class AnalysisResponse(BaseModel):
    """Response model for analysis results"""

    success: bool
    message: str = ""
    tree_newick: Optional[str] = None
    distance_matrix: Optional[List[List[float]]] = None
    sequence_names: List[str] = []
    metadata: Dict[str, Any] = {}
    execution_time: Optional[float] = None


class MethodInfoResponse(BaseModel):
    """Response model for method information"""

    name: str
    description: str
    parameters: Dict[str, Any]


class StatusResponse(BaseModel):
    """Generic status response"""

    status: str
    message: str = ""
    data: Optional[Dict[str, Any]] = None
