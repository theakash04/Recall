import { user } from "@/types/userTypes";
import axios from "axios";
import { toast } from "sonner";

export async function fetchUser() {
  try {
    const res = await axios.get<user>(
      `${process.env.NEXT_PUBLIC_SERVER_API}/auth/get-user`,
      {
        withCredentials: true,
      }
    );

    if (res.status === 200) {
      return res.data;
    }
  } catch (err) {
    toast.error("Please login again!", {
      description: "Error fetching user data!",
    });
    throw err;
  }
}

export async function logoutUser() {
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_SERVER_API}/auth/logout`,
    {
      withCredentials: true,
    }
  );
  if (res.status === 200) return true;
  return false;
}
