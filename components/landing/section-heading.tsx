import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  align?: "center" | "left";
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
  align = "center",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            "eyebrow mb-6 text-primary",
            align === "center" && "eyebrow-center"
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2 className="text-[2.25rem] leading-[1.15] text-foreground sm:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mx-auto mt-6 max-w-xl text-lg font-light leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
