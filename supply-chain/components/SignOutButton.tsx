"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-md border px-3 py-2 text-sm hover:bg-gray-100"
    >
      Sign out
    </button>
  );
}
