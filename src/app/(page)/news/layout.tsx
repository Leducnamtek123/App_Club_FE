"use client";
import { CircularProgress } from "@heroui/react";
import { Suspense } from "react";


export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <main>
            <Suspense fallback={<CircularProgress />}>{children}</Suspense>
        </main>
    )
}
