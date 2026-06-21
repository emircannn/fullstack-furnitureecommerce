import axios, { AxiosInstance } from "axios";
import { getAccessToken, authApiClient } from "./auth-client";

/**
 * Genel API istemcisi.
 * authApiClient ile aynı interceptor ve token yenileme mekanizmasını paylaşır.
 * İsimlendirme kolaylığı ve temiz mimari için re-export edilir.
 */
export const apiClient: AxiosInstance = authApiClient;

export default apiClient;
