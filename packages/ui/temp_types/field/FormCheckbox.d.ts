import * as React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
export interface FormCheckboxProps extends React.ComponentProps<typeof Checkbox> {
    label?: React.ReactNode;
    description?: React.ReactNode;
    labelWidth?: React.CSSProperties['width'];
    orientation?: 'vertical' | 'horizontal' | 'responsive';
    showError?: boolean;
    required?: boolean;
}
/** 단일 체크박스 (TanStack Form 기반) */
declare function FormCheckbox({ label, description, labelWidth, orientation, showError, required, className, ref, ...checkboxProps }: Readonly<FormCheckboxProps>): import("react/jsx-runtime").JSX.Element;
declare namespace FormCheckbox {
    var displayName: string;
}
export default FormCheckbox;
