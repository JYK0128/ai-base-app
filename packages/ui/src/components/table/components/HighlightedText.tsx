interface HighlightedTextProps {
  text: string
  highlight: string
}

export function HighlightedText({ text, highlight }: Readonly<HighlightedTextProps>) {
  if (typeof text !== 'string' || !text) return <></>;
  if (typeof highlight !== 'string' || !highlight.trim()) return <>{text}</>;

  const safeHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${safeHighlight})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => {
        if (typeof part !== 'string') return <></>;
        return part.toLowerCase() === highlight.toLowerCase()
          ? (
            <mark
              key={i}
              className="bg-primary/20 text-primary font-medium rounded-sm px-0.5"
            >
              {part}
            </mark>
          )
          : (
            <span key={i}>{part}</span>
          );
      })}
    </>
  );
}
