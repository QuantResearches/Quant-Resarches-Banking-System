"use strict";
import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComboboxProps {
    options: string[];
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    name?: string;
    required?: boolean;
}

export function Combobox({ options, value = "", onChange, placeholder = "Select...", className, name, required }: ComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const wrapperRef = React.useRef<HTMLDivElement>(null);

    // Sync internal query when value prop changes (e.g. initial load)
    React.useEffect(() => {
        setQuery(value);
    }, [value]);

    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = query === ""
        ? options
        : options.filter((opt) =>
            opt.toLowerCase().includes(query.toLowerCase())
        );

    // If "query" exactly matches an option, we consider it selected
    // Otherwise, we allow custom input if that's desired, but usually a select forces choice.
    // For specific "Search and Select", let's force selection behavior but allow filtering.
    // Actually, for "State", sticking to the list is safer. But let's allow typing for UX.

    const handleSelect = (option: string) => {
        onChange(option);
        setQuery(option);
        setOpen(false);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <div className="relative">
                <input
                    type="text"
                    name={name}
                    className={cn(
                        "flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm",
                        className
                    )}
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        onChange(e.target.value); // Allow free text or clear
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    required={required}
                    autoComplete="off"
                />
                <div className="absolute right-3 top-2.5 text-slate-400">
                    <ChevronsUpDown size={16} />
                </div>
            </div>

            {open && filteredOptions.length > 0 && (
                <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {filteredOptions.map((option) => (
                        <div
                            key={option}
                            className={cn(
                                "relative cursor-default select-none py-2 pl-3 pr-9 hover:bg-blue-50 hover:text-blue-900 cursor-pointer",
                                option === value ? "font-semibold bg-blue-50 text-blue-900" : "text-gray-900"
                            )}
                            onClick={() => handleSelect(option)}
                        >
                            <span className="block truncate">{option}</span>
                            {option === value && (
                                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                                    <Check size={16} />
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
            {open && filteredOptions.length === 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-md bg-white p-4 shadow-lg ring-1 ring-black ring-opacity-5 text-sm text-gray-500 text-center">
                    No results found.
                </div>
            )}
        </div>
    );
}
