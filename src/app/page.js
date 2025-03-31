"use client";
import HomePage from "@/components/HomePage";
import SearchResults from "@/components/SearchResults";

import { useSearchParams } from "next/navigation";

export default function Home() {
  const searchParams = useSearchParams();

  const q = searchParams.get("q");

  return (
    <div className="container mx-auto p-4">
      {q ? <SearchResults /> : <HomePage />}
    </div>
  );
}
