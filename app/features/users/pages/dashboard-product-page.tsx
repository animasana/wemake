import { Area, AreaChart, CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "~/common/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "~/common/components/ui/chart";
import type { Route } from "./+types/dashboard-product-page";
import { makeSSRClient } from "~/supa-client";
import { getLoggedInUserId } from "../queries";
import { redirect } from "react-router";

export const meta: Route.MetaFunction = () => {
  return [{ title: "Product Dashboard | WeMake"}];
}

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const userId = await getLoggedInUserId(client);
  const { error } = await client
    .from("products")
    .select("product_id")
    .eq("profile_id", userId)
    .eq("product_id", +params.productId)
    .single();

  if (error) {
    throw redirect("/my/dashboard/products");
  }

  const { data, error: rpcError } = await client.rpc("get_product_stats", {
    product_id: params.productId,
  });

  if (rpcError) {
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
  visitors: {
    label: "👤",
    color: "var(--chart-3)",
  }
} satisfies ChartConfig;

export default function DashboardProductPage({ loaderData }: Route.ComponentProps) {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold mb-6">Analytics</h1>
      <Card className="w-1/2">
        <CardHeader>
          <CardTitle>Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <AreaChart
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
              <Area
                dataKey="product_views"
                type="natural"
                stroke="var(--color-views)"
                fill="var(--color-views)"
                strokeWidth={2}
                dot={false}
              />
              <Area
                dataKey="product_visit"
                type="natural"
                stroke="var(--color-visitors)"
                fill="var(--color-visitors)"
                strokeWidth={2}
                dot={false}
              />
              <ChartTooltip
                cursor={false}
                wrapperStyle={{ minWidth: "180px" }}
                content={<ChartTooltipContent indicator="dot" />}
              />              
            </AreaChart>
          </ChartContainer>          
        </CardContent>
      </Card>
    </div>
  );
}