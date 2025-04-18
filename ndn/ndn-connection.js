import { connectToRouter } from "@ndn/autoconfig";
import { H3Transport } from "@ndn/quic-transport";

/**
 * Connect to an NDN Router
 * @param {string} pref - Router prefix
 * @returns {Promise<Face>}
 */
export async function connection(pref) {
  try {
    const { face } = await connectToRouter(pref, {
      H3Transport,
      testConnection: false,
    });
    return face;
  } catch (error) {
    throw new Error(`Failed to connect to router: ${error.message}`);
  }
}
