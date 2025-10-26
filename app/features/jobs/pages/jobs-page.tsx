import { Hero } from "~/common/components/hero";
import type { Route } from "./+types/jobs-page";
import JobCard from "../components/job-card";
import { Button } from "~/common/components/ui/button";
import { JOB_TYPES, LOCATION_TYPES, SALARY_RANGES } from "../constants";
import { data, useSearchParams } from "react-router";
import { cn } from "~/lib/utils";
import { getJobs } from "../queries";
import { z } from "zod";
import { makeSSRClient } from "~/supa-client";
import { v4 as uuidv4 } from "uuid";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Jobs | WeMake" },
    { name: "description", content: "Find your dream job at WeMake"},
  ];
};

const searchParamsSchema = z.object({
  type: z
    .enum(JOB_TYPES.map((type) => type.value) as [string, ...string[]])
    .optional(),
  location: z
    .enum(LOCATION_TYPES.map((type) => type.value) as [string, ...string[]])
    .optional(),
  salary: z.enum(SALARY_RANGES).optional(),
});

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const { success, data: parsedData } = searchParamsSchema.safeParse(Object.fromEntries(url.searchParams));

  if (!success) {
    throw data (
      {
        error_code: "invalid_search_params",
        message: "Invalid search params",
      },
      { status: 400}
    );
  }

  const { client, headers } = makeSSRClient(request);
  const jobs = await getJobs(client, { 
    limit: 40, ...parsedData,
    location: parsedData.location,
    type: parsedData.type,
    salary: parsedData.salary, 
  });
  return { jobs };
}

export default function JobsPage({ loaderData }: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const onFilterClick = (key: string, value: string | null) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (value) {
      newSearchParams.set(key, value);      
    }
    else {
      newSearchParams.delete(key);
    }
    setSearchParams(newSearchParams);
  };

  const onUnselectedAll = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("type");
    newSearchParams.delete("location");
    newSearchParams.delete("salary");
    setSearchParams(newSearchParams);
  };

  return (
    <div className="space-y-20">
      <Hero title="Jobs" subtitle="Companies looking for makers" />
      <div className="grid grid-cols-1 xl:grid-cols-6 gap-20 items-start">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:col-span-4 gap-5">
          {loaderData.jobs.map((job) => (
            <JobCard
              key={job.job_id}
              id={job.job_id}
              company={job.company_name}
              companyLogoUrl={job.company_logo}
              companyHq={job.company_location}
              title={job.position}
              postedAt={job.created_at}
              type={job.job_type}
              positionLocation={job.location}
              salary={job.salary_range}
            />
          ))}
        </div>
        <div className="xl:col-span-2 sticky top-20 flex flex-col gap-10">
          <div className="flex flex-col items-start gap-2.5">
            <div className="flex flex-row items-center space-x-4">
              <h4 className="text-sm text-muted-foreground font-bold">Type</h4>
              <Button 
                variant={"default"}
                onClick={() => onFilterClick("type", null)}
                className="text-xs px-0.5 py-0.5"
              >
                Unselect
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {JOB_TYPES.map((type) => (
                <Button 
                  variant={"outline"} 
                  onClick={() => onFilterClick("type", type.value)}
                  className={cn(type.value === searchParams.get("type") ? "bg-accent" : "")}
                >
                  {type.label}
                </Button>
              ))}
            </div>            
          </div>
          <div className="flex flex-col items-start gap-2.5">
            <div className="flex flex-row items-center space-x-4">
              <h4 className="text-sm text-muted-foreground font-bold">Location</h4>
              <Button 
                variant={"default"}
                onClick={() => onFilterClick("location", null)}
                className="text-xs px-0.5 py-0.5"
              >
                Unselect
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {LOCATION_TYPES.map((type) => (
                <Button                   
                  variant={"outline"}
                  onClick={() => onFilterClick("location", type.value)}
                  className={cn(type.value === searchParams.get("location") ? "bg-accent" : "")}
                > 
                  {type.label}
                </Button>
              ))}
            </div>            
          </div>          
          <div className="flex flex-col items-start gap-2.5">
            <div className="flex flex-row items-center space-x-4">
              <h4 className="text-sm text-muted-foreground font-bold">Salary Range</h4>
              <Button                 
                variant={"default"}
                onClick={() => onFilterClick("salary", null)}
                className="text-xs px-0.5 py-0.5"
              >
                Unselect
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {SALARY_RANGES.map((range) => (
                <Button                  
                  variant={"outline"}
                  onClick={() => onFilterClick("salary", range)}
                  className={cn(range === searchParams.get("salary") ? "bg-accent" : "")}
                >
                  {range}
                </Button>
              ))}
            </div>
            <Button
              onClick={onUnselectedAll}
              className="px-0.5 py-0.5"
            >
              Unselect All
            </Button>            
          </div>
        </div>
      </div>
    </div>
  );
}