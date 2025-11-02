"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  MessageSquare,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react";
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
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useBot } from "@/lib/query/hooks/bots";

// Mock analytics data - will be replaced with real API in Phase 10
const mockQueryData = [
  { date: "Mon", queries: 24 },
  { date: "Tue", queries: 38 },
  { date: "Wed", queries: 42 },
  { date: "Thu", queries: 31 },
  { date: "Fri", queries: 56 },
  { date: "Sat", queries: 48 },
  { date: "Sun", queries: 35 },
];

const mockHourlyData = [
  { hour: "00", count: 2 },
  { hour: "06", count: 5 },
  { hour: "12", count: 18 },
  { hour: "18", count: 24 },
];

const queryChartConfig = {
  queries: {
    label: "Queries",
    color: "oklch(0.646 0.222 41.116)",
  },
} satisfies ChartConfig;

const hourlyChartConfig = {
  count: {
    label: "Queries",
    color: "oklch(0.6 0.118 184.704)",
  },
} satisfies ChartConfig;

export default function BotSummaryPage() {
  const params = useParams();
  const router = useRouter();
  const botId = params.id as string;
  const { data: bot, isLoading, error } = useBot(botId);

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32 mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !bot) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Bot Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error
                ? error.message
                : "The bot you're looking for doesn't exist"}
            </p>
            <Button
              onClick={() => router.push("/dashboard/bots")}
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Bots
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mock stats - will be replaced with real API data
  const mockStats = {
    totalQueries: 244,
    todayQueries: 35,
    avgResponseTime: 2.3,
    activeSessions: 12,
    avgConfidence: 0.87,
    totalTokens: 45820,
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/bots")}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{bot.name}</h1>
            <p className="text-muted-foreground">
              {bot.description || "No description"}
            </p>
          </div>
        </div>
        <Button
          onClick={() => router.push(`/dashboard/bots/${bot.id}/settings`)}
          size="lg"
          className="gap-2"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockStats.totalQueries.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              +{mockStats.todayQueries} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Response Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockStats.avgResponseTime}s
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last 7 days average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Sessions
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.activeSessions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Confidence
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(mockStats.avgConfidence * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Query confidence score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Queries Over Time</CardTitle>
            <CardDescription>Last 7 days query volume</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={queryChartConfig}
              className="h-[300px] w-full"
            >
              <LineChart
                accessibilityLayer
                data={mockQueryData}
                margin={{
                  left: 12,
                  right: 12,
                  top: 12,
                  bottom: 12,
                }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Line
                  dataKey="queries"
                  type="monotone"
                  stroke="var(--color-queries)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-queries)", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hourly Distribution</CardTitle>
            <CardDescription>Query volume by hour of day</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={hourlyChartConfig}
              className="h-[300px] w-full"
            >
              <BarChart
                accessibilityLayer
                data={mockHourlyData}
                margin={{
                  left: 12,
                  right: 12,
                  top: 12,
                  bottom: 12,
                }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="hour"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `${value}:00`}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar
                  dataKey="count"
                  fill="var(--color-count)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bot Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Bot Configuration</CardTitle>
          <CardDescription>
            Current bot settings and information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                LLM Provider
              </p>
              <Badge variant="outline" className="text-sm">
                {bot.llm_provider}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Model
              </p>
              <p className="text-sm">
                {bot.llm_config?.model_name || "gpt-4o"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Temperature
              </p>
              <p className="text-sm">{bot.llm_config?.temperature || 0.7}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Max Tokens
              </p>
              <p className="text-sm">{bot.llm_config?.max_tokens || 1000}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Created
              </p>
              <p className="text-sm">
                {new Date(bot.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Retention Days
              </p>
              <p className="text-sm">{bot.retention_days} days</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder Notice */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm">Analytics Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This page displays mock analytics data. Real analytics will be
            available in Phase 10 after implementing the RAG query engine and
            query logging.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
