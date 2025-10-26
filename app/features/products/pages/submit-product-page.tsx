import { Hero } from "~/common/components/hero";
import { Form, redirect } from "react-router";
import InputPair from "~/common/components/input-pair";
import SelectPair from "~/common/components/select-pair";
import { Input } from "~/common/components/ui/input";
import { Label } from "~/common/components/ui/label";
import { Activity, useState } from "react";
import { Button } from "~/common/components/ui/button";
import type { Route } from "./+types/submit-product-page";
import { makeSSRClient } from "~/supa-client";
import { getLoggedInUserId } from "~/features/users/queries";
import z from "zod";
import { getCategories } from "../queries";
import { createProduct } from "../mutations";


export const meta: Route.MetaFunction  = () => {
  return [
    { title: "Submit Product | WeMake" },
    { name: "description", content: "Submit your product" },
  ];
}

const formSchema = z.object({
  name: z.string().min(1),
  tagline: z.string().min(1),
  url: z.string().min(1),
  description: z.string().min(1),
  howItWorks: z.string().min(1),
  category: z.coerce.number(),
  icon: z.instanceof(File).refine((file) => {
    return file.size <= 2 * 1024 * 1024 && file.type.startsWith("image/");
  }),
});

export const action = async ({ request }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  const userId = await getLoggedInUserId(client);
  const formData = await request.formData();
  const {data, success, error} = formSchema.safeParse(Object.fromEntries(formData));
  if (!success) {
    return { formErrors: z.flattenError(error).fieldErrors };
  }
  const { icon, ...rest } = data;
  const { data: uploadData, error: uploadError } = await client.storage
    .from("icons")
    .upload(`${userId}/${Date.now()}`, icon, {
      contentType: icon.type,
      upsert: false,
    });
  if (uploadError) {
    return { formErrors: { icon: ["Failed to upload icon"] } };
  }
  const {
    data: { publicUrl }
  } = await client.storage.from("icons").getPublicUrl(uploadData.path);
  const productId = await createProduct(client, {
    name: rest.name,
    tagline: rest.tagline,
    description: rest.description,
    howItWorks: rest.howItWorks,
    url: rest.url,
    iconUrl: publicUrl,
    categoryId: rest.category,
    userId,
  });
  return redirect(`/products/${productId}`);  
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const userId = await getLoggedInUserId(client);
  const categories = await getCategories(client);
  return { categories };
};

export default function SubmitProductPage({ loaderData, actionData }: Route.ComponentProps) {
  const [icon, setIcon] = useState<string | null>(null);
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIcon(URL.createObjectURL(file));
    }
  }

  return (
    <div>
      <Hero 
        title="Submit Your Product" 
        subtitle="Share your product with the world"
      />
      <Form 
        method="post"
        encType="multipart/form-data"
        className="grid grid-cols-2 gap-10 max-w-screen-lg mx-auto"        
      >
        <div className="space-y-5">
          <InputPair
            label="Name"
            description="This is the name of your product"
            id="name"
            name="name"
            type="text"
            required
            placeholder="Name of your product"
          />
          <Activity mode={actionData && "formErrors" in actionData && actionData?.formErrors?.name ? "visible" : "hidden"}>
            <p className="text-red-500">{actionData?.formErrors.name}</p>
          </Activity>
          <InputPair
            label="Tagline"
            description="(60 characters or less)"
            id="tagline"
            name="tagline"            
            required
            type="text"
            placeholder="A concise description of your product"
          />
          <Activity mode={actionData && "formErrors" in actionData && actionData?.formErrors?.tagline ? "visible" : "hidden"}>
            <p className="text-red-500">{actionData?.formErrors.tagline}</p>
          </Activity>
          <InputPair
            label="URL"
            description="The URL of your product"            
            id="url"
            name="url"            
            required
            type="url"
            placeholder="https://example.com"
          />
          <Activity mode={actionData && "formErrors" in actionData && actionData?.formErrors?.url ? "visible" : "hidden"}>
            <p className="text-red-500">{actionData?.formErrors.url}</p>
          </Activity>
          <InputPair
            textArea
            label="Description"
            description="A detailed description of your product"
            id="description"
            name="description"            
            required
            type="text"
            placeholder="A detailed description of your product"
          />
          <Activity mode={actionData && "formErrors" in actionData && actionData?.formErrors?.description ? "visible" : "hidden"}>
            <p className="text-red-500">{actionData?.formErrors.description}</p>
          </Activity>
          <InputPair
            textArea
            label="How it works"
            description="A detailed description of how your product howItWorks"
            id="howItWorks"    
            name="howItWorks"            
            required
            type="text"
            placeholder="A detailed description of how your product works"
          />
          <Activity mode={actionData && "formErrors" in actionData && actionData?.formErrors?.howItWorks ? "visible" : "hidden"}>
            <p className="text-red-500">{actionData?.formErrors.howItWorks}</p>
          </Activity>
          <SelectPair
            label="Category"
            description="The category of your product"
            name="category"
            required
            placeholder="Select a category"
            options={loaderData.categories.map((category) => ({
              label: category.name,
              value: category.category_id.toString(),
            }))}
          />
          <Activity mode={actionData && "formErrors" in actionData && actionData?.formErrors?.category ? "visible" : "hidden"}>
            <p className="text-red-500">{actionData?.formErrors.category}</p>
          </Activity>
          <Button type="submit" className="w-full" size="lg">
            Submit
          </Button>          
        </div>
        <div className="flex flex-col space-y-2">          
          <div className="size-40 rounded-xl shadow-xl overflow-hidden">
            {icon && (  
              <img src={icon} alt="icon" className="object-cover w-full h-full" />            
            )}
          </div>
          <Label className="flex flex-col gap-1 items-start">
            Icon{" "}
            <small className="text-muted-foreground">
              This is the Icon of your product.
            </small>
          </Label>
          
          <Input 
            type="file" 
            className="w-1/2" 
            onChange={onChange} 
            required 
            name="icon" 
          />
          <Activity mode={actionData && "formErrors" in actionData && actionData?.formErrors?.icon ? "visible" : "hidden"}>
            <p className="text-red-500">{actionData?.formErrors.icon}</p>
          </Activity>
          <div className="flex flex-col text-xs">
            <span className="text-muted-foreground">
              Recommended size: 128x128px
            </span>
            <span className="text-muted-foreground">
              Allowed formats: PNG, JPG, SVG
            </span>
            <span className="text-muted-foreground">
              Max file size: 1MB
            </span>
          </div>          
        </div>
      </Form>
    </div>
  );
}