"use client";

import { useState, useEffect } from "react";
import { Plus, X, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateWidgetToken } from "@/lib/query/hooks/widget-tokens";
import { useNotifications } from "@/lib/hooks/use-notifications";
import type { WidgetTokenCreateInput } from "@/lib/types/widget-token";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";

interface WidgetTokenCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  botId: string;
}

export default function WidgetTokenCreateDialog({
  open,
  onOpenChange,
  botId,
}: WidgetTokenCreateDialogProps) {
  const { success, error: showError } = useNotifications();
  const createTokenMutation = useCreateWidgetToken(botId);

  const [formData, setFormData] = useState<WidgetTokenCreateInput>({
    name: "",
    allowed_domains: [],
    expires_at: undefined,
  });

  const [domainInput, setDomainInput] = useState("");
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [tokenCopied, setTokenCopied] = useState(false);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setFormData({
        name: "",
        allowed_domains: [],
        expires_at: undefined,
      });
      setDomainInput("");
      setCreatedToken(null);
      setTokenCopied(false);
    }
  }, [open]);

  const handleAddDomain = () => {
    const trimmed = domainInput.trim();
    if (!trimmed) return;

    if (formData.allowed_domains.includes(trimmed)) {
      showError("Duplicate Domain", "This domain is already added.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      allowed_domains: [...prev.allowed_domains, trimmed],
    }));
    setDomainInput("");
  };

  const handleRemoveDomain = (domain: string) => {
    setFormData((prev) => ({
      ...prev,
      allowed_domains: prev.allowed_domains.filter((d) => d !== domain),
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddDomain();
    }
  };

  const handleCopyToken = async () => {
    if (createdToken) {
      await navigator.clipboard.writeText(createdToken);
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 2000);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (createTokenMutation.isPending) return;

    // Validation
    if (formData.allowed_domains.length === 0) {
      showError("Validation Error", "At least one allowed domain is required.");
      return;
    }

    // Prepare expires_at if date is provided
    let expiresAt: string | undefined = undefined;
    if (formData.expires_at) {
      expiresAt = new Date(formData.expires_at).toISOString();
    }

    try {
      const response = await createTokenMutation.mutateAsync({
        name: formData.name || undefined,
        allowed_domains: formData.allowed_domains,
        expires_at: expiresAt,
      });

      // Show the token (only shown once)
      setCreatedToken(response.token);
      success(
        "Token Created",
        "Widget token created successfully! Save it now - it won't be shown again."
      );
    } catch (err) {
      // Error handled by mutation hook
    }
  };

  // If token was created, show token display
  if (createdToken) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-amber-500" />
              Token Created Successfully
            </DialogTitle>
            <DialogDescription>
              Save this token immediately - it won't be shown again!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This is the only time you'll see this token. Copy it now and store it securely.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label>Your Widget Token</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted p-3 rounded-md font-mono text-sm break-all">
                  {createdToken}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyToken}
                  className="flex-shrink-0"
                >
                  {tokenCopied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                <strong>How to use:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Copy the token above</li>
                <li>Add it to your widget script</li>
                <li>Store it securely (password manager, environment variables)</li>
              </ol>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" /> Create Widget Token
          </DialogTitle>
          <DialogDescription>
            Generate a token to embed your bot widget on websites.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Token Name (Optional)</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Production Website Token"
                maxLength={100}
              />
              <p className="text-sm text-muted-foreground text-right">
                {(formData.name || "").length}/100
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="domains">Allowed Domains</Label>
              <div className="flex gap-2">
                <Input
                  id="domains"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="https://example.com or example.com"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddDomain}
                  disabled={!domainInput.trim()}
                >
                  Add
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Enter domains where this token can be used. Press Enter or click Add.
              </p>
              {formData.allowed_domains.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.allowed_domains.map((domain, idx) => (
                    <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                      {domain}
                      <button
                        type="button"
                        onClick={() => handleRemoveDomain(domain)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="expires_at">Expiration Date (Optional)</Label>
              <Input
                id="expires_at"
                type="datetime-local"
                value={
                  formData.expires_at
                    ? new Date(formData.expires_at).toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    expires_at: e.target.value ? e.target.value : undefined,
                  }))
                }
                min={new Date().toISOString().slice(0, 16)}
              />
              <p className="text-sm text-muted-foreground">
                Leave empty for tokens that never expire. Expired tokens will be automatically rejected.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="gap-2"
              disabled={createTokenMutation.isPending || formData.allowed_domains.length === 0}
            >
              {createTokenMutation.isPending ? (
                <>
                  <Plus className="h-4 w-4 animate-spin" /> Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Create Token
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

