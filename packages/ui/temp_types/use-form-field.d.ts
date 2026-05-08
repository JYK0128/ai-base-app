/**
 * TanStack Form 필드의 상태를 가져와서 에러 표시 여부 등을 처리하는 공통 훅
 */
export declare function useFormField<T>(): {
    field: import("@tanstack/react-form").FieldApi<any, string, T, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>;
    form: import("@tanstack/react-form").ReactFormExtendedApi<Record<string, never>, any, any, any, any, any, any, any, any, any, any, any>;
    isTouched: boolean;
    isSubmitting: boolean;
    isSubmitted: boolean;
    errors: any[];
    hasError: boolean;
};
