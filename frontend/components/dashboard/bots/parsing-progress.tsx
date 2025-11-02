"use client";

import { FileText, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Source } from "@/lib/types/source";

interface ParsingProgressProps {
  source: Source;
}

/**
 * Parsing Progress Component
 *
 * Shows a visual progress indicator for sources being parsed.
 * Since we don't have actual progress percentage from the backend,
 * we show an animated loading state with status information.
 */
export function ParsingProgress({ source }: ParsingProgressProps) {
  const displayName =
    source.source_type === "html"
      ? source.original_url || source.canonical_url || "URL"
      : source.storage_path.split("/").pop() || "File";

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  };

  // Determine progress stage based on status
  const getProgressStage = () => {
    switch (source.status) {
      case "uploaded":
        return { stage: 1, message: "File uploaded, preparing to parse..." };
      case "parsing":
        return { stage: 2, message: "Extracting text from document..." };
      case "indexed":
        return { stage: 3, message: "Parsing complete!" };
      case "failed":
        return { stage: 0, message: "Parsing failed" };
      default:
        return { stage: 0, message: "Unknown status" };
    }
  };

  const { stage, message } = getProgressStage();
  const progressValue = source.status === "failed" ? 0 : (stage / 3) * 100;

  if (source.status === "indexed" || source.status === "failed") {
    return null; // Don't show progress for completed/failed sources
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            {source.status === "parsing" ? (
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
            ) : (
              <FileText className="h-5 w-5 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <p className="text-sm font-medium text-foreground truncate">
                {displayName}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{message}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatFileSize(source.file_size)}</span>
                <span>{source.source_type.toUpperCase()}</span>
              </div>
              <Progress
                value={progressValue}
                className="h-1.5"
                // Add animation for indeterminate progress when parsing
                style={{
                  animation:
                    source.status === "parsing"
                      ? "pulse 2s ease-in-out infinite"
                      : undefined,
                }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
