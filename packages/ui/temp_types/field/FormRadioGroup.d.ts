import * as React from 'react';
export interface RadioItem {
    label: React.ReactNode;
    value: string | number;
    disabled?: boolean;
}
export interface FormRadioGroupProps {
    items: RadioItem[];
    label?: React.ReactNode;
    description?: React.ReactNode;
    labelWidth?: React.CSSProperties['width'];
    orientation?: 'vertical' | 'horizontal' | 'responsive';
    showError?: boolean;
    required?: boolean;
    value?: string;
    onValueChange?: (value: string) => void;
    className?: string;
    style?: React.CSSProperties;
    onBlur?: React.FocusEventHandler<HTMLDivElement>;
    disabled?: boolean;
    ref?: React.Ref<HTMLDivElement>;
}
/** 라디오 그룹 (TanStack Form 기반) */
declare function FormRadioGroup({ items, label, description, labelWidth, orientation, showError, required, className, ref, ...restProps }: Readonly<FormRadioGroupProps>): import("react/jsx-runtime").JSX.Element;
declare namespace FormRadioGroup {
    var displayName: string;
}
export default FormRadioGroup;
