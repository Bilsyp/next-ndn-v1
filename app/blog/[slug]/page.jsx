import { client } from "@/sanity/lib/client";
import { urlForImage } from "@/sanity/lib/image";
import { PortableText } from "@portabletext/react";
import Image from "next/image";
export const revalidate = 30;

async function getData(slug) {
  const query = `*[_type == "blog" && slug.current == '${slug}']{
        "currentSlug":slug.current,
          title,
          content,
          titleImage
      }[0]`;
  const data = await client.fetch(query);

  return data;
}

export default async function BlogArticle({ params }) {
  const data = await getData(params.slug);
  const myPortableTextComponents = {
    types: {
      image: ({ value }) => {
        return (
          <Image
            priority
            width={800}
            height={400}
            alt="png"
            className="border"
            src={urlForImage(value.asset._ref)}
          />
        );
      },
    },
  };
  return (
    <div className="containers mx-auto   prose-xl px-10">
      <h1>
        <span className="block text-base text-center text-primary font-semibold tracking-wide uppercase">
          Bilsyp - Blog
        </span>
        <span className="mt-2 block text-3xl text-center leading-8 tracking-tight font-bold sm:text-2xl">
          {data.title}
        </span>
      </h1>
      <Image
        src={urlForImage(data.titleImage)}
        width={800}
        height={400}
        alt="titleImage"
        priority
        className="my-8 rounded-md mx-auto border"
      />
      <div className="my-10 prose-blue prose-xl  porse-p:text-[0.89rem] lg:prose-p:text-xl dark:prose-invert  prose-a:underline  prose-a:text-blue-600">
        <PortableText
          components={myPortableTextComponents}
          value={data.content}
        />
      </div>
    </div>
  );
}
