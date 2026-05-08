import * as React from 'react';
export interface CheckItem {
    label: React.ReactNode;
    value: string | number;
    disabled?: boolean;
}
export interface FormCheckGroupProps extends React.ComponentProps<'div'> {
    items: CheckItem[];
    label?: React.ReactNode;
    description?: React.ReactNode;
    labelWidth?: React.CSSProperties['width'];
    orientation?: 'vertical' | 'horizontal' | 'responsive';
    showError?: boolean;
    required?: boolean;
}
/** 체크박스 그룹 (TanStack Form 기반) */
declare function FormCheckGroup({ items, label, description, labelWidth, orientation, showError, required, className, ref, ...restProps }: Readonly<FormCheckGroupProps>): import("react/jsx-runtime").JSX.Element;
declare namespace FormCheckGroup {
    var displayName: string;
}
export default FormCheckGroup;
