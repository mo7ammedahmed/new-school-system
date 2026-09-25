import { cn } from '@/lib/utils';
import * as React from 'react';
import { Clock } from 'lucide-react';

import {
    TimelineItem,
    TimelineContent,
    TimelineDot,
} from '@/components/dashboard/timeline';

type ActivityFeedProps = {
    className?: string;
    activities: Activity[];
};

type Activity = {
    id: string;
    title: string;
    description?: string;
    timestamp: string | Date;
    type?: 'info' | 'success' | 'warning' | 'error';
    icon?: React.ReactNode;
    actionText?: string;
    actionHref?: string;
};

export function ActivityFeed({ className, activities }: ActivityFeedProps) {
    if (activities.length === 0) {
        return (
            <div className={cn('py-8 text-center', className)}>
                <p className="text-muted-foreground">No recent activity</p>
            </div>
        );
    }

    return (
        <div className={cn('space-y-4', className)}>
            {activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
            ))}
        </div>
    );
}

function ActivityItem({ activity }: { activity: Activity }) {
    const icon = activity.icon ?? <Clock className="h-4 w-4" />;

    return (
        <TimelineItem className="mb-4 last:mb-0">
            <TimelineDot
                filled
                color={
                    activity.type === 'success'
                        ? 'success'
                        : activity.type === 'error'
                          ? 'destructive'
                          : activity.type === 'warning'
                            ? 'warning'
                            : 'default'
                }
            >
                {icon}
            </TimelineDot>
            <TimelineContent className="space-y-2">
                <div className="flex items-baseline justify-between">
                    <h3 className="text-foreground font-medium">
                        {activity.title}
                    </h3>
                    <time className="text-muted-foreground text-xs">
                        {new Date(activity.timestamp).toLocaleString()}
                    </time>
                </div>
                {activity.description && (
                    <p className="text-muted-foreground text-sm">
                        {activity.description}
                    </p>
                )}
                {activity.actionText && activity.actionHref && (
                    <a
                        href={activity.actionHref}
                        className="text-primary text-sm font-medium hover:underline"
                    >
                        {activity.actionText}
                    </a>
                )}
            </TimelineContent>
        </TimelineItem>
    );
}
