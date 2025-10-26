import { Form, redirect, useNavigation, useSearchParams } from "react-router";
import type { Route } from "./+types/otp-complete-page";
import { InputPair } from "~/common/components/input-pair";
import { Button } from "~/common/components/ui/button";
import { z } from "zod";
import { makeSSRClient } from "~/supa-client";
import { LoaderCircle } from "lucide-react";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Verify OTP | WeMake" }
  ];
}

const formSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(6).max(6),
});

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const { data, success, error } = formSchema.safeParse(Object.fromEntries(formData));
  if (!success) {
    return { fieldErrors: error.flatten().fieldErrors };
  }
  const { email, otp } = data;
  const { client, headers } = makeSSRClient(request);

  const { error: verifyError } = await client.auth.verifyOtp({
    email,
    token: otp,
    type: "email",
  });
  if (verifyError) {
    return { verifyError: verifyError.message };    
  }

  return redirect("/", { headers });
};

export default function OtpPage({ actionData }: Route.ComponentProps) {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const naviagation = useNavigation();
  const isSubmitting = naviagation.state === "submitting" || naviagation.state === "loading";
  return (
    <div className="flex flex-col relative items-center justify-center h-full ml-10">      
      <div className="flex items-center flex-col justify-center w-full max-w-md gap-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-semibold">Confirm OTP</h1>
          <p className="text-sm text-muted-foreground">
            Enter the OTP code sent to your email address.
          </p>
        </div>
        <Form className="w-full space-y-4" method="post">
          <InputPair
            label="Email"
            description="Enter your email address"
            name="email"
            defaultValue={email || ""}
            id="email"
            required
            type="email"
            placeholder="i.e wemake@example.com"
          />
          {actionData && "fieldErrors" in actionData && (
            <p className="text-sm text-red-500">
              {actionData?.fieldErrors?.email?.join(", ")}
            </p>
          )}      
          <InputPair
            label="OTP"
            description="Enter the OTP code sent to your email address"
            name="otp"
            id="otp"
            required
            type="text"
            placeholder="i.e. 012345"
          />
          {actionData && "fieldErrors" in actionData && (
            <p className="text-sm text-red-500">
              {actionData?.fieldErrors?.otp?.join(", ")}
            </p>
          )}
          {actionData && "verifyError" in actionData && (
            <p className="text-sm text-red-500">{actionData.verifyError}</p>
          )}
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <LoaderCircle className= "animate-spin" />
            ) : (
              "Verify OTP"
            )}            
          </Button>
        </Form>
      </div>
    </div>
  );
}