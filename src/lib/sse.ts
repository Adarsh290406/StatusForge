import { EventEmitter } from "events";

class SSEEmitter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(200); // Support up to 200 concurrent user streams
  }
}

// Global singleton to prevent recreating during HMR/hot-reloads
const globalRef = globalThis as unknown as { sseEmitter?: SSEEmitter };
export const sseEmitter = globalRef.sseEmitter || new SSEEmitter();

if (process.env.NODE_ENV !== "production") {
  globalRef.sseEmitter = sseEmitter;
}
