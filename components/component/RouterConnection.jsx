// --- File: components/RouterConnection.jsx ---
import { CardTitle, CardContent, Card } from "@/components/ui/card";
import { connection } from "@/ndn/ndn-connection";
import { useState, useEffect } from "react";

export function RouterConnection() {
  const [hasRouterError, setHasRouterError] = useState(false);
  const [, setHasRouterErrorConnection] = useState(false);
  const [getRouter, setGetRouter] = useState("");
  const [getConnection, setGetConnection] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const connectToRouter = async () => {
      setLoading(true);
      const url = `ws://167.205.57.173:9696/ws/`;
      setGetRouter(url);

      try {
        const coon = await connection(url);
        setGetConnection(coon);
        setHasRouterErrorConnection(false);
        setHasRouterError(false);
      } catch (error) {
        setHasRouterErrorConnection(error.message);
        setHasRouterError(true);
      } finally {
        setLoading(false);
      }
    };

    connectToRouter();
  }, []);

  return (
    <Card className="w-full max-w-xl mx-auto">
      <div className="flex items-center justify-between p-4">
        <CardTitle className="text-xl">Connection Check</CardTitle>
        <div className="relative">
          <div
            className={`h-5 w-5 rounded-full ${
              hasRouterError ? "bg-red-600" : "bg-green-500"
            } animate-bounce`}
          />
          <div
            className={`absolute top-0 left-0 h-5 w-5 rounded-full ${
              hasRouterError ? "bg-red-500" : "bg-green-500"
            }`}
          />
        </div>
      </div>

      <CardContent className="flex items-center justify-center gap-4 py-1">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <NetworkIcon
            className={`h-6 w-6 ${loading ? "animate-spin" : ""} text-gray-500 dark:text-gray-400`}
          />
        </div>

        {loading && <h2 className="flex gap-4">Searching for Router...</h2>}

        {getRouter && (
          <div className="getRouter py-4">
            {getConnection ? (
              <>
                <h2>Connection Successful</h2>
                <h3 className="py-3">
                  Router Connected:
                  <span className="lg:inline lg:py-0 block py-3">{getRouter}</span>
                </h3>
              </>
            ) : (
              <span>Router Acquired</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function NetworkIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="16" y="16" width="6" height="6" rx="1" />
      <rect x="2" y="16" width="6" height="6" rx="1" />
      <rect x="9" y="2" width="6" height="6" rx="1" />
      <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" />
      <path d="M12 12V8" />
    </svg>
  );
}
