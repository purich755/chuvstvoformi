/** Редакционный номер раздела: «05 / Метод» */
export default function SectionIndex({ n, label, light = false, className = '' }: { n: string; label: string; light?: boolean; className?: string }) {
  return (
    <p className={`sindex ${light ? 'sindex--light' : ''} ${className}`}>
      <span>{n}</span>
      <span className="sindex__slash" aria-hidden="true">/</span>
      <span>{label}</span>
    </p>
  );
}
