import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, toast, useAppForm } from '@pkg/ui';
import { useStore } from '@tanstack/react-form';
import { Globe, Languages, Loader2, Plus } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { z } from 'zod';

import { i18nControllerBulkTranslationsV1, useI18nControllerGetTranslationsV1 } from '@/api/endpoints';
import type { LocaleDto, ResourceResponseDto, TranslationBulkOperationDto } from '@/api/model';

interface ResourceLanguageModalProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly resource: ResourceResponseDto | null
  readonly locales: LocaleDto[]
}

interface LanguageEntry {
  code: string
  label: string
  value: string
  hasTranslation: boolean
}

interface ResourceLanguageFormValues {
  readonly newLanguageCode: string
  readonly entries: LanguageEntry[]
}

function isTemporaryResource(resource: ResourceResponseDto): boolean {
  return resource.id.startsWith('new-') || resource.id.startsWith('sub-');
}

function createEntriesFromResponse(
  resourceCode: string,
  locales: LocaleDto[],
  translationData?: Record<string, Record<string, Record<string, string>>>,
): LanguageEntry[] {
  const localeLabelMap = new Map(locales.map((locale) => [
    locale.code,
    locale.name,
  ]));

  const localeOrderMap = new Map(locales.map((locale) => [
    locale.code,
    locale.sortOrder,
  ]));

  return Object.entries(translationData ?? {})
    .flatMap(([locale, namespaces]) => {
      const rawTranslation = namespaces?.resource?.[resourceCode];
      const value = rawTranslation?.trim();

      if (typeof rawTranslation !== 'string' || !value) {
        return [];
      }

      return [{
        code: locale,
        label: localeLabelMap.get(locale) ?? '',
        value,
        hasTranslation: true,
      } satisfies LanguageEntry];
    })
    .sort((left, right) => {
      const leftOrder = localeOrderMap.get(left.code) ?? 9999;
      const rightOrder = localeOrderMap.get(right.code) ?? 9999;
      return leftOrder - rightOrder;
    });
}

// ==========================================================
// 1. Outer Wrapper (Handles loading state and Dialog container)
// ==========================================================
export function ResourceLanguageModal({
  open,
  onOpenChange,
  resource,
  locales,
}: ResourceLanguageModalProps) {
  const translationQueryParams = useMemo(() => {
    if (!resource || isTemporaryResource(resource)) {
      return undefined;
    }

    return {
      namespace: 'resource',
      keys: resource.code,
    };
  }, [resource]);

  const { data: translationResponse } = useI18nControllerGetTranslationsV1(translationQueryParams, {
    query: {
      enabled: open && !!translationQueryParams,
    },
  });

  const isTemp = resource ? isTemporaryResource(resource) : true;
  const isLoaded = isTemp || !open || !!translationResponse;

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

        {!resource || !isLoaded
          ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">다국어 정보를 불러오는 중입니다...</span>
            </div>
          )
          : (
            <ResourceLanguageFormContent
              resource={resource}
              locales={locales}
              initialEntries={createEntriesFromResponse(resource.code, locales, translationResponse?.data)}
              onClose={() => onOpenChange(false)}
            />
          )}
      </DialogContent>
    </Dialog>
  );
}

// ==========================================================
// 2. Inner Content Component (Mounts only when data is ready)
// ==========================================================
interface ResourceLanguageFormContentProps {
  readonly resource: ResourceResponseDto
  readonly locales: LocaleDto[]
  readonly initialEntries: LanguageEntry[]
  readonly onClose: () => void
}

function ResourceLanguageFormContent({
  resource,
  locales,
  initialEntries,
  onClose,
}: ResourceLanguageFormContentProps) {
  // Directly initialize original entries map on mount
  const originalEntryMapRef = useRef<Record<string, { hasTranslation: boolean, value: string }>>(
    Object.fromEntries(
      initialEntries.map((entry) => [
        entry.code,
        {
          hasTranslation: entry.hasTranslation,
          value: entry.value,
        },
      ]),
    ),
  );

  const form = useAppForm({
    defaultValues: {
      newLanguageCode: '',
      entries: initialEntries,
    } satisfies ResourceLanguageFormValues,
    validators: {
      onSubmit: z.object({
        newLanguageCode: z.string().trim(),
        entries: z.array(z.object({
          code: z.string(),
          label: z.string(),
          value: z.string().trim(),
          hasTranslation: z.boolean(),
        })),
      }),
    },
    onSubmit: async ({ value }) => {
      const operations: TranslationBulkOperationDto[] = [];

      value.entries.forEach((entry) => {
        const original = originalEntryMapRef.current[entry.code];
        const originalValue = original?.value ?? '';
        const originalHasTranslation = original?.hasTranslation ?? false;

        if (entry.value === originalValue) {
          return;
        }

        if (entry.value) {
          if (originalHasTranslation) {
            operations.push({
              action: 'UPDATE',
              locale: entry.code,
              namespace: 'resource',
              key: resource.code,
              value: entry.value,
            });
          }
          else {
            operations.push({
              action: 'CREATE',
              locale: entry.code,
              namespace: 'resource',
              key: resource.code,
              value: entry.value,
            });
          }
        }
        else if (originalHasTranslation) {
          operations.push({
            action: 'DELETE',
            locale: entry.code,
            namespace: 'resource',
            key: resource.code,
          });
        }
      });

      if (operations.length === 0) {
        toast.error('최소 하나의 다국어 값을 입력해주세요.');
        return;
      }

      try {
        await i18nControllerBulkTranslationsV1({ operations });
        toast.success('다국어 정보가 저장되었습니다.');
        onClose();
      }
      catch {
        toast.error('다국어 정보 저장 중 오류가 발생했습니다.');
      }
    },
  });

  // Direct synchronous hook state initializations (NO useEffect needed!)
  const [activeLanguage, setActiveLanguage] = useState<string>(() => initialEntries[0]?.code ?? '');
  const storedEntries = useStore(form.baseStore, (state: { values: ResourceLanguageFormValues }) => state.values.entries);
  const entries = useMemo(() => storedEntries ?? [], [storedEntries]);
  const newLanguageCode = useStore(form.baseStore, (state: { values: ResourceLanguageFormValues }) => state.values.newLanguageCode) ?? '';

  const activeIndex = entries.findIndex((entry) => entry.code === activeLanguage);
  const activeEntry = activeIndex >= 0 ? entries[activeIndex] : null;
  const availableLocales = useMemo(
    () => locales.filter((locale) => locale.isActive && !entries.some((entry) => entry.code === locale.code)),
    [entries, locales],
  );

  const handleSelectLanguage = (code: string) => {
    setActiveLanguage(code);
  };

  const handleUpdateValue = (value: string) => {
    if (activeIndex < 0) {
      return;
    }

    const nextEntries = [...entries];
    nextEntries[activeIndex] = {
      ...nextEntries[activeIndex],
      value,
    };
    form.setFieldValue('entries', nextEntries);
  };

  const handleAddLanguage = () => {
    const code = newLanguageCode;

    if (!code) {
      toast.error('추가할 언어를 선택해주세요.');
      return;
    }

    const locale = availableLocales.find((item) => item.code === code);
    if (!locale) {
      toast.error('지원하지 않는 언어입니다.');
      return;
    }

    if (entries.some((entry) => entry.code === code)) {
      toast.error('이미 추가된 언어입니다.');
      return;
    }

    const localeOrderMap = new Map(locales.map((locale, index) => [
      locale.code,
      locale.sortOrder ?? index,
    ]));

    const nextEntries = [
      ...entries,
      {
        code: locale.code,
        label: locale.name,
        value: '',
        hasTranslation: false,
      },
    ].sort((left, right) => {
      const leftOrder = localeOrderMap.get(left.code) ?? 9999;
      const rightOrder = localeOrderMap.get(right.code) ?? 9999;
      return leftOrder - rightOrder;
    });

    form.setFieldValue('entries', nextEntries);
    form.setFieldValue('newLanguageCode', '');
    setActiveLanguage(code);
  };

  return (
    <form.AppForm>
      <form.Layout
        className="grid grid-rows-[1fr_auto] gap-4 h-full"
        onSubmit={(e) => void form.handleSubmit(e)}
      >
        <section className="grid grid-rows-[auto_1fr] gap-4 min-h-0">
          <div className="border border-border/60 rounded-xl p-4 bg-muted/20 flex flex-col gap-3 shadow-xs">
            <div className="text-sm font-semibold text-foreground px-1">
              언어 추가
            </div>
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
                          {availableLocales.length > 0
                            ? (
                              availableLocales.map((locale) => (
                                <SelectItem key={locale.code} value={locale.code}>
                                  {locale.name}
                                  {' '}
                                  (
                                  {locale.code.toUpperCase()}
                                  )
                                </SelectItem>
                              ))
                            )
                            : (
                              <SelectItem value="none" disabled>
                                추가할 수 있는 언어가 없습니다.
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
                className="gap-1.5"
                variant="outline"
              >
                <Plus className="size-4" />
                추가
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-[150px_1fr] gap-4 min-h-0">
            <div className="border border-border/60 rounded-xl p-2 bg-background overflow-auto">
              <div className="flex items-center gap-2 px-2 py-2 text-xs font-semibold text-muted-foreground">
                <Globe className="size-4" />
                언어 목록
              </div>
              <div className="space-y-1">
                {entries.length > 0
                  ? (
                    entries.map((entry) => (
                      <button
                        key={entry.code}
                        type="button"
                        onClick={() => handleSelectLanguage(entry.code)}
                        className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${
                          entry.code === activeLanguage
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted text-foreground'
                        }`}
                      >
                        <div className="font-medium">{entry.label}</div>
                        <div className={`text-[11px] ${entry.code === activeLanguage ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {entry.code.toUpperCase()}
                        </div>
                      </button>
                    ))
                  )
                  : (
                    <div className="px-2 py-6 text-center text-xs text-muted-foreground">
                      실제 번역 값이 없습니다.
                    </div>
                  )}
              </div>
            </div>

            <div className="border border-border/60 rounded-xl p-4 bg-background min-h-0 overflow-auto">
              {activeEntry
                ? (
                  <div className="grid gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-md bg-muted text-xs font-semibold">
                        {activeEntry.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {activeEntry.code.toUpperCase()}
                      </span>
                    </div>
                    <label className="space-y-1">
                      <div className="text-sm font-medium">표시명</div>
                      <input
                        className="w-full rounded-md border border-border/80 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                        value={activeEntry.value}
                        onChange={(e) => handleUpdateValue(e.target.value)}
                        placeholder={`${activeEntry.label} 표시명 입력`}
                      />
                    </label>
                    <p className="text-xs text-muted-foreground">
                      비워두면 해당 언어 번역은 삭제됩니다.
                    </p>
                  </div>
                )
                : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 border border-dashed border-border/60 rounded-lg bg-muted/5 gap-3">
                    <Globe className="size-8 text-muted-foreground/40" />
                    <div>
                      <div className="text-sm font-semibold text-foreground">표시할 번역 값이 없습니다</div>
                      <div className="text-xs text-muted-foreground mt-1">API 응답에 실제 번역이 있는 언어만 표시됩니다.</div>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </section>

        <DialogFooter className="pt-2 border-t border-border/40">
          <Button type="button" variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button type="submit">
            적용
          </Button>
        </DialogFooter>
      </form.Layout>
    </form.AppForm>
  );
}
