package com.medtrack.util;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.io.source.ByteArrayOutputStream;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.Rectangle;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfPage;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.canvas.PdfCanvas;
import com.itextpdf.kernel.pdf.event.AbstractPdfDocumentEvent;
import com.itextpdf.kernel.pdf.event.AbstractPdfDocumentEventHandler;
import com.itextpdf.kernel.pdf.event.PdfDocumentEvent;
import com.itextpdf.layout.Canvas;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.medtrack.model.EquipmentOrder;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Component
public class SupplierInvoicePdf {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    public byte[] generate(EquipmentOrder order) {
        if (order == null) {
            throw new IllegalArgumentException("Order cannot be null for invoice generation");
        }

        PdfFont boldFont;
        PdfFont regularFont;
        try {
            boldFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            regularFont = PdfFontFactory.createFont(StandardFonts.HELVETICA);
        } catch (IOException e) {
            throw new RuntimeException("Could not load Helvetica fonts", e);
        }

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(outputStream);
        PdfDocument pdfDocument = new PdfDocument(writer);

        // Register header & footer event handler
        InvoiceHeaderFooterHandler handler = new InvoiceHeaderFooterHandler(boldFont, regularFont);
        pdfDocument.addEventHandler(PdfDocumentEvent.END_PAGE, handler);

        try (Document document = new Document(pdfDocument)) {
            // Margin setup to not overlap header/footer
            document.setMargins(70, 36, 70, 36);

            // Invoice Title
            Paragraph title = new Paragraph("COMMERCIAL TAX INVOICE")
                    .setFont(boldFont)
                    .setFontSize(22)
                    .setFontColor(new DeviceRgb(15, 23, 42)) // Slate-900
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setMarginBottom(15);
            document.add(title);

            // Meta Info Grid
            Table metaTable = new Table(UnitValue.createPercentArray(new float[]{50, 50})).useAllAvailableWidth();
            metaTable.setBorder(null);

            // Left: Supplier details
            Cell leftCell = new Cell().setBorder(null);
            leftCell.add(new Paragraph("FROM:").setFont(boldFont).setFontSize(10).setFontColor(ColorConstants.GRAY));
            leftCell.add(new Paragraph("MedTrack Global Supplier Division").setFont(boldFont).setFontSize(11));
            leftCell.add(new Paragraph("102 Logistics Boulevard, Cargo Park").setFont(regularFont).setFontSize(9));
            leftCell.add(new Paragraph("New Delhi, Delhi, 110037").setFont(regularFont).setFontSize(9));
            leftCell.add(new Paragraph("GSTIN: 07AAAAM8362L1Z4 | Code: MT-SUP-88").setFont(regularFont).setFontSize(9));
            metaTable.addCell(leftCell);

            // Right: Invoice Metadata
            Cell rightCell = new Cell().setBorder(null);
            rightCell.add(new Paragraph("BILL TO:").setFont(boldFont).setFontSize(10).setFontColor(ColorConstants.GRAY));
            rightCell.add(new Paragraph(order.getHospital()).setFont(boldFont).setFontSize(11));
            rightCell.add(new Paragraph("Procurement Admin: " + order.getCreatedBy()).setFont(regularFont).setFontSize(9));
            rightCell.add(new Paragraph("Invoice Number: INV-" + order.getOrderCode()).setFont(boldFont).setFontSize(9).setFontColor(new DeviceRgb(29, 78, 216)));
            rightCell.add(new Paragraph("Invoice Date: " + (order.getOrderDate() != null ? DATE_TIME_FORMATTER.format(order.getOrderDate()) : "N/A")).setFont(regularFont).setFontSize(9));
            metaTable.addCell(rightCell);

            document.add(metaTable);
            document.add(new Paragraph("").setMarginBottom(15));

            // Line Items Table
            Table itemTable = new Table(UnitValue.createPercentArray(new float[]{40, 10, 15, 15, 20})).useAllAvailableWidth();
            
            // Header Row
            DeviceRgb tableHeaderBg = new DeviceRgb(30, 41, 59); // Slate-800
            itemTable.addHeaderCell(new Cell().add(new Paragraph("EQUIPMENT DESCRIPTION").setFont(boldFont).setFontColor(ColorConstants.WHITE)).setBackgroundColor(tableHeaderBg).setBorder(new SolidBorder(ColorConstants.WHITE, 0.5f)));
            itemTable.addHeaderCell(new Cell().add(new Paragraph("QTY").setFont(boldFont).setFontColor(ColorConstants.WHITE)).setBackgroundColor(tableHeaderBg).setTextAlignment(TextAlignment.CENTER).setBorder(new SolidBorder(ColorConstants.WHITE, 0.5f)));
            itemTable.addHeaderCell(new Cell().add(new Paragraph("UNIT PRICE").setFont(boldFont).setFontColor(ColorConstants.WHITE)).setBackgroundColor(tableHeaderBg).setTextAlignment(TextAlignment.RIGHT).setBorder(new SolidBorder(ColorConstants.WHITE, 0.5f)));
            itemTable.addHeaderCell(new Cell().add(new Paragraph("TAX (GST 18%)").setFont(boldFont).setFontColor(ColorConstants.WHITE)).setBackgroundColor(tableHeaderBg).setTextAlignment(TextAlignment.RIGHT).setBorder(new SolidBorder(ColorConstants.WHITE, 0.5f)));
            itemTable.addHeaderCell(new Cell().add(new Paragraph("TOTAL AMOUNT").setFont(boldFont).setFontColor(ColorConstants.WHITE)).setBackgroundColor(tableHeaderBg).setTextAlignment(TextAlignment.RIGHT).setBorder(new SolidBorder(ColorConstants.WHITE, 0.5f)));

            // Compute math
            BigDecimal qty = BigDecimal.valueOf(order.getQuantity() != null ? order.getQuantity() : 1);
            BigDecimal unitCost = order.getUnitCost() != null ? order.getUnitCost() : BigDecimal.ZERO;
            BigDecimal subtotal = unitCost.multiply(qty);
            
            // 18% GST
            BigDecimal taxRate = BigDecimal.valueOf(0.18);
            BigDecimal gstAmount = subtotal.multiply(taxRate);
            BigDecimal totalAmount = subtotal.add(gstAmount);

            // Add Item Row
            itemTable.addCell(new Cell().add(new Paragraph(order.getEquipmentName()).setFont(regularFont).setFontSize(10)));
            itemTable.addCell(new Cell().add(new Paragraph(String.valueOf(order.getQuantity())).setFont(regularFont).setFontSize(10)).setTextAlignment(TextAlignment.CENTER));
            itemTable.addCell(new Cell().add(new Paragraph(formatMoney(unitCost)).setFont(regularFont).setFontSize(10)).setTextAlignment(TextAlignment.RIGHT));
            itemTable.addCell(new Cell().add(new Paragraph(formatMoney(gstAmount)).setFont(regularFont).setFontSize(10)).setTextAlignment(TextAlignment.RIGHT));
            itemTable.addCell(new Cell().add(new Paragraph(formatMoney(totalAmount)).setFont(boldFont).setFontSize(10)).setTextAlignment(TextAlignment.RIGHT));

            document.add(itemTable);
            document.add(new Paragraph("").setMarginBottom(15));

            // Summary Totals
            Table summaryTable = new Table(UnitValue.createPercentArray(new float[]{60, 40})).useAllAvailableWidth();
            summaryTable.setBorder(null);
            
            // Notes block (left)
            Cell noteCell = new Cell().setBorder(null);
            noteCell.add(new Paragraph("TERMS & CONDITIONS").setFont(boldFont).setFontSize(8).setFontColor(ColorConstants.GRAY));
            noteCell.add(new Paragraph("1. Payment must be made within 30 days of invoice date.\n" +
                    "2. Goods received in good condition. Warranty applies as per SLA contract.\n" +
                    "3. For billing disputes, reach out to finance@medtrack.com.").setFont(regularFont).setFontSize(8).setFontColor(ColorConstants.DARK_GRAY));
            summaryTable.addCell(noteCell);

            // Pricing totals block (right)
            Cell pricingCell = new Cell().setBorder(null);
            Table priceGrid = new Table(UnitValue.createPercentArray(new float[]{50, 50})).useAllAvailableWidth();
            priceGrid.addCell(new Cell().add(new Paragraph("Subtotal").setFont(regularFont).setFontSize(10)).setBorder(null));
            priceGrid.addCell(new Cell().add(new Paragraph(formatMoney(subtotal)).setFont(regularFont).setFontSize(10)).setTextAlignment(TextAlignment.RIGHT).setBorder(null));
            
            priceGrid.addCell(new Cell().add(new Paragraph("GST (18%)").setFont(regularFont).setFontSize(10)).setBorder(null));
            priceGrid.addCell(new Cell().add(new Paragraph(formatMoney(gstAmount)).setFont(regularFont).setFontSize(10)).setTextAlignment(TextAlignment.RIGHT).setBorder(null));
            
            Cell totalLabel = new Cell().add(new Paragraph("Grand Total").setFont(boldFont).setFontSize(11).setFontColor(new DeviceRgb(29, 78, 216))).setBorder(null);
            Cell totalValue = new Cell().add(new Paragraph(formatMoney(totalAmount)).setFont(boldFont).setFontSize(11).setFontColor(new DeviceRgb(29, 78, 216))).setTextAlignment(TextAlignment.RIGHT).setBorder(null);
            priceGrid.addCell(totalLabel);
            priceGrid.addCell(totalValue);

            pricingCell.add(priceGrid);
            summaryTable.addCell(pricingCell);

            document.add(summaryTable);

            // Authorized Signature Placeholder
            document.add(new Paragraph("").setMarginBottom(35));
            Table signTable = new Table(UnitValue.createPercentArray(new float[]{70, 30})).useAllAvailableWidth();
            signTable.setBorder(null);
            
            signTable.addCell(new Cell().setBorder(null));
            Cell signCell = new Cell().setBorder(null).setTextAlignment(TextAlignment.CENTER);
            signCell.add(new Paragraph("").setBorderBottom(new SolidBorder(ColorConstants.GRAY, 0.5f)));
            signCell.add(new Paragraph("Authorized Signatory").setFont(boldFont).setFontSize(8).setFontColor(ColorConstants.GRAY));
            signTable.addCell(signCell);
            
            document.add(signTable);
        }

        return outputStream.toByteArray();
    }

    private String formatMoney(BigDecimal amount) {
        if (amount == null) return "₹0.00";
        return "₹" + String.format("%,.2f", amount);
    }

    /**
     * Inner class to draw clean headers and footers on every page.
     */
    private static class InvoiceHeaderFooterHandler extends AbstractPdfDocumentEventHandler {
        private final PdfFont boldFont;
        private final PdfFont regularFont;

        public InvoiceHeaderFooterHandler(PdfFont boldFont, PdfFont regularFont) {
            this.boldFont = boldFont;
            this.regularFont = regularFont;
        }

        @Override
        public void onAcceptedEvent(AbstractPdfDocumentEvent event) {
            PdfDocumentEvent docEvent = (PdfDocumentEvent) event;
            PdfDocument pdf = docEvent.getDocument();
            PdfPage page = docEvent.getPage();
            Rectangle pageGeometry = page.getPageSize();
            
            // Get canvas for drawing
            PdfCanvas pdfCanvas = new PdfCanvas(page);
            Canvas canvas = new Canvas(pdfCanvas, pageGeometry);

            // Header Layout (Top margin is 70)
            float xHeader = pageGeometry.getLeft() + 36;
            float yHeader = pageGeometry.getTop() - 36;
            float width = pageGeometry.getWidth() - 72;

            canvas.showTextAligned(new Paragraph("MedTrack Procurement Platform").setFont(boldFont).setFontSize(9).setFontColor(new DeviceRgb(29, 78, 216)),
                    xHeader, yHeader, TextAlignment.LEFT);
            canvas.showTextAligned(new Paragraph("Secure Hospital Supply Chain").setFont(regularFont).setFontSize(8).setFontColor(ColorConstants.GRAY),
                    xHeader + width, yHeader, TextAlignment.RIGHT);

            // Header Separator Line
            pdfCanvas.setStrokeColor(new DeviceRgb(226, 232, 240))
                    .setLineWidth(0.75f)
                    .moveTo(xHeader, yHeader - 8)
                    .lineTo(xHeader + width, yHeader - 8)
                    .stroke();

            // Footer Layout (Bottom margin is 70)
            float yFooter = pageGeometry.getBottom() + 30;
            canvas.showTextAligned(new Paragraph("Confidential | Generated by MedTrack ERP System").setFont(regularFont).setFontSize(8).setFontColor(ColorConstants.GRAY),
                    xHeader, yFooter, TextAlignment.LEFT);

            String pageNumber = "Page " + pdf.getPageNumber(page) + " of " + pdf.getNumberOfPages();
            canvas.showTextAligned(new Paragraph(pageNumber).setFont(regularFont).setFontSize(8).setFontColor(ColorConstants.GRAY),
                    xHeader + width, yFooter, TextAlignment.RIGHT);

            // Footer Separator Line
            pdfCanvas.moveTo(xHeader, yFooter + 12)
                    .lineTo(xHeader + width, yFooter + 12)
                    .stroke();

            canvas.close();
        }
    }
}
