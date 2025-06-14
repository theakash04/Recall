"use client";

import { Suspense } from "react";
import SetCookiesClient from "./SetCookiesClient";

export default function SetCookiesPage() {
  return (
    <Suspense fallback={<div>Logging in...</div>}>
      <SetCookiesClient />
    </Suspense>
  );
}
