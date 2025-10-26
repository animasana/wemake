import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "~/common/components/ui/avatar";
import { 
  Card, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "~/common/components/ui/card";
import { Button } from "~/common/components/ui/button";
import { EyeIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import { Activity } from "react";
import { Link, useFetcher } from "react-router";

interface NotificationCardProps {
  id: number;
  avatarUrl: string;
  avatarFallback: string;
  username: string;
  type: "follow" | "review" | "reply";
  timestamp: string;
  seen: boolean;
  productName?: string;
  payloadId?: number;
  postTitle?: string;
}

export function NotificationCard({
  id,
  type,
  avatarUrl,
  avatarFallback,
  username,  
  timestamp,
  seen,
  productName,
  postTitle,
  payloadId,
}: NotificationCardProps) {  
  const getMessage = (type: "follow" | "review" | "reply") => {
    switch (type) {
      case "follow":
        return " followed you.";
      case "review":
        return " reviewed your product: ";
      case "reply":
        return " replied to your post: ";
    }
  };
  const fetcher = useFetcher();
  const optimisticSeen = fetcher.state === "idle" ? seen : true;
  return (
    <Card className={cn("min-w-[450px]", seen ? "" : "bg-yellow-500/60")}>
      <CardHeader className="flex flex-row gap-5 items-start">
        <Avatar>
          <AvatarImage src={avatarUrl} className="rounded-full size-10"/>
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-lg font-bold">
            <span>{username} {" "}</span>
            <span>{getMessage(type)}</span>
            <Activity mode={productName ? "visible" : "hidden"}>
              <Button variant={"ghost"} asChild className="text-lg">
                <Link to={`/products/${payloadId}`}>
                  {productName}
                </Link>
              </Button>
            </Activity>
            <Activity mode={postTitle ? "visible" : "hidden"}>
              <Button variant={"ghost"} asChild className="text-lg">
                <Link to={`/community/${payloadId}`}>
                  {postTitle}
                </Link>
              </Button>
            </Activity>
          </CardTitle>
          <small className="text-muted-foreground text-sm">
            {timestamp}
          </small>
        </div>
      </CardHeader>
      <CardFooter className="flex justify-end">
        <Activity mode={optimisticSeen ? "hidden" : "visible"}>
          <fetcher.Form method="post" action={`/my/notifications/${id}/see`}>
            <Button variant={"outline"} size="icon">
              <EyeIcon className="w-4 h-4" />
            </Button>
          </fetcher.Form>
        </Activity>
      </CardFooter>
    </Card>
  );
}