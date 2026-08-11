"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { clerkEnabled } from "@/lib/auth-config";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0]?.toUpperCase())
    .filter(Boolean)
    .slice(0, 2)
    .join("");
}

export function AccountControl({ userName }: { userName?: string }) {
  if (clerkEnabled) {
    return <UserButton />;
  }

  return (
    <Link href="/profile" title="Profile settings" style={{ textDecoration: "none" }}>
      <div className="nav-avatar account-fallback">
        {userName ? initials(userName) : "SF"}
      </div>
    </Link>
  );
}
