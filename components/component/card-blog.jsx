import { urlForImage } from "@/sanity/lib/image";
import Link from "next/link";
import { Button } from "../ui/button";

export function CardBlog({ title, smallDescription, titleImage, currentSlug }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md dark:bg-gray-950">
      <img
        alt="Blog Post Image"
        className="w-full h-48 object-cover"
        height={400}
        src={urlForImage(titleImage)}
        style={{
          aspectRatio: "600/400",
          objectFit: "cover",
        }}
        width={600}
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 line-clamp-3">
          {smallDescription}
        </p>
        <Button className=" dark:text-gray-100 font-semibold mt-4 w-full">
          <Link href={`/blog/${currentSlug}`}>Read More</Link>
        </Button>
      </div>
    </div>
  );
}
