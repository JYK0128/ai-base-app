import { Button, cn, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, toast, useAppForm } from '@pkg/ui';
import { useStore } from '@tanstack/react-form';
import { Globe, Info, Languages, Plus } from 'lucide-react';
import { useState } from 'react';

import { type ResourceResponseDto } from '../../../../api/model';

interface ResourceLanguageModalProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly resource: ResourceResponseDto | null
  readonly translations?: Record<string, string>
  readonly onSave: (payload: {
    resourceId: string
    translations: Record<string, string>
  }) => void
}

interface LanguageEntry {
  code: string
  label: string
  value: string
}

interface ResourceLanguageFormValues {
  readonly newLanguageCode: string
  readonly entries: LanguageEntry[]
}

const PRESET_LANGUAGES = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'zh', label: '中文' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
] as const;

function buildInitialEntries(
  resource: ResourceResponseDto | null,
  translations?: Record<string, string>,
): LanguageEntry[] {
  const hasKo = translations && 'ko' in translations;
  const koEntry: LanguageEntry = {
    code: 'ko',
    label: '한국어',
    value: hasKo ? (translations.ko ?? '') : (resource?.name ?? ''),
  };

  const otherEntries = Object.entries(translations ?? {})
    .filter(([code]) => code !== 'ko')
    .map(([code, value]) => {
      const preset = PRESET_LANGUAGES.find((p) => p.code === code);
      return {
        code,
        label: preset?.label || code.toUpperCase(),
        value,
      } satisfies LanguageEntry;
    });

  return [koEntry, ...otherEntries];
}

export function ResourceLanguageModal({
  open,
  onOpenChange,
  resource,
  translations,
  onSave,
}: ResourceLanguageModalProps) {
  const initialEntries = buildInitialEntries(resource, translations);
  const form = useAppForm({
    defaultValues: {
      newLanguageCode: '',
      entries: initialEntries,
    } satisfies ResourceLanguageFormValues,
    onSubmit: async ({ value }) => {
      if (!resource) {
        return;
      }

      const nextTranslations = Object.fromEntries(
        value.entries
          .filter((entry) => entry.value.trim() !== '')
          .map((entry) => [entry.code, entry.value.trim()]),
      ) as Record<string, string>;

      if (Object.keys(nextTranslations).length === 0) {
        toast.error('최소 하나의 다국어 값을 입력해주세요.');
        return;
      }

      onSave({
        resourceId: resource.id,
        translations: nextTranslations,
      });

      toast.success('다국어 정보가 저장되었습니다.');
      onOpenChange(false);
    },
  });

  const [activeLanguage, setActiveLanguage] = useState<string>(initialEntries[0]?.code ?? 'ko');
  const entries = useStore(form.baseStore, (state: { values: ResourceLanguageFormValues }) => state.values.entries) ?? [];
  const newLanguageCode = useStore(form.baseStore, (state: { values: ResourceLanguageFormValues }) => state.values.newLanguageCode) ?? '';
  const activeIndex = entries.findIndex((entry) => entry.code === activeLanguage);
  const activeEntry = activeIndex >= 0 ? entries[activeIndex] : null;

  const availablePresets = PRESET_LANGUAGES.filter(
    (preset) => !entries.some((entry) => entry.code === preset.code),
  );

  const handleAddLanguage = () => {
    const code = newLanguageCode.trim().toLowerCase();

    if (!code) {
      toast.error('추가할 언어를 선택해주세요.');
      return;
    }

    const preset = PRESET_LANGUAGES.find((p) => p.code === code);
    if (!preset) return;

    if (entries.some((entry) => entry.code === code)) {
      toast.error('이미 추가된 언어입니다.');
      return;
    }

    form.setFieldValue('entries', [
      ...entries,
      {
        code: preset.code,
        label: preset.label,
        value: '',
      },
    ]);
    setActiveLanguage(code);
    form.setFieldValue('newLanguageCode', '');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="grid grid-rows-[auto_1fr] sm:max-w-2xl! w-full h-165 p-6">
        <DialogHeader className="pb-2 border-b border-border/40">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <span className="p-1.5 rounded-md bg-primary/5 text-primary border border-primary/10">
              <Languages className="size-4 stroke-[2.5]" />
            </span>
            <span>다국어 관리</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs mt-1">
            {resource
              ? (
                <span className="inline-flex items-center gap-1">
                  <span className="px-1.5 py-0.5 bg-muted text-foreground font-semibold rounded text-[11px] border border-border/60">
                    {resource.name}
                  </span>
                  의 언어별 표시명을 관리합니다.
                </span>
              )
              : (
                <span>선택한 리소스의 언어별 표시명을 관리합니다.</span>
              )}
          </DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Layout
            className="grid grid-rows-[1fr_auto] gap-4 h-full"
            onSubmit={(e) => void form.handleSubmit(e)}
          >
            <section className="grid grid-rows-[auto_1fr] gap-4">
              <form.FieldSet className="border border-border/60 rounded-xl p-4 bg-muted/20 flex flex-col gap-3 shadow-xs">
                <form.FieldLegend className="text-sm font-semibold text-foreground px-1">
                  언어 추가
                </form.FieldLegend>
                <div className="flex items-end gap-3 w-full">
                  <div className="flex-1">
                    <form.AppField name="newLanguageCode">
                      {(field) => (
                        <div className="flex flex-col gap-1.5 w-full">
                          <label className="text-xs font-semibold text-muted-foreground select-none">
                            추가할 언어 선택
                          </label>
                          <Select
                            value={field.state.value}
                            onValueChange={(value) => field.handleChange(value)}
                          >
                            <SelectTrigger className="w-full h-9 bg-background border border-border/80 text-sm">
                              <SelectValue placeholder="추가할 언어 선택" />
                            </SelectTrigger>
                            <SelectContent side="bottom" position="popper">
                              {availablePresets.length > 0
                                ? (
                                  availablePresets.map((preset) => (
                                    <SelectItem key={preset.code} value={preset.code}>
                                      {preset.label}
                                      {' '}
                                      (
                                      {preset.code.toUpperCase()}
                                      )
                                    </SelectItem>
                                  ))
                                )
                                : (
                                  <SelectItem value="none" disabled>
                                    모든 언어가 이미 추가되었습니다.
                                  </SelectItem>
                                )}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </form.AppField>
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddLanguage}
                    variant="outline"
                    disabled={availablePresets.length === 0}
                    className="h-9 px-4 border-dashed border-primary/40 text-primary hover:bg-primary/5 hover:text-primary hover:border-primary/80 transition-all font-medium flex items-center gap-1.5 shrink-0"
                  >
                    <Plus className="size-3.5 stroke-[2.5]" />
                    <span>추가</span>
                  </Button>
                </div>
              </form.FieldSet>

              <form.FieldSet className="border border-border/60 rounded-xl p-4 bg-card grid grid-rows-[auto_auto_1fr] gap-3 shadow-xs">
                <form.FieldLegend className="text-sm font-semibold text-foreground px-1">
                  언어 목록 및 편집
                </form.FieldLegend>

                <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg border border-border/30">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Globe className="size-3.5 text-muted-foreground/70" />
                    <span>등록된 언어:</span>
                    <strong className="text-foreground font-semibold">
                      {entries.length}
                      개
                    </strong>
                  </span>
                  {activeEntry && (
                    <span className="flex items-center gap-1.5 font-medium">
                      <span>현재 선택:</span>
                      <span className="px-1.5 py-0.5 bg-primary/10 text-primary font-bold rounded text-[10px] uppercase tracking-wider">
                        {activeLanguage}
                      </span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid grid-rows-[auto_1fr]">
                    <div className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase mb-2">
                      언어 목록
                    </div>
                    <div className="overflow-y-auto pr-1 flex flex-col gap-1.5">
                      {entries.map((entry) => {
                        const isActive = entry.code === activeLanguage;
                        const hasValue = entry.value.trim() !== '';
                        return (
                          <button
                            key={entry.code}
                            type="button"
                            onClick={() => setActiveLanguage(entry.code)}
                            className={cn(
                              'flex items-center justify-between px-3 h-10 shrink-0 rounded-lg text-sm font-medium transition-all duration-150 border text-left',
                              isActive
                                ? 'bg-primary/5 border-primary/40 text-primary shadow-xs'
                                : 'bg-transparent border-transparent hover:bg-muted/40 hover:border-border/50 text-muted-foreground hover:text-foreground',
                            )}
                          >
                            <span className="flex items-center gap-2">
                              <span className={cn(
                                'w-1.5 h-1.5 rounded-full transition-transform duration-200',
                                isActive ? 'bg-primary scale-125' : 'bg-muted-foreground/30',
                              )}
                              />
                              <span className="font-semibold">{entry.label ?? entry.code.toUpperCase()}</span>
                              <span className="text-[10px] text-muted-foreground/70 font-mono">
                                (
                                {entry.code}
                                )
                              </span>
                            </span>
                            <span className={cn(
                              'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors',
                              hasValue
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400'
                                : 'bg-muted text-muted-foreground/80 border-border/80',
                            )}
                            >
                              {hasValue ? '입력됨' : '비어있음'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-rows-[auto_1fr]">
                    <div className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase mb-2">
                      편집 영역
                    </div>
                    {activeEntry
                      ? (
                        <div className="flex flex-col gap-3 bg-muted/20 border border-border/40 rounded-xl p-4 overflow-y-auto">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-semibold text-muted-foreground select-none">
                              언어 구분
                            </span>
                            <div className="px-3 py-2 bg-background border border-border/60 rounded-lg text-sm font-semibold text-foreground/90 flex items-center gap-2">
                              <span>{activeEntry.label}</span>
                              <span className="text-xs text-muted-foreground/80 font-mono">
                                (
                                {activeEntry.code.toUpperCase()}
                                )
                              </span>
                            </div>
                          </div>

                          <form.AppField name={`entries[${activeIndex}].value`}>
                            {(field) => (
                              <field.Input
                                label="번역값"
                                placeholder="예: User Management"
                                orientation="vertical"
                                className="w-full text-sm"
                              />
                            )}
                          </form.AppField>
                        </div>
                      )
                      : (
                        <div className="flex flex-col items-center justify-center border border-dashed border-border/80 rounded-xl p-6 bg-muted/5 text-muted-foreground text-center h-full">
                          <Info className="size-6 text-muted-foreground/50 mb-2" />
                          <p className="text-xs">편집할 언어를 목록에서 선택해주세요.</p>
                        </div>
                      )}
                  </div>
                </div>
              </form.FieldSet>
            </section>

            <DialogFooter className="mt-2 pt-2 border-t border-border/30">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                취소
              </Button>
              <form.Submit>
                저장
              </form.Submit>
            </DialogFooter>
          </form.Layout>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}
