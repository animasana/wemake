import { Form, Link, NavLink, Outlet, useOutletContext } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "~/common/components/ui/avatar";
import { Badge } from "~/common/components/ui/badge";
import { Button, buttonVariants } from "~/common/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/common/components/ui/dialog";
import { Textarea } from "~/common/components/ui/textarea";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/profile-layout";
import { getUserProfile } from "../queries";
import { makeSSRClient } from "~/supa-client";

export const meta: Route.MetaFunction = ({ params }: { params: { username: string }}) => {
  return [{ title: `${params.username} | WeMake`}];
}

export const loader = async ({
  request,
  params
}: Route.LoaderArgs & { params: { username: string } }) => {
  const { client, headers } = makeSSRClient(request);
  const user = await getUserProfile(client, {
    username: params.username,
  });

  return { user };
}

export default function ProfileLayout({ loaderData, params }: Route.ComponentProps) {
  const { isLoggedIn, username } = useOutletContext<{
    isLoggedIn: boolean;
    username?: string;
  }>();
  return (
    <div className="space-y-10">
      <div className="flex items-center gap-4">
        <Avatar className="size-40">          
          {loaderData.user.avatar ? (
            <AvatarImage src={loaderData.user.avatar} />
          ) : (
            <AvatarFallback className="text-8xl">
              {loaderData.user.name[0]}
            </AvatarFallback>
          )}
        </Avatar>        
        <div className="space-y-5">
          <div className="flex gap-2">
            <h1 className="text-2xl font-semibold">{loaderData.user.name}</h1>          
            {isLoggedIn && username === params.username ? (
              <Button variant="outline" asChild>
                <Link to="/my/settings">Edit profile</Link>
              </Button>
            ) : null}
            {isLoggedIn && username !== params.username ? (
              <>
                <Button variant={"secondary"}>Follow</Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant={"secondary"}>Message</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Message</DialogTitle>
                    </DialogHeader>
                    <DialogDescription className="space-y-4">
                      <span className="block text-sm text-muted-foreground">
                        Send a message to John Doe
                      </span>
                      <Form className="space-y-4">
                        <Textarea 
                          placeholder="Message" 
                          className="resize-none" 
                          rows={4} 
                        />
                        <Button type="submit">Send</Button>
                      </Form>
                    </DialogDescription>
                  </DialogContent>
                </Dialog>
              </>
            ): null}

          </div>
          <div className="flex gap-2 items-center">
            <span className="text-sm text-muted-foreground">
              @{loaderData.user.name}
            </span>
            <Badge variant={"secondary"} className="capitalize">
              {loaderData.user.role}
            </Badge>
            <Badge variant={"secondary"}>100 followers</Badge>
            <Badge variant={"secondary"}>123 following</Badge>
          </div>
        </div>
      </div>
      <div className="flex gap-5">
        {[
          { label: "About", to: `/users/${loaderData.user.username}` },
          { label: "Products", to: `/users/${loaderData.user.username}/products` },
          { label: "Posts", to: `/users/${loaderData.user.username}/posts` },
        ].map((item) => (
          <NavLink
            end   
            key={item.label}          
            className={({ isActive }) => 
              cn(
                buttonVariants({ variant: "outline" }),
                isActive && "bg-accent text-foreground"
              )
            }
            to={item.to}
          >
            {item.label}
          </NavLink>
        ))}
      </div>
      <div className="max-w-screen-md">
        <Outlet
          context={{ 
            headline: loaderData.user.headline, 
            bio: loaderData.user.bio, 
          }}
        />
      </div>      
    </div>
  );
}