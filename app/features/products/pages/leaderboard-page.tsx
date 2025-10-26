import { Hero } from "~/common/components/hero";
import type { Route } from "./+types/leaderboard-page";
import { DateTime } from "luxon";
import { getProductsByDateRange } from "../queries";
import ProductBoard from "../components/product-board";
import { makeSSRClient } from "~/supa-client";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Leaderboard | WeMake" },
    { name: "description", content: "Top products leaderboard" },
  ];
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client, headers } = makeSSRClient(request);
  const [dailyProducts, weeklyProducts, monthlyProducts,  yearlyProducts] = 
    await Promise.all([
      getProductsByDateRange(client, {
        startDate: DateTime.now().startOf("day"),
        endDate: DateTime.now().endOf("day"),
        limit: 7,
      }),
      getProductsByDateRange(client, {
        startDate: DateTime.now().startOf("week"),
        endDate: DateTime.now().endOf("week"),
        limit: 7,
      }),
      getProductsByDateRange(client, {
        startDate: DateTime.now().startOf("month"),
        endDate: DateTime.now().endOf("month"),
        limit: 7,
      }),
      getProductsByDateRange(client, {
        startDate: DateTime.now().startOf("year"),
        endDate: DateTime.now().endOf("year"),
        limit: 7,
      }),
    ]);

  return {
    dailyProducts,
    weeklyProducts,
    monthlyProducts,
    yearlyProducts
  };
}

export default function LeaderboardPage({ loaderData }: Route.ComponentProps) {
  return (
    <div className="space-y-20">
      <div>
        <Hero
          title="Leaderboard"
          subtitle="The most popular products on WeMake"
        />        
      </div>
      <ProductBoard
        timeGrouping="day"
        products={loaderData.dailyProducts}
      />
      <ProductBoard
        timeGrouping="week"
        products={loaderData.weeklyProducts}
      />
      <ProductBoard
        timeGrouping="month"        
        products={loaderData.monthlyProducts}
      />
      <ProductBoard
        timeGrouping="year"        
        products={loaderData.yearlyProducts}
      />
    </div>
  );
}