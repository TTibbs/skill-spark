import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const tactileButtonVariants = cva(
  [
    "bg-background text-foreground border-2 border-foreground p-4",
    "transition-all duration-150",
    "active:scale-[0.98] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
  ],
  {
    variants: {
      effect: {
        lift: "hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--tactile-shadow-color,var(--foreground))]",
        press:
          "shadow-[4px_4px_0_var(--tactile-shadow-color,var(--foreground))] -translate-x-0.5 -translate-y-0.5",
        deep: "hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0_var(--tactile-shadow-color,var(--foreground))]",
        slam:
          "hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--tactile-shadow-color,var(--foreground))] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none",
        float:
          "hover:-translate-y-1 hover:shadow-[0_4px_0_var(--tactile-shadow-color,var(--foreground))]",
        slideRight:
          "hover:translate-x-1 hover:shadow-[-6px_0_0_var(--tactile-shadow-color,var(--foreground))]",
        slideLeft:
          "hover:-translate-x-1 hover:shadow-[6px_0_0_var(--tactile-shadow-color,var(--foreground))]",
        slideDown:
          "hover:translate-y-1 hover:shadow-[0_-6px_0_var(--tactile-shadow-color,var(--foreground))]",
        outline:
          "bg-transparent hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--tactile-shadow-color,var(--foreground))]",
        double:
          "hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--tactile-shadow-color,var(--foreground)),8px_8px_0_var(--tactile-shadow-color,var(--foreground))]",
        squish: "hover:scale-x-105 hover:scale-y-95",
      },
    },
    defaultVariants: {
      effect: "lift",
    },
  },
);

export type TactileButtonEffect = NonNullable<
  VariantProps<typeof tactileButtonVariants>["effect"]
>;

export type TactileButtonProps = {
  children?: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  effect?: TactileButtonEffect;
} & Omit<
  React.ComponentProps<typeof Button>,
  "className" | "children" | "variant"
>;

export const TactileButton = ({
  children,
  className = "",
  type = "button",
  disabled = false,
  effect = "lift",
  nativeButton,
  render,
  ...props
}: TactileButtonProps) => {
  return (
    <Button
      type={type}
      variant="tactile"
      disabled={disabled}
      nativeButton={nativeButton ?? (render ? false : undefined)}
      render={render}
      className={cn(tactileButtonVariants({ effect }), className)}
      {...props}
    >
      {children}
    </Button>
  );
};
