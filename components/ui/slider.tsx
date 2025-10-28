import * as React from "react";
import { cn } from "@/lib/utils";

export interface SliderProps
    extends Omit<
        React.InputHTMLAttributes<HTMLInputElement>,
        "onChange"
    > {
    onValueChange?: (value: number) => void;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
    ({ className, onValueChange, min = 0, max = 100, ...props }, ref) => {
        return (
            <input
                type="range"
                ref={ref}
                min={min}
                max={max}
                className={cn(
                    "h-2 w-full cursor-pointer appearance-none rounded-lg bg-secondary",
                    className
                )}
                onChange={(e) => onValueChange?.(Number(e.target.value))}
                style={{
                    background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((Number(props.value) || 0) - Number(min)) / (Number(max) - Number(min)) * 100}%, hsl(var(--secondary)) ${((Number(props.value) || 0) - Number(min)) / (Number(max) - Number(min)) * 100}%, hsl(var(--secondary)) 100%)`,
                }}
                {...props}
            />
        );
    }
);
Slider.displayName = "Slider";

export { Slider };

