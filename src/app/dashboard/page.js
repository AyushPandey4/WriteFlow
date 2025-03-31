"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useUser } from "@clerk/nextjs";
import Overview from "@/components/Overview";

export default function DashboardPage() {
  return (
    <div>
      <Overview />
    </div>
  );
}
