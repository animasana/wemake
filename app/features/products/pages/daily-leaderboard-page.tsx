import { DateTime } from "luxon";
import type { Route } from "./+types/daily-leaderboard-page";
import { data, isRouteErrorResponse, Link } from "react-router";
import { z } from "zod";
import { Hero } from "~/common/components/hero";
import ProductCard from "../components/product-card";
import { Button } from "~/common/components/ui/button";
import ProductPagination from "~/common/components/product-pagination";
import { getProductPagesByDateRange, getProductsByDateRange } from "../queries";
import { PAGE_SIZE } from "../constants";
import { makeSSRClient } from "~/supa-client";

const paramsSchema = z.object({
  year: z.coerce.number(),
  month: z.coerce.number(),
  day: z.coerce.number(),
});

export const meta: Route.MetaFunction = ({params, data}) => {
  const date = DateTime.fromObject({
    year: Number(params.year),
    month: Number(params.month),
    day: Number(params.day),  
  })
  .setZone("Asia/Seoul")
  .setLocale("ko");

  return [
    {title: `The best product of ${date.toLocaleString(DateTime.DATE_MED)} | WeMake`}
  ];
};


export async function loader({ params, request }: Route.LoaderArgs) {
  const { success, data: parsedData } = paramsSchema.safeParse(params);

  if (!success) {
    throw data(
      { 
        error_code: "invalid_params",
        message: "Invalid parameters",        
      }, 
      { 
        status: 400 
      }
    );
  }   

  const date = DateTime.fromObject(parsedData).setZone("Asia/Seoul");
  if (!date.isValid) {
    throw data(
      { 
        error_code: "invalid_date",
        message: "Invalid date",        
      }, 
      { 
        status: 400 
      }
    );
  }

  const today = DateTime.now().setZone("Asia/Seoul").startOf("day");

  if (date > today) {
    throw data(
      { 
        error_code: "future_date",
        message: "Date is in the future",        
      }, 
      { 
        status: 400 
      }
    );
  }
  
  const url = new URL(request.url);

  const { client, headers } = makeSSRClient(request);
  const products = await getProductsByDateRange(client,{
    startDate: date.startOf("day"),
    endDate: date.endOf("day"),
    limit: PAGE_SIZE,
    page: Number(url.searchParams.get("page") || 1),
  });

  const totalPages = await getProductPagesByDateRange(client,{
    startDate: date.startOf("day"),
    endDate: date.endOf("day"),
  });

  return {
    products,
    totalPages,
    ...parsedData 
  };
}

export default function DailyLeaderboardPage({ loaderData }: Route.ComponentProps) {
  const urlDate = DateTime.fromObject({
    year: loaderData.year, 
    month: loaderData.month,
    day: loaderData.day,
  });

  const previousDate = urlDate.minus({ days: 1 });  
  const nextDate = urlDate.plus({ days: 1 });
  const isToday = urlDate.equals(DateTime.now().startOf("day"));

  return (
    <div className="space-y-10">
      <Hero title={`The best product of ${urlDate.toLocaleString(DateTime.DATE_MED)}`} />

      <div className="flex items-center justify-center gap-2">
        <Button variant="secondary" asChild>
          <Link to={`/products/leaderboards/daily/${previousDate.year}/${previousDate.month}/${previousDate.day}`}>
            &larr;{previousDate.toLocaleString(DateTime.DATE_SHORT)}
          </Link>
        </Button>
        {!isToday && (
          <Button variant="secondary" asChild>
            <Link to={`/products/leaderboards/daily/${nextDate.year}/${nextDate.month}/${nextDate.day}`}>
              {nextDate.toLocaleString(DateTime.DATE_SHORT)}&rarr;
            </Link>
          </Button>
        )}
      </div>

      <div className="space-y-5 w-full max-w-screen-md mx-auto">
        {loaderData.products.map((product) => (          
          <ProductCard
            key={product.product_id}
            id={product.product_id.toString()}
            name={product.name}
            description={product.description}
            reviewsCount={product.reviews}
            viewsCount={product.views}
            votesCount={product.upvotes}       
          />
        ))}
      </div>
      <ProductPagination totalPages={loaderData.totalPages} />
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error)) {
    return (
      <div>
        {error.data.message} / {error.data.error_code}
      </div>
    );
  }

  if (error instanceof Error) {
    return (
      <div>
        {error.message}
      </div>
    );
  }

  return <div>Unknown error</div>;
}