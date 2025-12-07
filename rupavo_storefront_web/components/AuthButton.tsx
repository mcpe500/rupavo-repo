"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { User, LogOut } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export function AuthButton() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-10 w-10 bg-gray-200 animate-pulse rounded-full" />
        <div className="h-4 w-24 bg-gray-200 animate-pulse rounded hidden sm:block" />
      </div>
    );
  }

  if (user) {
    const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
    const displayName = user.user_metadata?.full_name || user.user_metadata?.name;
    const email = user.email;

    return (
      <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-2 py-1.5 shadow-sm">
        {/* Profile Picture */}
        <div className="relative w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName || "Profile"}
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="text-white font-semibold text-sm">
              {email?.charAt(0).toUpperCase() || "U"}
            </span>
          )}
        </div>

        {/* User Info */}
        <div className="hidden sm:flex flex-col items-start min-w-0">
          {displayName && (
            <span className="text-sm font-medium text-gray-900 truncate max-w-[140px]">
              {displayName}
            </span>
          )}
          <span className="text-xs text-gray-500 truncate max-w-[140px]">
            {email}
          </span>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors ml-1"
          title="Keluar"
          aria-label="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/auth/login"
      className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors font-medium shadow-sm"
    >
      <User className="w-4 h-4" />
      <span>Masuk</span>
    </Link>
  );
}

