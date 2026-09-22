import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

type UserCellProps = {
    id: number;
    name: string;
    image?: string;
    className?: string;
};

export function UserCell({ name, image, className }: UserCellProps) {
    return (
        <div className={cn('flex items-center space-x-3', className)}>
            <Avatar src={image} size={32} />
            <span className="text-sm font-medium">{name}</span>
        </div>
    );
}
