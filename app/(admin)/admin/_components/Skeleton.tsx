import React from 'react';

interface SkeletonProps {
    className?: string;
    style?: React.CSSProperties;
}

export function Skeleton({ className = "", style }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse bg-muted rounded-md ${className}`}
            style={style}
        />
    );
}

export function SkeletonCard() {
    return (
        <div className="bg-card rounded-2xl border border-border shadow-sm p-5 space-y-4">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-3 w-1/4" />
        </div>
    );
}

export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number, cols?: number }) {
    return (
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden w-full">
            <div className="bg-muted/60 p-4 border-b border-border flex gap-4">
                {Array.from({ length: cols }).map((_, i) => (
                    <Skeleton key={`th-${i}`} className="h-4 flex-1" />
                ))}
            </div>
            <div className="divide-y divide-border">
                {Array.from({ length: rows }).map((_, r) => (
                    <div key={`tr-${r}`} className="p-4 flex gap-4 items-center">
                        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                        {Array.from({ length: cols - 1 }).map((_, c) => (
                            <Skeleton key={`td-${r}-${c}`} className="h-4 flex-1" />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
