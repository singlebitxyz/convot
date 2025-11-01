// =====================================================
// WIDGET TOKEN TYPE DEFINITIONS
// =====================================================
// TypeScript types matching the backend Pydantic models
// =====================================================

export interface WidgetToken {
  id: string;
  bot_id: string;
  token_prefix?: string;
  name?: string;
  allowed_domains: string[];
  expires_at?: string;
  last_used_at?: string;
  created_at: string;
}

export interface WidgetTokenCreateInput {
  name?: string;
  allowed_domains: string[];
  expires_at?: string; // ISO 8601 datetime string
}

export interface WidgetTokenCreateResponse {
  status: "success" | "error";
  data: WidgetToken;
  token: string; // Plain token (shown only once)
  message?: string;
}

export interface WidgetTokenListResponse {
  status: "success" | "error";
  data: WidgetToken[];
  message?: string;
}

