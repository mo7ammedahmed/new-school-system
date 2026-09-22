import { useT } from '@/hooks/useT';

type FormErrorsProps = {
    errors: Record<string, string>;
};

/**
 * Summary of server-side validation errors. Inertia keeps these in the form
 * store; without rendering them a rejected submit looks like a dead button.
 */
export function FormErrors({ errors }: FormErrorsProps) {
    const { t } = useT();
    const messages = Object.values(errors).filter(Boolean);

    if (messages.length === 0) {
        return null;
    }

    return (
        <div
            role="alert"
            className="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm"
        >
            <p className="font-medium">{t('common.fixErrors')}</p>
            <ul className="mt-1 list-inside list-disc">
                {messages.map((message) => (
                    <li key={message}>{message}</li>
                ))}
            </ul>
        </div>
    );
}
