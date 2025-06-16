import axios from "axios";
import { getBrowserClient } from "@/utils/supabase/client";

const supabase = getBrowserClient();

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_API,
});

api.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
