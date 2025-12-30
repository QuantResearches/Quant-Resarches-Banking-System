"use client";

import React, { useState, useEffect, forwardRef } from "react";
import { Input } from "@/components/ui/Input";

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    value?: string | number;
    onValueChange?: (value: string) => void;
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
    ({ value, onValueChange, className, ...props }, ref) => {
        const [displayValue, setDisplayValue] = useState("");

        // Sync internal state with external value prop
        useEffect(() => {
            if (value !== undefined && value !== null) {
                const numericValue = value.toString().replace(/,/g, "");
                if (!isNaN(Number(numericValue))) {
                    const formatted = formatCurrency(numericValue);
                    setDisplayValue(formatted);
                } else {
                    setDisplayValue("");
                }
            }
        }, [value]);

        const formatCurrency = (val: string) => {
            if (!val) return "";
            // Split decimal
            const parts = val.split(".");
            const whole = parts[0];
            const decimal = parts.length > 1 ? "." + parts[1] : "";

            // Format whole number with Indian locale
            const number = Number(whole);
            if (isNaN(number)) return val;

            return number.toLocaleString("en-IN") + decimal;
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value;

            // Allow numbers, commas, and one decimal point
            if (!/^[0-9,]*\.?[0-9]*$/.test(val)) return;

            const rawValue = val.replace(/,/g, "");

            // Prevent multiple decimals
            if ((val.match(/\./g) || []).length > 1) return;

            setDisplayValue(formatCurrency(rawValue));

            if (onValueChange) {
                onValueChange(rawValue);
            }
        };

        return (
            <Input
                {...props}
                ref={ref}
                type="text"
                value={displayValue}
                onChange={handleChange}
                className={className}
                inputMode="decimal"
            />
        );
    }
);

CurrencyInput.displayName = "CurrencyInput";

export default CurrencyInput;
