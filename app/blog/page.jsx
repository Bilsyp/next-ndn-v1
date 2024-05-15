import { CardBlog } from "@/components/component/card-blog";
import { client } from "@/connection/client";

export const revalidate = 30;

async function getData() {
  try {
    const query = `
    *[_type == "blog" ] | order(releaseDate desc) | order(_createdAt asc){
      title,
      smallDescription,
      "currentSlug":slug.current,
       titleImage}`;
    const data = await client.fetch(query);
    return data;
  } catch (error) {
    console.log(error);
  }
}

export default async function Home() {
  const data = await getData();
  return (
    <div className="container mx-auto">
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4 py-8 md:px-6 lg:py-12">
        {data.reverse().map((item, idx) => {
          return <CardBlog {...item} key={idx} />;
        })}
      </section>
    </div>
  );
}
