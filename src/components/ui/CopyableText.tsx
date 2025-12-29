"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface CopyableTextProps {
    text: string;
    label?: string; // Optional label for context
    truncateLength?: number;
    className?: string;
}

export default function CopyableText({ text, label, truncateLength = 8, className = "" }: CopyableTextProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const displayText = text.length > truncateLength ? `${text.slice(0, truncateLength)}...` : text;

    return (
        <div className={`flex items-center gap-2 group cursor-pointer ${className}`} onClick={handleCopy} title="Click to copy">
            {label && <span className="sr-only">{label}</span>}
            <span className="font-mono text-gray-600 truncate">{displayText}</span>
            {copied ? (
                <Check className="w-4 h-4 text-green-500" />
            ) : (
                <Copy className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
        </div>
    );
}
