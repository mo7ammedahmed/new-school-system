import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

type FormFieldProps = {
  label: string
  description?: string
  htmlFor?: string
  id?: string
  required?: boolean
  disabled?: boolean
  // The actual input component can be passed as children
  children: React.ReactNode
  // Optional: specify input type to render appropriate component
  asChild?: 'input' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'switch'
  // For select options
  options?: Array<{ label: string; value: string | number }>
  // For radio group
  radioOptions?: Array<{ label: string; value: string | number }>
}

export function FormField({
  label,
  description,
  htmlFor,
  id,
  required,
  disabled,
  children,
  asChild,
  options,
  radioOptions,
}: FormFieldProps) {
  const finalId = id || htmlFor || `form-field-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className="space-y-2">
      <Label htmlFor={finalId} className={cn('font-medium', { 'text-muted-foreground': disabled })}>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <div className="flex items-start space-x-3">
        {/* We'll render the children directly; they should be an input component */}
        <div className="flex min-w-0 flex-1">{children}</div>
      </div>
    </div>
  )
}

// Helper components for common field types
export function FormInputField(props: FormFieldProps & {
  type?: HTMLInputTypeAttribute
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  minLength?: number
  maxLength?: number
}) {
  return (
    <FormField {...props}>
      <Input
        type={props.type ?? 'text'}
        value={props.value ?? ''}
        onChange={props.onChange}
        placeholder={props.placeholder}
        minLength={props.minLength}
        maxLength={props.maxLength}
        disabled={props.disabled}
      />
    </FormField>
  )
}

export function FormTextareaField(props: FormFieldProps & {
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  minLength?: number
  maxLength?: number
  rows?: number
}) {
  return (
    <FormField {...props} asChild="textarea">
      <textarea
        value={props.value ?? ''}
        onChange={props.onChange}
        placeholder={props.placeholder}
        minLength={props.minLength}
        maxLength={props.maxLength}
        rows={props.rows ?? 4}
        disabled={props.disabled}
        className="textarea textarea-bordered w-full"
      />
    </FormField>
  )
}

export function FormSelectField(props: FormFieldProps & {
  value?: string | number
  onChange?: (value: string | number) => void
  options: Array<{ label: string; value: string | number }>
  placeholder?: string
}) {
  return (
    <FormField {...props} asChild="select">
      <Select
        value={props.value ?? ''}
        onValueChange={props.onChange}
        placeholder={props.placeholder}
        disabled={props.disabled}
      >
        {props.options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </FormField>
  )
}