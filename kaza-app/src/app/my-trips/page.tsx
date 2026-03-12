"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, onAuthStateChange, signOut } from "@/lib/auth";
import { loadTrips, deleteTrip } from "@/lib/itinerary-service";
import { Trip } from "@/lib/itinerary-types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/loading-spinner";
import Link from "next/link";

export default function MyTripsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUserAndLoadTrips = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push("/auth");
        return;
      }
      setUser(currentUser);
      await fetchTrips();
    };

    checkUserAndLoadTrips();

    const { data: authListener } = onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        router.push("/auth");
      } else if (session?.user) {
        setUser(session.user);
        fetchTrips(); // Reload trips if user re-authenticates or session changes
      }
    });

    return () => {
      authListener?.unsubscribe();
    };
  }, [router]);

  const fetchTrips = async () => {
    setLoading(true);
    setError(null);
    try {
      const userTrips = await loadTrips();
      setTrips(userTrips);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (window.confirm("Are you sure you want to delete this trip?")) {
      setLoading(true);
      setError(null);
      try {
        await deleteTrip(tripId);
        await fetchTrips(); // Reload trips after deletion
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await signOut();
      router.push("/auth");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Trips</h1>
        <div className="flex gap-4">
          <Button onClick={handleSignOut} disabled={loading}>
            Sign Out
          </Button>
          <Link href="/plan">
            <Button>Create New Trip</Button>
          </Link>
        </div>
      </div>

      {error && <p className="text-red-500 mb-4">Error: {error}</p>}

      {trips.length === 0 ? (
        <p>You don't have any trips yet. Start planning one!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips.map((trip) => (
            <Card key={trip.id}>
              <CardHeader>
                <CardTitle>{trip.name}</CardTitle>
                <CardDescription>
                  {trip.start_date && trip.end_date
                    ? `${new Date(trip.start_date).toLocaleDateString()} - ${new Date(trip.end_date).toLocaleDateString()}`
                    : "Dates not set"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* You can display a summary of trip items here if needed */}
                <p className="text-sm text-muted-foreground">Items: {trip.trip_items?.length || 0}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link href={`/itinerary/${trip.id}`}>
                  <Button variant="outline">View Details</Button>
                </Link>
                <Button variant="destructive" onClick={() => handleDeleteTrip(trip.id)} disabled={loading}>
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
