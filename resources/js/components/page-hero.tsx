import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * The banner a top-level page opens with: where you are, what the page is
 * called, and one line saying what it is for. Owned here so every workspace,
 * portal and admin page keeps the same geometry.
 */
export function PageHero({
    eyebrow,
    title,
    subtitle,
    children,
    className,
}: {
    /** Context line — the school name, or the role's perspective. */
    eyebrow?: ReactNode;
    title: ReactNode;
    subtitle?: ReactNode;
    /** Usually a row of `PageHeroStat` chips. */
    children?: ReactNode;
    className?: string;
}) {
    return (
        <header
            className={cn(
                'bg-hero-bg rounded-lg p-6 text-white md:p-8',
                className,
            )}
        >
            {eyebrow ? (
                <p className="text-hero-muted text-sm font-semibold">
                    {eyebrow}
                </p>
            ) : null}
            <h1 className="mt-2 text-3xl font-semibold md:text-4xl">{title}</h1>
            {subtitle ? (
                <p className="text-hero-accent mt-3 max-w-2xl leading-7">
                    {subtitle}
                </p>
            ) : null}
            {children}
        </header>
    );
}

export function PageHeroStats({ children }: { children: ReactNode }) {
    return <div className="mt-5 flex flex-wrap gap-3">{children}</div>;
}

/** A single figure inside the banner. */
export function PageHeroStat({ children }: { children: ReactNode }) {
    return (
        <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold">
            {children}
        </span>
    );
}
