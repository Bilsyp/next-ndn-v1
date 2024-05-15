import { createClient } from "next-sanity";
import ImageUrlBuilder from "@sanity/image-url";
export const client = createClient({
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-05-15",
  useCdn: false,
});

export const builder = ImageUrlBuilder(client);

export const urlForImage = (source) => {
  return builder?.image(source).auto("format").fit("max").url();
};
