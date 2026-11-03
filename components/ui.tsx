import Link from "next/link";

export function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 ${className}`}>
      {children}
    </div>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-gold-300/50 bg-gold-100/40 px-3.5 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-gold-700 dark:bg-gold-700/10">
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = false,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  center?: boolean;
}) {
  return (
    <div className={`${center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}`}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight text-main sm:text-4xl">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-base leading-relaxed text-sub">{subtitle}</p>}
    </div>
  );
}

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "gold" | "outline" | "ghost";
  external?: boolean;
  className?: string;
};

export function Button({
  href,
  children,
  variant = "primary",
  external,
  className = "",
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all";
  const styles: Record<string, string> = {
    primary:
      "bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-[0_12px_28px_-10px_rgba(14,107,76,0.9)] hover:-translate-y-0.5",
    gold:
      "bg-gradient-to-br from-gold-300 to-gold text-brand-950 shadow-[0_12px_28px_-10px_rgba(201,151,31,0.8)] hover:-translate-y-0.5",
    outline:
      "border border-line bg-surface text-main hover:border-brand hover:text-brand-700",
    ghost: "text-brand-700 hover:bg-brand-50",
  };
  const cls = `${base} ${styles[variant]} ${className}`;
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export function fmt(n: number) {
  return n.toLocaleString("en-US");
}
