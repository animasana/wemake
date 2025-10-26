import { Card, CardDescription, CardHeader, CardTitle } from "~/common/components/ui/card";
import type { Route } from "./+types/message-page";
import { Avatar, AvatarFallback, AvatarImage } from "~/common/components/ui/avatar";
import { Form, useOutletContext, type ShouldRevalidateFunction, type ShouldRevalidateFunctionArgs } from "react-router";
import { Textarea } from "~/common/components/ui/textarea";
import { Button } from "~/common/components/ui/button";
import { SendIcon } from "lucide-react";
import { MessageBubble } from "../components/message-bubble";
import { browserClient, makeSSRClient, type Database } from "~/supa-client";
import { getLoggedInUserId, getMessagesByMessageRoomId, getRoomsParticipant, sendMessageToRoom } from "../queries";
import { useEffect, useRef, useState } from "react";

export const meta: Route.MetaFunction = () => {
  return [{ title: "Message | WeMake" }];
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const userId = await getLoggedInUserId(client);
  const messages = await getMessagesByMessageRoomId(client, { 
    messageRoomId: params.messageRoomId,
    userId,
  });
  const participant = await getRoomsParticipant(client, {
    messageRoomId: params.messageRoomId,
    userId,
  });

  return {
    messages,
    participant,
  };
}

export const action = async ({ request, params }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  const userId = await getLoggedInUserId(client);
  const formData = await request.formData();
  const message = formData.get("message");
  await sendMessageToRoom(client, {
    messageRoomId: params.messageRoomId,
    message: message as string,
    userId,
  })

  return {
    ok: true,
  };
};

export default function MessagePage({
  loaderData, 
  actionData, 
}: Route.ComponentProps) {  
  const [messages, setMessages] = useState(loaderData.messages); 
  const { userId, name, avatar } = useOutletContext<{ 
    userId: string;
    name: string;
    avatar: string; 
  }>();
  const messageEndRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (actionData?.ok) {
      formRef.current?.reset();      
    }
  }, [actionData]);

  useEffect(() => {
    const changes = browserClient
      .channel(`room:${userId}-${loaderData.participant?.profile?.profile_id}`)
      .on(
        "postgres_changes", 
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          setMessages((prev) => [
            ...prev, 
            payload.new as Database["public"]["Tables"]["messages"]["Row"],
          ]);
        }
      )
      .subscribe();

    return () => {
      changes.unsubscribe();
    };
  }, []);

  return (
    <div className="h-full flex flex-col justify-between">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="size-14">
            <AvatarImage src={loaderData.participant?.profile?.avatar ?? ""} alt="Avatar" />
            <AvatarFallback>
              {loaderData.participant?.profile?.name.charAt(0) ?? ""}
            </AvatarFallback>
          </Avatar>        
          <div className="flex flex-col gap-0">
            <CardTitle>
              {loaderData.participant?.profile?.name ?? ""}
            </CardTitle>
            <CardDescription>2 days ago</CardDescription>
          </div>
        </CardHeader>
      </Card>
      <div className="py-10 overflow-y-scroll space-y-4 flex flex-col justify-start h-full">
        {messages.map((message) => (
          <MessageBubble
            key={message.message_id}
            avatarUrl={message.sender_id === userId 
              ? avatar
              : loaderData.participant?.profile?.avatar ?? ""
            }
            avatarFallback={
              message.sender_id === userId 
                ? name.charAt(0) 
                : loaderData.participant?.profile?.name.charAt(0) ?? ""
            }
            content={message.content}
            isCurrentUser={message.sender_id === userId}
          />          
        ))}
        <div ref={messageEndRef} />  
      </div>
      <Card>
        <CardHeader>
          <Form
            ref={formRef} 
            method="post" 
            className="relative flex justify-end items-center"
          >
            <Textarea 
              placeholder="Type your message..." 
              rows={2} 
              required
              name="message"
              className="resize-none"
            />
            <Button 
              type="submit" 
              size={"icon"} 
              className="absolute right-2"
            >
              <SendIcon className="size-4" />
            </Button>
          </Form>
        </CardHeader>
      </Card>
    </div>
  );
}

export const shouldRevalidate: ShouldRevalidateFunction = () => true;

