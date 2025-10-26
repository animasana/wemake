import { useSearchParams } from "react-router";
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "./ui/pagination";

type ProductPaginationProps = {
  totalPages: number;
};

export default function ProductPagination({
  totalPages,
}: ProductPaginationProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") ?? 1);
  const onClick = (page: number) => {
    searchParams.set("page", page.toString());
    setSearchParams(searchParams, {
      preventScrollReset: true,
    });
  };  

  return (
    <div>
      <Pagination>
        <PaginationContent>
          { page === 1 || (
            <>
              <PaginationItem>
                <PaginationPrevious 
                  to={`?page=${page - 1}`} 
                  onClick={(event) => {
                    event.preventDefault();
                    onClick(page - 1);                    
                  }}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink to={`?page=${page - 1}`}>
                  {page - 1}
                </PaginationLink>
              </PaginationItem>
            </>
          )}
          <PaginationItem>
            <PaginationLink to={`?page=${page}`} isActive>
              {page}
            </PaginationLink>
          </PaginationItem>
          {page === totalPages || (
            <>
              <PaginationItem>
                <PaginationLink to={`?page=${page + 1}`}>
                  {page + 1}
                </PaginationLink>
              </PaginationItem>
              {page + 1 === totalPages || (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationNext to={`?page=${page + 1}`} />
              </PaginationItem>
            </>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  );
}