import { MountainIcon } from "./navbar";

export function About() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gray-100 dark:bg-gray-800">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              NDN Research 2024
            </h1>
            <p className="max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
              Website ini dikembangkan untuk penelitian dan pembelajaran tentang
              Named Data Networking.
            </p>
            <button>
              <MountainIcon className="h-20 w-20" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
