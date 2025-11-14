// =====================================================
// PROMPT UPDATE REACT QUERY HOOKS
// =====================================================
// React Query hooks for prompt update operations
// =====================================================
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  PromptUpdate,
  PromptUpdateCreateInput,
  PromptUpdateResponse,
  PromptUpdateListResponse,
  SandboxQueryRequest,
  PromptGenerateRequest,
  PromptGenerateResponse,
} from "@/lib/types/prompt-update";
import { apiGet, apiPost, apiPatch } from "@/lib/utils/api-client";
import { queryKeys } from "../client";

// =====================================================
// PROMPT UPDATE QUERY KEYS
// =====================================================

export const promptUpdateQueryKeys = {
  all: (botId: string) => ["prompt-updates", botId] as const,
  list: (botId: string, limit?: number) => ["prompt-updates", botId, "list", limit] as const,
  detail: (botId: string, updateId: string) => ["prompt-updates", botId, updateId] as const,
} as const;

// =====================================================
// PROMPT UPDATE FETCH FUNCTIONS
// =====================================================

/**
 * Fetch prompt update history for a bot
 */
async function getPromptUpdates(
  botId: string,
  limit?: number
): Promise<PromptUpdate[]> {
  const url = limit
    ? `/api/v1/bots/${botId}/prompt-updates?limit=${limit}`
    : `/api/v1/bots/${botId}/prompt-updates`;
  const response = await apiGet<PromptUpdateListResponse>(url);
  return response.data;
}

/**
 * Create a new prompt update
 */
async function createPromptUpdate(
  botId: string,
  input: PromptUpdateCreateInput
): Promise<PromptUpdate> {
  const response = await apiPost<PromptUpdateResponse>(
    `/api/v1/bots/${botId}/prompt-updates`,
    input
  );
  return response.data;
}

/**
 * Apply a prompt update to the bot
 */
async function applyPromptUpdate(
  botId: string,
  updateId: string
): Promise<any> {
  const response = await apiPatch<{ status: string; data: any; message: string }>(
    `/api/v1/bots/${botId}/prompt`,
    { update_id: updateId }
  );
  return response.data;
}

/**
 * Revert to a previous prompt version
 */
async function revertPrompt(
  botId: string,
  updateId: string
): Promise<any> {
  const response = await apiPost<{ status: string; data: any; message: string }>(
    `/api/v1/bots/${botId}/prompt/revert`,
    { update_id: updateId }
  );
  return response.data;
}

/**
 * Execute a sandbox query with a custom prompt
 */
async function sandboxQuery(
  botId: string,
  request: SandboxQueryRequest
): Promise<any> {
  const response = await apiPost<{ status: string; data: any; message: string }>(
    `/api/v1/bots/${botId}/query/sandbox`,
    request
  );
  return response.data;
}

// =====================================================
// PROMPT UPDATE QUERY HOOKS
// =====================================================

/**
 * Hook to get prompt update history for a bot
 */
export function usePromptUpdates(botId: string, limit?: number) {
  return useQuery({
    queryKey: promptUpdateQueryKeys.list(botId, limit),
    queryFn: () => getPromptUpdates(botId, limit),
    enabled: !!botId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create a prompt update
 */
export function useCreatePromptUpdate(botId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PromptUpdateCreateInput) => createPromptUpdate(botId, input),
    onSuccess: () => {
      // Invalidate prompt updates list
      queryClient.invalidateQueries({ queryKey: promptUpdateQueryKeys.all(botId) });
      // Invalidate bot data to refresh current prompt
      queryClient.invalidateQueries({ queryKey: queryKeys.bots.detail(botId) });
    },
  });
}

/**
 * Hook to apply a prompt update
 */
export function useApplyPromptUpdate(botId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updateId: string) => applyPromptUpdate(botId, updateId),
    onSuccess: () => {
      // Invalidate prompt updates list
      queryClient.invalidateQueries({ queryKey: promptUpdateQueryKeys.all(botId) });
      // Invalidate bot data to refresh current prompt
      queryClient.invalidateQueries({ queryKey: queryKeys.bots.detail(botId) });
    },
  });
}

/**
 * Hook to revert to a previous prompt version
 */
export function useRevertPrompt(botId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updateId: string) => revertPrompt(botId, updateId),
    onSuccess: () => {
      // Invalidate prompt updates list
      queryClient.invalidateQueries({ queryKey: promptUpdateQueryKeys.all(botId) });
      // Invalidate bot data to refresh current prompt
      queryClient.invalidateQueries({ queryKey: queryKeys.bots.detail(botId) });
    },
  });
}

/**
 * Hook to execute a sandbox query
 */
export function useSandboxQuery(botId: string) {
  return useMutation({
    mutationFn: (request: SandboxQueryRequest) => sandboxQuery(botId, request),
  });
}

/**
 * Generate an updated prompt from user feedback
 */
async function generatePromptFromFeedback(
  botId: string,
  request: PromptGenerateRequest
): Promise<PromptGenerateResponse["data"]> {
  const response = await apiPost<PromptGenerateResponse>(
    `/api/v1/bots/${botId}/prompt/generate`,
    request
  );
  return response.data;
}

/**
 * Hook to generate prompt from feedback
 */
export function useGeneratePrompt(botId: string) {
  return useMutation({
    mutationFn: (request: PromptGenerateRequest) => generatePromptFromFeedback(botId, request),
  });
}

