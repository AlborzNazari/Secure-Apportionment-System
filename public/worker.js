import { serveStatic } from "@cloudflare/kv-asset-handler";

export default {
  async fetch(request, env) {
    return await serveStatic(request, env);
  }
};
