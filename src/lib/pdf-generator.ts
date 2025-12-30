
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateStatementPDF = (account: any, transactions: any[], period: { start: string, end: string }) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // --- HEADER ---
    doc.setFontSize(20);
    doc.setTextColor(30, 64, 175); // Blue-800
    doc.text("Quant Researches Bank", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Internal Financial Management System", 14, 26);
    doc.text("123 Financial District, Mumbai, India", 14, 30);

    doc.line(14, 35, pageWidth - 14, 35);

    // --- CUSTOMER DETAILS ---
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Account Statement", 14, 45);

    doc.setFontSize(10);
    doc.text(`Customer Name: ${account.customer.full_name}`, 14, 52);
    doc.text(`Account Number: ${account.id}`, 14, 57);
    doc.text(`Type: ${account.account_type.toUpperCase()}`, 14, 62);
    doc.text(`Statement Period: ${period.start} to ${period.end}`, 14, 67);

    // --- SUMMARY ---
    // Calculate Summary
    const openingBalance = 0; // Ideally fetched from backend, mocking for now as '0' or dynamic
    // Logic: In a real system, we fetch 'Balance at Start Date'. Use current for simplicity or calc.
    // For MVP client-side: We just show totals of visible transactions.

    const totalCredits = transactions
        .filter((t: any) => t.txn_type === "credit")
        .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

    const totalDebits = transactions
        .filter((t: any) => t.txn_type === "debit")
        .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

    const closingBalance = Number(account.balance?.balance || 0);

    doc.setFillColor(243, 244, 246);
    doc.rect(130, 40, pageWidth - 144, 35, "F");
    doc.setFontSize(10);
    doc.text("Account Summary", 135, 48);
    doc.text(`Total Credits: +${totalCredits.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}`, 135, 55);
    doc.text(`Total Debits: -${totalDebits.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}`, 135, 60);
    doc.setFont("helvetica", "bold");
    doc.text(`Closing Balance: ${closingBalance.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}`, 135, 70);
    doc.setFont("helvetica", "normal");

    // --- TRANSACTIONS TABLE ---
    const tableData = transactions.map((t: any) => [
        new Date(t.effective_date).toLocaleDateString(),
        t.description || t.reference || "-",
        t.txn_type === "debit" ? `-${Number(t.amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}` : "",
        t.txn_type === "credit" ? `+${Number(t.amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}` : "",
        // Running balance column is hard without initial balance. Skipping.
        t.status
    ]);

    autoTable(doc, {
        startY: 80,
        head: [["Date", "Description", "Debit", "Credit", "Status"]],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [30, 64, 175] },
        styles: { fontSize: 9 },
        columnStyles: {
            2: { textColor: [220, 38, 38], halign: "right" }, // Debit Red
            3: { textColor: [22, 163, 74], halign: "right" }  // Credit Green
        }
    });

    // Footer
    const pageCount = (doc as any).getNumberOfPages ? (doc as any).getNumberOfPages() : (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${i} of ${pageCount} - Generated on ${new Date().toLocaleString()}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
    }

    doc.save(`Statement_${account.id}_${period.end}.pdf`);
};
