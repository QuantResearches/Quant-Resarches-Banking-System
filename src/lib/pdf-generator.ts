import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateStatementPDF = (account: any, transactions: any[], period?: { start: string, end: string }) => {
    const doc = new jsPDF();

    // --- HEADING ---
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("STATEMENT OF ACCOUNT", 105, 15, { align: "center" });

    doc.setLineWidth(0.5);
    doc.line(15, 20, 195, 20); // Top Divider

    // --- CUSTOMER DETAILS (Left Side) ---
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    let y = 30;
    const leftMargin = 15;

    // Icon Placeholder (User)
    // doc.addImage(...) - Skipping real image for now, keeping text structure

    doc.setFont("helvetica", "bold");
    doc.text(`Mr./Ms. ${account.customer?.full_name || "Customer"}`, leftMargin, y);
    doc.setFont("helvetica", "normal");

    y += 6;
    // Address Logic
    const profile = account.customer?.profile;
    const addressLine1 = profile?.current_address || account.customer?.address || "Address Not Available";
    const addressLine2 = profile ? `${profile.city || ""} ${profile.state || ""} ${profile.pincode || ""}` : "";

    doc.text(addressLine1, leftMargin, y);
    y += 6;
    doc.text(addressLine2, leftMargin, y);
    y += 10;

    doc.text(`Date of Statement    : ${new Date().toLocaleDateString('en-IN')}`, leftMargin, y);
    y += 6;
    if (period) {
        doc.text(`Statement From       : ${period.start}`, leftMargin, y);
        y += 6;
        doc.text(`Statement To         : ${period.end}`, leftMargin, y);
        y += 6;
    }
    // Mocking cleared balance for styling matching image
    const balance = Number(account.balance?.balance || 0);
    doc.text(`Clear Balance        : ${balance.toFixed(2)} ${balance >= 0 ? "Cr" : "Dr"}`, leftMargin, y);
    y += 6;
    doc.text(`Uncleared Amount     : 0.00`, leftMargin, y);
    y += 6;
    doc.text(`+MOD Bal             : 0.00`, leftMargin, y);
    y += 6;
    doc.text(`Lien                 : 0.00`, leftMargin, y);
    y += 6;
    doc.text(`Drawing Power        : 0.00`, leftMargin, y);


    // --- BANK DETAILS (Right Side) ---
    const rightMargin = 110;
    y = 30;

    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 102, 204); // SBI Blue-ish
    doc.text("Quant Researches Bank", rightMargin, y);
    doc.setTextColor(0, 0, 0); // Reset
    doc.setFont("helvetica", "normal");

    y += 6;
    doc.text("MUMBAI MAIN BRANCH", rightMargin, y);
    y += 6;
    doc.text("NARIMAN POINT, MUMBAI, 400021", rightMargin, y);
    y += 10;

    doc.text(`Branch Code       : 00366`, rightMargin, y);
    y += 6;
    doc.text(`Branch Phone      : 1800-425-3800`, rightMargin, y);
    y += 6;
    doc.text(`IFSC Code         : PUNB044500`, rightMargin, y); // Placeholder
    y += 6;
    doc.text(`MICR Code         : 400020100`, rightMargin, y);
    y += 10;

    doc.setFont("helvetica", "bold");
    doc.text(`Account Number    : ${account.account_number || account.id}`, rightMargin, y);
    y += 6;
    // @ts-ignore
    doc.text(`CIF Number        : ${account.customer.cif_number || "N/A"}`, rightMargin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.text(`Account Type      : ${account.account_type.toUpperCase()}`, rightMargin, y);

    y = 85;

    doc.line(15, y, 195, y); // Bottom Divider of Header

    // --- TRANSACTION TABLE ---
    const tableColumn = ["Txn Date", "Value Date", "Description", "Ref No", "Debit", "Credit", "Balance"];
    const tableRows: any[] = [];

    // Running Balance Calc (Reverse since we usually fetch Descending)
    // Actually, statements usually go OLD -> NEW.
    // If input transactions are DESC (Newest First), we should reverse them for calculation or display.
    // The typical standard is Ascending Order for statements.

    const sortedTxns = [...transactions].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    // We need a starting balance? 
    // Ideally we fetch balance at start_date. For now, we'll just list transactions.
    // For 'Runnning Balance' column, we can do a rough calc or just leave it if tricky.
    // Let's assume the current balance is the End State.
    // We can work backwards or forwards.
    // Simplified: Just show the txn details. `Balance` column might be hard without opening balance.
    // Let's try to calculate it if we can, or leave it blank. 
    // The image shows a Balance column.
    // Let's omit Balance column logic for MVP unless we have opening balance.
    // Actually, let's put it in but maybe just put "-" if unknown.
    // OR, we can try.

    let runningBal = 0; // This is wrong if we don't have opening.
    // Let's just list the rows matching the image columns.

    sortedTxns.forEach(txn => {
        const date = new Date(txn.created_at).toLocaleDateString('en-IN');
        const amount = Number(txn.amount);
        const isCredit = txn.txn_type === 'credit';

        const debit = isCredit ? "" : amount.toFixed(2);
        const credit = isCredit ? amount.toFixed(2) : "";

        tableRows.push([
            date,
            date, // Value Date usually same as Post Date for instant
            txn.description || txn.txn_type,
            txn.reference || "-",
            debit,
            credit,
            "-" // Balance not available in simple list
        ]);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: y + 5,
        theme: 'striped',
        headStyles: {
            fillColor: [66, 66, 66],
            textColor: [255, 255, 255],
            fontSize: 8,
            halign: 'center'
        },
        bodyStyles: {
            fontSize: 8,
        },
        columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: 20 },
            2: { cellWidth: 60 }, // Description
            3: { cellWidth: 25 },
            4: { cellWidth: 20, halign: 'right' }, // Debit
            5: { cellWidth: 20, halign: 'right' }, // Credit
            6: { cellWidth: 20, halign: 'right' }, // Balance
        },
        didDrawPage: (data) => {
            // Footer
            const pageSize = doc.internal.pageSize;
            const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
            doc.setFontSize(8);
            doc.text("This is a computer generated statement.", 15, pageHeight - 10);
            const pageCount = (doc as any).internal.getNumberOfPages();
            doc.text(`Page ${pageCount}`, 195, pageHeight - 10, { align: 'right' });
        }
    });

    doc.save(`Statement_${account.account_number || account.id}.pdf`);
};
