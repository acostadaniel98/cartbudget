import { SITE_CONFIG } from "@/config/site";

export function getAppUrl(request?: Request) {
  if (process.env.NODE_ENV === "development" && request) {
    return new URL(request.url).origin;
  }

  return process.env.NEXT_PUBLIC_APP_URL ?? SITE_CONFIG.url;
}