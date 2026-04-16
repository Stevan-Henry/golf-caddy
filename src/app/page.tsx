"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/hole/1");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-dvh bg-gray-950">
      <div className="text-white/30 text-sm">Loading...</div>
    </div>
  );
}
