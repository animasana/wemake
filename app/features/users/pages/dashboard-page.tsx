import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import type { Route } from "./+types/dashboard-page";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "~/common/components/ui/chart";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { getLoggedInUserId } from "../queries";
import { makeSSRClient } from "~/supa-client";

export const meta: Route.MetaFunction = () => {
  return [{ title: "Dashboard | WeMake"}];
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = await makeSSRClient(request);
  const userId = await getLoggedInUserId(client);
  const { data, error } = await client.rpc("get_dashboard_stats", {
    user_id: userId,
  });

  if (error) {
    throw error;
  }

  return {
    chartData: data,
  };
};

const chartConfig = {
  views: {
    label: "👁️",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export default function DashboardPage({ loaderData }: Route.ComponentProps) {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      <Card className="w-1/2">
        <CardHeader>
          <CardTitle>Profile views</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <LineChart
              accessibilityLayer
              data={loaderData.chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                padding={{ left: 15, right: 15 }}
              />
              <Line
                dataKey="views"
                type="natural"
                stroke="var(--color-views)"
                strokeWidth={2}
                dot={false}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />              
            </LineChart>
          </ChartContainer>          
        </CardContent>
      </Card>
    </div>
  );
}