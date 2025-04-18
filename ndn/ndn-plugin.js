// --- File: plugins/ndn-plugin.js ---
import shaka from "shaka-player";
import { VideoFetcher, FileFetcher } from "./ndn-fetcher";

let vf = new VideoFetcher();

export function NdnPlugin(uri, _, requestType) {
  const ff = new FileFetcher(vf, uri, requestType);

  return new shaka.util.AbortableOperation(
    vf.queue.add(async () => {
      try {
        return await ff.retrieve();
      } catch (err) {
        ff.handleError();
      }
    }),
    () => ff.abort.abort()
  );
}

NdnPlugin.reset = () => {
  vf = new VideoFetcher();
};

NdnPlugin.getInternals = () => vf;
