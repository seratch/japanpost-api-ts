import debug from "debug";

const logger = debug("japanpost-api");

export function debugLog(message: () => string) {
  if (logger.enabled) {
    const msg = message();
    if (msg) {
      logger(msg);
    }
  }
}
