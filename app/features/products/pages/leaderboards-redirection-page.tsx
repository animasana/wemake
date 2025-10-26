import { data, redirect } from "react-router";
import type { Route } from "./+types/leaderboards-redirection-page";
import { DateTime } from "luxon";

export function loader({ params }: Route.LoaderArgs) {
  const { period } = params; 
  let url: string;
  const today = DateTime.now().setZone("Asia/Seoul");

  switch (period) {
    case "daily":
      url = `/daily/${today.year}/${today.month}/${today.day}`;
      break;
    case "weekly":
      url = `/weekly/${today.year}/${today.weekNumber}`;
      break;
    case "monthly":
      url = `/monthly/${today.year}/${today.month}`;
      break;
    case "yearly":
      url = `/yearly/${today.year}`;
      break;
    default:
      return data(null, {status: 400});
  }

  url = `/products/leaderboards${url}`;
  return redirect(url);
}