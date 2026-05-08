import * as React from 'react';
import { SelectTrigger } from '@/components/ui/select';
export interface FormSelectItem {
    label: React.ReactNode;
    value: string;
    disabled?: boolean;
}
export interface FormSelectProps extends React.ComponentProps<typeof SelectTrigger> {
    label?: React.ReactNode;
    description?: React.ReactNode;
    labelWidth?: React.CSSProperties['width'];
    orientation?: 'vertical' | 'horizontal' | 'responsive';
    showError?: boolean;
    required?: boolean;
    items: FormSelectItem[];
    placeholder?: string;
}
/** 단일 선택 (TanStack Form 기반) */
declare function FormSelect({ label, description, labelWidth, orientation, showError, required, className, items, placeholder, ref, ...triggerProps }: Readonly<FormSelectProps>): import("react/jsx-runtime").JSX.Element;
declare namespace FormSelect {
    var displayName: string;
}
export default FormSelect;
