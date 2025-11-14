export interface PromptUpdate {
  id: string;
  bot_id: string;
  requested_by: string;
  old_prompt: string;
  new_prompt: string;
  reason?: string | null;
  auto_applied: boolean;
  created_at: string;
}

export interface PromptUpdateCreateInput {
  new_prompt: string;
  reason?: string;
  auto_apply?: boolean;
}

export interface PromptUpdateResponse {
  status: string;
  data: PromptUpdate;
  message: string;
}

export interface PromptUpdateListResponse {
  status: string;
  data: PromptUpdate[];
  message: string;
}

export interface SandboxQueryRequest {
  query_text: string;
  custom_prompt: string;
  top_k?: number;
  min_score?: number;
  chat_history?: Array<{
    text: string;
    isUser: boolean;
    timestamp?: string;
  }>;
  include_metadata?: boolean;
}

export interface PromptGenerateRequest {
  feedback: string;
}

export interface PromptGenerateResponse {
  status: string;
  data: {
    current_prompt: string;
    updated_prompt: string;
    feedback: string;
  };
  message: string;
}

