"use client";

import { useState, useCallback } from "react";
import StatusPopup from "@/components/ui/StatusPopup";

export function useStatusPopup() {
    const [status, setStatus] = useState<"success" | "error" | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const showSuccess = useCallback((msg: string) => {
        setStatus("success");
        setMessage(msg);
    }, []);

    const showError = useCallback((msg: string) => {
        setStatus("error");
        setMessage(msg);
    }, []);

    const closePopup = useCallback(() => {
        setStatus(null);
        setMessage(null);
    }, []);

    const PopupComponent = () => (
        <StatusPopup
            status={status}
            message={message}
            onClose={closePopup}
        />
    );

    return {
        showSuccess,
        showError,
        PopupComponent
    };
}
