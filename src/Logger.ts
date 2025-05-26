import debug from "debug";

const logger = debug("japanpost-api");

export function debugLog(message: () => string) {
  if (debug.enabled(logger.namespace)) {
    const msg = message();
    if (msg) {
      logger(msg);
    }
  }
}
