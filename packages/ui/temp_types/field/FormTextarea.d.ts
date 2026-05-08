import * as React from 'react';
import { Textarea } from '@/components/ui/textarea';
export interface FormTextareaProps extends React.ComponentProps<typeof Textarea> {
    label?: React.ReactNode;
    description?: React.ReactNode;
    labelWidth?: React.CSSProperties['width'];
    orientation?: 'vertical' | 'horizontal' | 'responsive';
    showError?: boolean;
    required?: boolean;
}
/** 텍스트 영역 입력 (TanStack Form 기반) */
declare function FormTextarea({ label, description, labelWidth, orientation, showError, required, className, ref, ...textareaProps }: Readonly<FormTextareaProps>): import("react/jsx-runtime").JSX.Element;
declare namespace FormTextarea {
    var displayName: string;
}
export default FormTextarea;
