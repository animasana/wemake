import { z } from "zod";
import type { Route } from "./+types/search-page";
import { Hero } from "~/common/components/hero";
import ProductCard from "../components/product-card";
import ProductPagination from "~/common/components/product-pagination";
import { Input } from "~/common/components/ui/input";
import { Form } from "react-router";
import { Button } from "~/common/components/ui/button";
import { getPagesBySearch, getProductsBySearch } from "../queries";
import { makeSSRClient } from "~/supa-client";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Search Results | WeMake" },
    { name: "description", content: "Search results page" },
  ];
}

const paramsSchema = z.object({  
  query: z.string().optional().default(""),
  page: z.coerce.number().optional().default(1),
});

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const { success, data: parsedData } = paramsSchema.safeParse(
    Object.fromEntries(url.searchParams)
  );

  if (!success) {
    throw new Error("Invalid parameters");
  }

  if (parsedData.query === "") {
    return { products: [], totalPages: 1 }
  }

  const { client, headers } = makeSSRClient(request);
  const products = await getProductsBySearch(client, {
    query: parsedData.query,
    page: parsedData.page,
  });

  const totalPages = await getPagesBySearch(client, { query: parsedData.query });

  return { 
    products,
    totalPages, 
  };
}

export default function SearchPage({ loaderData }: Route.ComponentProps) {
  return (
    <div className="space-y-20">
      <Hero
        title="Search"
        subtitle="Search for products by title or subtitle"
      />
      <Form className="flex justify-center max-w-screen-sm items-center gap-2 mx-auto">
        <Input 
          name="query" 
          placeholder="Search for products"
          className="text-lg"
        />
        <Button type="submit">Search</Button>
      </Form>
      <div className="space-y-5 w-full max-w-screen-md mx-auto">
        {loaderData.products.map((product) => (          
          <ProductCard
            key={product.product_id}
            id={product.product_id}
            name={product.name}
            description={product.tagline}
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