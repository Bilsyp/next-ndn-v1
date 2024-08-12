import Nfd from "./nfd";
import { parseStringPromise } from "xml2js";

export const revalidate = 10;

export async function fetching() {
  try {
    const xhr = await fetch("http://localhost:4545/");

    const xmlText = await xhr.text();
    const parseData = await parseStringPromise(xmlText);
    // console.log(parseData.nfdStatus.fib[0].fibEntry);
    return parseData?.nfdStatus;
  } catch (error) {
    return error;
  }
}

export default async function page() {
  const data = await fetching();
  return (
    <div>
      {/* <Nfd data={data} /> */}
      {data?.fib[0]?.fibEntry.map((item, key) => {
        return <h1 key={key}>{item.prefix}</h1>;
      })}
    </div>
  );
}

// const page = async () => {
//   const data = await fetching();
//   return (
//     <div>
//       <Nfd data={data} />
//     </div>
//   );
// };

// export default page;
