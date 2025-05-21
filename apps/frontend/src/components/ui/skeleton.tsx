import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-accent animate-pulse rounded-md flex items-center",
        className
      )}
      {...props}
    >
      <div className="w-5 h-5 bg-foreground rounded-full" />
    </div>
  );
}

export { Skeleton };
