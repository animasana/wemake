import { Button } from "~/common/components/ui/button";
import ProductCard from "./product-card";
import { Link } from "react-router";

interface ProductBoardProps {
    product_id: number;
    name: string;
    description: string;
    reviews: string;
    views: string;
    upvotes: string;
}

function getTimeFrame(timeGrouping: string): string {
    switch (timeGrouping) {
        case "day":
            return "Daily";
        case "week":
            return "Weekly";
        case "month":
            return "Monthly";
        case "year":
            return "Yearly";
        default:
            return ""; 
    }
}

export default function ProductBoard({timeGrouping, products}: {timeGrouping: string,  products: ProductBoardProps[]}) {
    const timeFrames = getTimeFrame(timeGrouping);
    
    return (
        <div className="grid grid-cols-3 gap-4">
            <div>
                <h2 className="text-3xl font-bold leading-tight tracking-tight">
                    {timeFrames} Leaderboard
                </h2>
                <p className="text-xl font-light text-foreground">
                    The most popular products on WeMake by {timeGrouping}.
                </p>        
            </div>        
            {products.map((product: ProductBoardProps) => (          
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
            <Button variant="link" asChild className="text-lg self-center">
                <Link to={`/products/leaderboards/${timeFrames.toLowerCase()}`}>
                    Explore all products &rarr;
                </Link>
            </Button>
        </div>
    );
}