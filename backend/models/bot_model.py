from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, Dict, Any, Literal


class LLMConfigModel(BaseModel):
    """LLM configuration model"""
    temperature: float = Field(
        default=0.7,
        ge=0.0,
        le=2.0,
        description="Temperature for LLM responses (0.0-2.0)"
    )
    max_tokens: int = Field(
        default=1000,
        ge=1,
        le=4000,
        description="Maximum tokens for LLM responses"
    )
    model_name: str = Field(
        default="gpt-4o",
        description="LLM model name"
    )


class BotCreateModel(BaseModel):
    """Model for creating a new bot"""
    name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Bot name"
    )
    description: Optional[str] = Field(
        None,
        max_length=500,
        description="Bot description"
    )
    system_prompt: str = Field(
        default="You are an intelligent assistant. Answer user queries using the provided context. If you're not sure, say \"I'm not sure, but you can check this page: [link].\" Always include citations when referring to a source. Keep tone friendly and professional.",
        min_length=1,
        description="System prompt for the bot"
    )
    llm_provider: Literal["openai", "gemini"] = Field(
        default="openai",
        description="LLM provider (openai or gemini)"
    )
    llm_config: LLMConfigModel = Field(
        default_factory=lambda: LLMConfigModel(),
        description="LLM configuration"
    )
    retention_days: int = Field(
        default=90,
        ge=1,
        le=3650,
        description="Query log retention period in days (1-3650)"
    )

    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Bot name cannot be empty")
        return v.strip()


class BotUpdateModel(BaseModel):
    """Model for updating a bot"""
    name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=100,
        description="Bot name"
    )
    description: Optional[str] = Field(
        None,
        max_length=500,
        description="Bot description"
    )
    system_prompt: Optional[str] = Field(
        None,
        min_length=1,
        description="System prompt for the bot"
    )
    llm_provider: Optional[Literal["openai", "gemini"]] = Field(
        None,
        description="LLM provider (openai or gemini)"
    )
    llm_config: Optional[LLMConfigModel] = Field(
        None,
        description="LLM configuration"
    )
    retention_days: Optional[int] = Field(
        None,
        ge=1,
        le=3650,
        description="Query log retention period in days (1-3650)"
    )

    @field_validator('name')
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            if not v or not v.strip():
                raise ValueError("Bot name cannot be empty")
            return v.strip()
        return v


class BotResponseModel(BaseModel):
    """Response model for bot data"""
    id: str = Field(..., description="Bot ID")
    org_id: Optional[str] = Field(None, description="Organization ID")
    name: str = Field(..., description="Bot name")
    description: Optional[str] = Field(None, description="Bot description")
    system_prompt: str = Field(..., description="System prompt")
    llm_provider: str = Field(..., description="LLM provider")
    llm_config: Dict[str, Any] = Field(..., description="LLM configuration")
    retention_days: int = Field(..., description="Retention days")
    created_by: str = Field(..., description="Creator user ID")
    created_at: str = Field(..., description="Creation timestamp")
    updated_at: str = Field(..., description="Last update timestamp")

    model_config = ConfigDict(from_attributes=True)


class BotListResponseModel(BaseModel):
    """Response model for bot list"""
    status: str = Field(default="success", description="Response status")
    data: list[BotResponseModel] = Field(..., description="List of bots")
    message: Optional[str] = Field(None, description="Response message")


class BotResponse(BaseModel):
    """Standard bot response wrapper"""
    status: str = Field(default="success", description="Response status")
    data: BotResponseModel = Field(..., description="Bot data")
    message: Optional[str] = Field(None, description="Response message")

