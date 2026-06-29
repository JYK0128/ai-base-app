export { ManagementPanel as ResourcePanel } from '../../-components/ManagementPanel';

interface ResourceSectionProps {
  readonly badge?: string
  readonly children: ReactNode
  readonly description: string
  readonly title: string
}

export function ResourceSection({ badge, children, description, title }: ResourceSectionProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        {badge && (
          <span className="
            rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-medium
            text-slate-600 ring-1 ring-slate-200
          "
          >
            {badge}
          </span>
        )}
      </div>

      <div className="
        rounded-md border border-dashed border-slate-200 bg-slate-50 p-3
      "
      >
        {children}
      </div>
    </section>
  );
}
