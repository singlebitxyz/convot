"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot as BotIcon,
  ChevronDown,
  ChevronUp,
  FileText,
  Link as LinkIcon,
  Send,
  User,
  TestTube,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui";
import { useSandboxQuery } from "@/lib/query/hooks";
import type { Bot } from "@/lib/types/bot";

interface Citation {
  chunk_id: string;
  heading?: string;
  score?: number;
  source?: {
    source_id: string;
    source_type: string;
    original_url?: string;
    canonical_url?: string;
    storage_path?: string;
    filename?: string;
  };
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  citations?: Citation[];
  confidence?: number;
}

interface BotSandboxChatProps {
  bot: Bot;
  customPrompt: string;
}

function CitationSection({
  citations,
  confidence,
}: {
  citations: Citation[];
  confidence?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-3 pt-3 border-t border-border/50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full flex items-center justify-between mb-2 hover:bg-primary/20 hover:text-primary rounded px-2 py-1 transition-colors">
          <div className="flex items-center gap-2">
            <div className="text-xs font-medium text-muted-foreground">
              Sources ({citations.length})
            </div>
          </div>
          {isOpen ? (
            <ChevronUp className="h-3 w-3 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-2">
            {citations.map((citation, idx) => (
              <CitationItem
                key={citation.chunk_id || idx}
                citation={citation}
                idx={idx}
              />
            ))}
            {confidence !== undefined && (
              <Badge
                variant={
                  confidence >= 0.7
                    ? "default"
                    : confidence >= 0.5
                      ? "secondary"
                      : "outline"
                }
                className="text-xs mb-2"
              >
                {Math.round(confidence * 100)}% confidence
              </Badge>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function CitationItem({ citation, idx }: { citation: Citation; idx: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible
      className="border border-border/50 rounded-md"
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <CollapsibleTrigger className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-primary/20 hover:text-primary transition-colors">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {citation.source?.source_type === "html" ? (
            <LinkIcon className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
          ) : (
            <FileText className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
          )}
          <span className="truncate font-medium">
            {citation.heading ||
              citation.source?.filename ||
              citation.source?.original_url ||
              `Source ${idx + 1}`}
          </span>
          {citation.score !== undefined && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {Math.round(citation.score * 100)}%
            </Badge>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-2">
        {citation.source && (
          <div className="text-xs text-muted-foreground space-y-1 mt-2">
            {citation.source.original_url && (
              <div>
                <span className="font-medium">URL:</span>{" "}
                <a
                  href={citation.source.original_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline hover:text-primary"
                >
                  {citation.source.original_url}
                </a>
              </div>
            )}
            {citation.source.filename && (
              <div>
                <span className="font-medium">File:</span> {citation.source.filename}
              </div>
            )}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function BotSandboxChat({ bot, customPrompt }: BotSandboxChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const sandboxQuery = useSandboxQuery(bot.id);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isLoading || !customPrompt.trim()) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: input.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      try {
        // Build chat history from previous messages
        const chatHistory = messages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({
            text: m.content,
            isUser: m.role === "user",
            timestamp: m.timestamp.toISOString(),
          }));

        const res = await sandboxQuery.mutateAsync({
          query_text: userMessage.content,
          custom_prompt: customPrompt,
          top_k: 5,
          min_score: 0.25,
          chat_history: chatHistory,
          include_metadata: true,
        });

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: res.answer,
          timestamp: new Date(),
          citations: res.citations,
          confidence: res.confidence,
        };
        setMessages((prev) => [...prev, aiMessage]);
      } catch (err) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I couldn't process that query. Please try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, sandboxQuery, customPrompt, messages]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend(e as any);
      }
    },
    [handleSend]
  );

  if (!customPrompt.trim()) {
    return (
      <Alert>
        <TestTube className="h-4 w-4" />
        <AlertDescription>
          Please enter a custom prompt in the Editor tab to test it in the sandbox.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="h-[600px]">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Sandbox Chat
            </CardTitle>
            <CardDescription>
              Test your custom prompt without saving changes
            </CardDescription>
          </div>
          <Badge variant="outline">{bot.llm_provider}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col h-[calc(100%-100px)] p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <TestTube className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Test Your Prompt</h3>
                <p className="text-muted-foreground max-w-md">
                  Send a message to test how your custom prompt performs. This
                  won&apos;t save any changes to your bot.
                </p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`flex w-full ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex items-start gap-3 max-w-[80%] ${
                        message.role === "user"
                          ? "flex-row-reverse"
                          : "flex-row"
                      }`}
                    >
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback
                          className={
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }
                        >
                          {message.role === "user" ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <BotIcon className="h-4 w-4" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {message.role === "assistant" ? (
                          <div className="space-y-3">
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  a: ({ ...props }) => (
                                    <a
                                      {...props}
                                      target="_blank"
                                      rel="noreferrer noopener"
                                      className="underline"
                                    />
                                  ),
                                  code: ({
                                    className,
                                    children,
                                    ...props
                                  }) => (
                                    <code
                                      className={
                                        "rounded bg-background/50 px-1 py-0.5 text-[0.85em] " +
                                        (className || "")
                                      }
                                      {...props}
                                    >
                                      {children}
                                    </code>
                                  ),
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            </div>
                            {message.citations && message.citations.length > 0 && (
                              <CitationSection
                                citations={message.citations}
                                confidence={message.confidence}
                              />
                            )}
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            {isLoading && (
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-muted">
                    <BotIcon className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse" />
                    <div className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse delay-75" />
                    <div className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse delay-150" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <form onSubmit={handleSend} className="border-t p-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isLoading || !customPrompt.trim()}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim() || !customPrompt.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

