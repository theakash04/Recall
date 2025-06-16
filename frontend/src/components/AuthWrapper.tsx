"use client";
import { useEffect, useState } from "react";
import { getBrowserClient } from "@/utils/supabase/client";
import { useUserStore } from "@/store/useStore";
import FullScreenLoader from "./Loading";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { user as MyUser } from "@/types/userTypes";

// 1️⃣ Mapper: SupabaseUser → MyUser
function mapUser(u: SupabaseUser): MyUser {
  const { user_metadata: meta, email } = u;
  return {
    full_name: meta.full_name,
    avatar_url: meta.avatar_url,
    email: email!,
    email_verified: meta.email_verified,
  };
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [initializing, setInitializing] = useState(true);
  const supabase = getBrowserClient();
  const setUser = useUserStore((s) => s.setUser);
  const clearUser = useUserStore((s) => s.clearUser);

  useEffect(() => {
    // Initial check
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUser(mapUser(user));
      else clearUser();
      setInitializing(false);
    });

    // Subscribe to changes
    const { data: sub } = supabase.auth.onAuthStateChange((_, session) => {
      const u = session?.user;
      if (u) setUser(mapUser(u));
      else clearUser();
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase, setUser, clearUser]);

  if (initializing) return <FullScreenLoader />;
  return <>{children}</>;
}
