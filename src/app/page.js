"use client";
import HomePage from "@/components/HomePage";
import SearchResults from "@/components/SearchResults";
import WithSearchParams from "@/components/WithSearchParams";
import { useSearchParams } from "next/navigation";

function SearchWrapper() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q");
  return q ? <SearchResults /> : <HomePage />;
}

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <WithSearchParams fallback={<div>Loading search...</div>}>
        <SearchWrapper />
      </WithSearchParams>
    </div>
  );
}