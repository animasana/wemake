import { Resend } from "resend";
import { render } from "@react-email/components";
import type { Route } from "./+types/welcome-page";
import WelcomeUser from "react-email-starter/emails/welcome-user";

const client = new Resend(process.env.RESEND_API_KEY);

export const loader = async ({ params }: Route.LoaderArgs) => {    
    const { data, error } = await client.emails.send({
        from: "Oogway <oogway@mail.gigsoft.xyz>",
        to: "animagig@gmail.com",
        subject: "Welcome to GiGSoft.xyz",
        react: <WelcomeUser username={"Rsend"} />,
    });

    return Response.json({ data, error });
}

