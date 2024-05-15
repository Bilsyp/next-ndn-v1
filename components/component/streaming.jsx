import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card";
import {
  AccordionTrigger,
  AccordionContent,
  AccordionItem,
  Accordion,
} from "@/components/ui/accordion";
import { parameter } from "@/lib/parameter";
import { content } from "@/data/conten";
export function Streaming({ setContent, children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6 max-w-6xl mx-auto py-8 px-4">
      <div className="aspect-video rounded-lg l">
        {children}
        <span className="w-full h-full object-cover rounded-md bg-gray-100 dark:bg-gray-800" />
      </div>
      <div className="grid gap-2">
        {content.map((item) => {
          return (
            <div
              key={item.content}
              className="grid cursor-pointer grid-cols-[80px_1fr] gap-4"
            >
              <img
                onClick={() => setContent(item.content)}
                alt="Thumbnail"
                className="rounded-md object-cover"
                height={45}
                src={item.thumbnail}
                style={{
                  aspectRatio: "80/45",
                  objectFit: "cover",
                }}
                width={80}
              />
              <div>
                <h3
                  onClick={() => setContent(item.content)}
                  className="font-medium line-clamp-2"
                >
                  {item.content}
                </h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {item.durations}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Video Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {parameter.map((item) => {
                return (
                  <div key={item.content} className="space-y-1">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {item.content}
                    </div>
                    <div className="font-medium" id={item.content}>
                      12.3K
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        <Accordion collapsible type="single">
          <AccordionItem value="stats-breakdowns">
            <AccordionTrigger className="text-base">
              Panduan Streaming
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 text-sm">
                Ketika pertama kali mengunjungi halaman ini, pengguna dapat
                memilih video dari daftar yang tersedia dan memutarnya. Namun,
                jika pengguna mengubah ABR (Adaptive Bitrate), mereka perlu
                mengubah ABR kembali untuk memutar video selanjutnya. ABR
                defaultnya adalah Throughput Base. Jika pengguna mengatur
                kembali ke default, mereka dapat memilih secara bebas seperti
                pertama kali, karena tiga ABR lainnya masih dalam tahap
                pengembangan.
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="stats-breakdown">
            <AccordionTrigger className="text-base">
              Breakdown of Statistics
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 text-sm">
                {parameter.map((item) => {
                  return (
                    <article key={item.content}>
                      <p>
                        <b className="underline">{item.content}</b> :{" "}
                        {item.descripsi}
                      </p>
                    </article>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
