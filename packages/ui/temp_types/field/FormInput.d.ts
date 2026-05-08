import * as React from 'react';
import { Input } from '@/components/ui/input';
export interface FormInputProps extends React.ComponentProps<typeof Input> {
    label?: React.ReactNode;
    description?: React.ReactNode;
    labelWidth?: React.CSSProperties['width'];
    orientation?: 'vertical' | 'horizontal' | 'responsive';
    showError?: boolean;
    required?: boolean;
    leftSide?: React.ReactNode;
    rightSide?: React.ReactNode;
}
/** 단순 텍스트 입력 (TanStack Form 기반) */
declare function FormInput({ label, description, labelWidth, orientation, showError, required, leftSide, rightSide, className, ref, ...inputProps }: Readonly<FormInputProps>): import("react/jsx-runtime").JSX.Element;
declare namespace FormInput {
    var displayName: string;
}
export default FormInput;
