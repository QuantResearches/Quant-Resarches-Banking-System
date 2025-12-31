"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

interface CurrencyInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
    value: string | number;
    onValueChange: (value: string) => void;
    label?: string; // Optional label for aria or internal use
}

// Indian Number Formatting Function
const formatIndianNumber = (value: string) => {
    if (!value) return "";
    const number = Number(value.replace(/,/g, ""));
    if (isNaN(number)) return value;

    // Use Intl for robust formatting
    return new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
    }).format(number);
};

export function CurrencyInput({ className, value, onValueChange, ...props }: CurrencyInputProps) {
    // Local state to manage display value while typing
    const [displayValue, setDisplayValue] = React.useState(formatIndianNumber(value.toString()));

    // Sync display value if external value changes (e.g. reset form)
    React.useEffect(() => {
        // Only update if the parsed values differ to avoid cursor jumping loops on simple updates
        // For now, simpler sync:
        if (value === "" || value === 0) {
            setDisplayValue("");
        } else {
            // Only re-format if the current display doesn't match the value (avoids messing up active typing decimal)
            const currentRaw = displayValue.replace(/,/g, "");
            if (Number(currentRaw) !== Number(value)) {
                setDisplayValue(formatIndianNumber(value.toString()));
            }
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let input = e.target.value;

        // Allow only numbers, commas, and dots
        const raw = input.replace(/,/g, "");

        // Basic validation: must be a valid number or empty
        if (raw === "") {
            setDisplayValue("");
            onValueChange("");
            return;
        }

        if (isNaN(Number(raw))) return; // Ignore invalid chars

        // Formatting Logic:
        // We want to handle decimals properly. 
        // If ending with '.', don't format yet or it strips the dot.
        if (raw.endsWith(".")) {
            setDisplayValue(input); // Allow typing the dot
            onValueChange(raw);
            return;
        }

        // If decimal part exists, limit to 2 digits
        const parts = raw.split(".");
        if (parts[1] && parts[1].length > 2) return;

        // Format integer part with Indian system
        const integerPart = parts[0];
        const decimalPart = parts[1];

        let formattedInt = integerPart;
        if (integerPart) {
            const num = Number(integerPart);
            // Custom Regex for Indian Format to keep it stable input string
            // But Intl is easier if we accept full re-render
            // Let's use Intl for integer part
            formattedInt = new Intl.NumberFormat("en-IN").format(num);
        }

        const finalDisplay = decimalPart !== undefined ? `${formattedInt}.${decimalPart}` : formattedInt;

        setDisplayValue(finalDisplay);
        onValueChange(raw);
    };

    return (
        <Input
            type="text"
            inputMode="decimal"
            value={displayValue}
            onChange={handleChange}
            className={cn("font-mono", className)}
            {...props}
        />
    );
}
