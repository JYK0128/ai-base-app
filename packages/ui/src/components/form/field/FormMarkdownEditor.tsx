import '@toast-ui/editor/dist/toastui-editor.css';

import { Editor } from '@toast-ui/react-editor';
import * as React from 'react';

import { Field,
         FieldContent,
         FieldDescription,
         FieldError,
         FieldLabel } from '@/components/ui/field';
import { cn } from '@/lib/utils';

import { useFormField } from '../use-form-field';

type MarkdownEditorInstance = {
  getMarkdown: () => string
  setMarkdown: (markdown: string, cursorToEnd?: boolean) => void
};

export interface FormMarkdownEditorProps {
  autofocus?: boolean
  className?: string
  description?: React.ReactNode
  height?: string
  hideModeSwitch?: boolean
  initialEditType?: 'markdown' | 'wysiwyg'
  label?: React.ReactNode
  labelWidth?: React.CSSProperties['width']
  language?: string
  orientation?: 'vertical' | 'horizontal' | 'responsive'
  placeholder?: string
  previewStyle?: 'tab' | 'vertical'
  theme?: string
  required?: boolean
  showError?: boolean
  useCommandShortcut?: boolean
}

/** 마크다운 에디터 (TanStack Form 기반) */
function FormMarkdownEditor({
  autofocus,
  description,
  height = '420px',
  hideModeSwitch = false,
  initialEditType = 'markdown',
  label,
  labelWidth = 'auto',
  language,
  orientation = 'horizontal',
  placeholder = '내용을 입력하세요.',
  previewStyle = 'vertical',
  theme,
  required = false,
  showError = true,
  className,
  useCommandShortcut = true,
}: Readonly<FormMarkdownEditorProps>) {
  const { field, hasError, errors } = useFormField<string>();
  const editorRef = React.useRef<Editor>(null);

  React.useEffect(() => {
    const editor = editorRef.current?.getInstance() as MarkdownEditorInstance | undefined;
    if (!editor) return;

    const nextValue = field.state.value ?? '';
    if (editor.getMarkdown() !== nextValue) {
      editor.setMarkdown(nextValue);
    }
  }, [field.state.value]);

  return (
    <Field
      orientation={orientation}
      data-invalid={hasError}
      className={cn('min-h-fit min-w-fit', className)}
    >
      {label && (
        <div
          style={{ width: labelWidth }}
          className="flex cursor-default items-start select-none"
        >
          <FieldLabel htmlFor={field.name}>
            {label}
            {required && <sup className="text-red-600"> *</sup>}
          </FieldLabel>
        </div>
      )}
      <FieldContent className="flex-1">
        <div
          className={cn(
            `
              overflow-hidden rounded-lg border border-slate-200 bg-white
              shadow-sm transition-colors
              focus-within:border-slate-300 focus-within:ring-1
              focus-within:ring-slate-200
            `,
            hasError && `
              border-rose-300
              focus-within:border-rose-400 focus-within:ring-rose-100
            `,
          )}
        >
          <Editor
            ref={editorRef}
            initialValue={field.state.value ?? ''}
            initialEditType={initialEditType}
            autofocus={autofocus}
            hideModeSwitch={hideModeSwitch}
            language={language}
            previewStyle={previewStyle}
            height={height}
            placeholder={placeholder}
            theme={theme}
            useCommandShortcut={useCommandShortcut}
            usageStatistics={false}
            onChange={() => {
              const editor = editorRef.current?.getInstance() as MarkdownEditorInstance | undefined;
              field.handleChange(editor?.getMarkdown() ?? '');
            }}
            onBlur={() => {
              field.handleBlur();
            }}
          />
        </div>

        {description && (
          <FieldDescription>{description}</FieldDescription>
        )}

        {showError && hasError && (
          <FieldError
            errors={(errors as Array<{ message?: string } | string>).map((err) => ({
              message: typeof err === 'string' ? err : err.message || 'Error',
            }))}
          />
        )}
      </FieldContent>
    </Field>
  );
}

FormMarkdownEditor.displayName = 'FormMarkdownEditor';

export default FormMarkdownEditor;
