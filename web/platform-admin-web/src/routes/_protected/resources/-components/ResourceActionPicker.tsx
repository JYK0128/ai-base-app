import { Checkbox, Label, RadioGroup, RadioGroupItem } from '@pkg/ui';

import { RESOURCE_ACTION_LABELS, RESOURCE_ACTION_OPTIONS, type ResourceAction } from '../-helpers/resource-actions.helper';

interface ResourceActionPickerProps {
  readonly description?: string
  readonly availableActions?: readonly ResourceAction[]
  readonly label: string
  readonly name: string
  readonly onChange: (actions: ResourceAction[]) => void
  readonly lockedActions?: readonly ResourceAction[]
  readonly selectionMode?: 'multiple' | 'single'
  readonly value: readonly ResourceAction[]
}

export function ResourceActionPicker({
  description,
  availableActions,
  label,
  name,
  onChange,
  lockedActions = [],
  selectionMode = 'multiple',
  value,
}: Readonly<ResourceActionPickerProps>) {
  const selectedActions = new Set([...value, ...lockedActions]);
  const availableActionSet = availableActions ? new Set(availableActions) : null;
  const lockedActionSet = new Set(lockedActions);
  const selectedAction = value.find((action) => !availableActionSet || availableActionSet.has(action)) ?? availableActions?.[0] ?? '';

  const handleToggle = (action: ResourceAction, checked: boolean) => {
    if (lockedActionSet.has(action)) {
      return;
    }

    const nextSelection = checked
      ? new Set([...selectedActions, action])
      : new Set([...selectedActions].filter((currentAction) => currentAction !== action));

    onChange(RESOURCE_ACTION_OPTIONS.filter((nextAction) => nextSelection.has(nextAction)));
  };

  const handleSelect = (action: ResourceAction) => {
    onChange([action]);
  };

  const buildLabelClassName = (disabled: boolean) => (
    disabled
      ? 'cursor-not-allowed opacity-50'
      : 'cursor-pointer'
  );

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-slate-700">{label}</div>
      {selectionMode === 'single'
        ? (
          <RadioGroup
            value={selectedAction}
            onValueChange={(nextValue) => handleSelect(nextValue as ResourceAction)}
            className="
              flex flex-wrap gap-4 rounded-md border border-slate-200
              bg-slate-50 p-3
            "
          >
            {RESOURCE_ACTION_OPTIONS.map((action) => {
              const disabled = availableActionSet ? !availableActionSet.has(action) : false;
              const labelClassName = `text-sm font-medium text-slate-700 ${buildLabelClassName(disabled)}`;

              return (
                <div key={action} className="flex items-center gap-2">
                  <RadioGroupItem
                    id={`${name}-${action}`}
                    value={action}
                    disabled={disabled}
                  />
                  <Label
                    htmlFor={`${name}-${action}`}
                    className={labelClassName}
                  >
                    {RESOURCE_ACTION_LABELS[action]}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        )
        : (
          <div
            className="
              flex flex-wrap gap-4 rounded-md border border-slate-200
              bg-slate-50 p-3
            "
          >
            {RESOURCE_ACTION_OPTIONS.map((action) => {
              const checked = selectedActions.has(action) || lockedActionSet.has(action);
              const disabled = availableActionSet ? !availableActionSet.has(action) : false;
              const isLocked = lockedActionSet.has(action);
              const labelClassName = `text-sm font-medium text-slate-700 ${buildLabelClassName(disabled || isLocked)}`;

              return (
                <div key={action} className="flex items-center gap-2">
                  <Checkbox
                    id={`${name}-${action}`}
                    checked={checked}
                    disabled={disabled || isLocked}
                    onCheckedChange={(nextChecked) => handleToggle(action, Boolean(nextChecked))}
                  />
                  <Label
                    htmlFor={`${name}-${action}`}
                    className={labelClassName}
                  >
                    {RESOURCE_ACTION_LABELS[action]}
                  </Label>
                </div>
              );
            })}
          </div>
        )}
      {description ? <p className="text-xs text-slate-500">{description}</p> : null}
    </div>
  );
}
