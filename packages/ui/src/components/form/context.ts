import { createFormHook, createFormHookContexts } from '@tanstack/react-form';

import FieldDescription from './components/FormFieldDescription';
import FieldGroup from './components/FormFieldGroup';
import FieldLegend from './components/FormFieldLegend';
import FieldSet from './components/FormFieldSet';
import FormLayout from './components/FormLayout';
import FormReset from './components/FormReset';
import FormSubmit from './components/FormSubmit';
import FormCheckbox from './field/FormCheckbox';
import FormCheckGroup from './field/FormCheckGroup';
import FormInput from './field/FormInput';
import FormRadioGroup from './field/FormRadioGroup';
import FormSelect from './field/FormSelect';
import FormTextarea from './field/FormTextarea';

const contexts = createFormHookContexts();

export const fieldContext = contexts.fieldContext;
export const useFieldContext = contexts.useFieldContext;
export const formContext = contexts.formContext;
export const useFormContext = contexts.useFormContext;

const hook = createFormHook({
  fieldComponents: {
    Input: FormInput,
    Select: FormSelect,
    Checkbox: FormCheckbox,
    CheckGroup: FormCheckGroup,
    RadioGroup: FormRadioGroup,
    Textarea: FormTextarea,
  },
  formComponents: {
    Layout: FormLayout,
    Submit: FormSubmit,
    Reset: FormReset,
    FieldSet,
    FieldLegend,
    FieldDescription,
    FieldGroup,
  },
  fieldContext,
  formContext,
});

export const useAppForm = hook.useAppForm;
