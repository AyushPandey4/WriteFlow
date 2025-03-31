// components/WithSearchParams.js
"use client";
import { Suspense } from "react";

export default function WithSearchParams({ children, fallback = "Loading..." }) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}