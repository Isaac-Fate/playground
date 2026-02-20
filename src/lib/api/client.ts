import axios, {
  type AxiosRequestTransformer,
  type AxiosResponseTransformer,
} from "axios";
import { convertKeysToCamelCase, convertKeysToSnakeCase } from "@/lib/cases";

// Normalize default transformers to arrays so they can be safely spread
const defaultRequestTransformers = [axios.defaults.transformRequest]
  .flat()
  .filter(Boolean) as AxiosRequestTransformer[];
const defaultResponseTransformers = [axios.defaults.transformResponse]
  .flat()
  .filter(Boolean) as AxiosResponseTransformer[];

export const apiClient = axios.create({
  baseURL: getBackendBaseUrl(),

  // Send requests with cookies
  withCredentials: true,

  // Convert request body keys from camelCase to snake_case before the
  // default transformers serialize the payload to JSON.
  transformRequest: [
    (data, headers) => {
      if (data && headers["Content-Type"] === "application/json") {
        return convertKeysToSnakeCase(data);
      }
      return data;
    },
    ...defaultRequestTransformers,
  ],

  // The default transformers parse the raw JSON string into an object first,
  // then we unwrap the API response envelope and convert keys to camelCase.
  transformResponse: [
    ...defaultResponseTransformers,
    (data: unknown) => {
      if (data && typeof data === "object" && "success" in data) {
        const res = data as { success: boolean; data?: unknown };
        if (res.success) {
          return convertKeysToCamelCase(res.data);
        }
      }
      return data;
    },
  ],
});

function getBackendBaseUrl(): string {
  // In development, read from env variable
  if (import.meta.env.DEV) {
    const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;
    if (!backendBaseUrl) {
      throw new Error("VITE_BACKEND_BASE_URL is not set");
    }

    return backendBaseUrl;
  }

  // In production, use same origin (nginx proxies to backend)
  return "";
}
