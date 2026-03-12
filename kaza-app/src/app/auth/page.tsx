"use client";

import { useEffect, useState } from "react";
import { AuthForm } from "@/components/auth";
import { getCurrentUser, onAuthStateChange } from "@/lib/auth";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/loading-spinner"; // Assuming a loading spinner component exists or will be created

export default function AuthPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        router.push("/my-trips");
      } else {
        setLoading(false);
      }
    };

    checkUser();

    const { data: authListener } = onAuthStateChange((event, session) => {
      if (session?.user) {
        router.push("/my-trips");
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      authListener?.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <AuthForm />
    </div>
  );
}
