import ApiService from "./ApiServices";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "jspdf-barcode";
import listReactFiles from "list-react-files";
import { getAllFiles, getAllFilesSync } from "get-all-files";
import { infoNotification } from "./Utils";
var read = require("read-directory");
const fs = require("fs");

// 1. Purchase Order, Product Receipt, Bill, Bill Payment
const PurchaseOrderPDF = {
  // PRODUCT RECEIVED PDF
  generateProductReceivedPDF(productReceivedId) {
    let vendor = "";
    let products = [];

    console.log("id", productReceivedId);
    ApiService.setHeader();
    ApiService.get("productReceipt/" + productReceivedId).then((response) => {
      console.log(response);
      if (response.data.isSuccess) {
        const productReceived = response.data.document;
        // console.log(productReceived);
        // products = productReceived.products

        ApiService.get("vendor/" + productReceived.vendor)
          .then((response) => {
            vendor = response.data.document;
            console.log(products);
            //
            let Products = new Array();
            var doc = new jsPDF("p", "pt", "a4");

            doc.setDrawColor(0);
            doc.setFillColor(255, 255, 255);
            doc.rect(0, 0, 700, 40, "F");
            doc.setFontSize(12);
            doc.text("Date:", 460, 90);
            doc.text(`${productReceived.effectiveDate?.slice(0, 10)}`, 490, 90);
            // doc.rect(460, 62, 90, 15);
            doc.setFontSize(17);
            doc.setFont("bold");
            // doc.text("PO#:", 430, 95);
            //POO number
            doc.text(`${productReceived.name}`, 460, 70);
            // doc.rect(460, 77, 90, 15);

            doc.setFontSize(22);
            // doc.setFont("times", "italic");
            doc.text("Company:", 40, 70);
            // doc.line(40, 68, 90, 68)
            doc.setFontSize(17);
            doc.text(`PBTI`, 138, 70);

            doc.setFontSize(12);
            doc.text("Address:", 40, 90);
            doc.setFontSize(9);
            doc.text(
              "\nWebel Software, Ground Floor, \nDN Block, Sector V, \nWest Bengal 700091",
              90,
              80
            );

            doc.setFontSize(12);
            doc.text("Phone:", 40, 140);
            doc.setFontSize(9);
            doc.text("8282822924", 80, 140);
            doc.setFontSize(12);
            doc.text("Website:", 40, 160);
            doc.setFontSize(9);
            doc.text("www.paapri.com", 90, 160);
            // doc.text("Website:", 40, 200);

            doc.setDrawColor(255, 0, 0);
            doc.setFillColor(230, 230, 230);
            doc.rect(40, 175, 200, 20, "F");
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text("Receive From:", 45, 190);
            doc.setTextColor(0, 0, 0);
            // doc.text("Name:", 43, 210);
            doc.setFontSize(9);
            doc.text(vendor.name, 43, 205);
            // doc.text(`${productReceived.vendor.address}`, 43, 230);
            // doc.setDrawColor(255, 0, 0);
            // doc.setFillColor(230, 230, 230);
            // doc.rect(355, 175, 200, 20, "F");
            // doc.setFontSize(12);
            // doc.setTextColor(0, 0, 0);
            // doc.text("Ship To:", 360, 190);
            // doc.setTextColor(0, 0, 0);
            // doc.text("Name & Address:", 358, 210);
            doc.setFontSize(30);
            doc.setFont("Sans-serif");
            doc.setTextColor(0, 0, 0);
            doc.text("Product Receipt", 215, 40);
            let height = 200;

            doc.autoTable({
              margin: { top: 280 },
              styles: {
                lineColor: [153, 153, 153],
                lineWidth: 1,
                fillColor: [179, 179, 179],
              },
              columnStyles: {
                europe: { halign: "center" },
                0: { cellWidth: 90 },
                2: { cellWidth: 80, halign: "right" },
                3: { cellWidth: 80, halign: "right" },
                4: { cellWidth: 80 },
              },
              body: productReceived.operations,
              columns: [
                { header: "Product", dataKey: "name" },
                { header: "Description", dataKey: "description" },
                {
                  header: "DemandQty",
                  dataKey: "demandQuantity",
                  halign: "center",
                },
                {
                  header: "ReceivedQty",
                  dataKey: "doneQuantity",
                  halign: "center",
                },
                // { header: 'GST', dataKey: 'taxes' },
                // { header: 'Sub Total', dataKey: 'subTotal' },
              ],
              didDrawPage: (d) => (height = d.cursor.y), // calculate height of the autotable dynamically
            });

            let h = height + 30;
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            const pageCount = doc.internal.getNumberOfPages();

            doc.text(`${pageCount}`, 300, 820);

            doc.save(`Product Receipt - ${productReceived.name}.pdf`);
            //
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
  },

  //BILL PDF
  generateBillPDF(billId) {
    ApiService.setHeader();
    ApiService.get("bill/forpdf/" + billId).then((response) => {
      console.log(response);
      if (response.data.isSuccess) {
        const bill = response.data.document;
        ApiService.get("vendor/" + bill.vendor).then((res) => {
          if (res.data.isSuccess) {
            console.log(res.data.document);
            let Products = new Array();
            var doc = new jsPDF("p", "pt", "a4");

            doc.setDrawColor(0);
            doc.setFillColor(255, 255, 255);
            doc.rect(0, 0, 700, 40, "F");
            doc.setFontSize(12);
            doc.text("Date:", 440, 110);
            doc.text(`${bill.billDate?.slice(0, 10)}`, 470, 110);
            // doc.rect(460, 62, 90, 15);
            doc.setFontSize(17);
            // doc.setFont("bold");

            doc.text(bill.name ? bill.name : "", 440, 70);
            // doc.rect(460, 77, 90, 15);

            doc.setFontSize(22);
            // doc.setFont("times", "italic");
            doc.text("Company:", 40, 70);
            // doc.line(40, 68, 90, 68)
            doc.setFontSize(17);
            doc.text(`PBTI`, 138, 70);

            doc.setFontSize(12);
            doc.text("Address:", 40, 90);
            doc.setFontSize(9);
            doc.text(
              "\nWebel Software, Ground Floor, \nDN Block, Sector V, \nWest Bengal 700091",
              90,
              80
            );

            doc.setFontSize(12);
            doc.text("Phone:", 40, 140);
            doc.setFontSize(9);
            doc.text("8282822924", 80, 140);
            doc.setFontSize(12);
            doc.text("Website:", 40, 160);
            doc.setFontSize(9);
            doc.text("www.paapri.com", 90, 160);

            doc.setDrawColor(255, 0, 0);
            doc.setFillColor(230, 230, 230);
            doc.rect(40, 175, 200, 20, "F");
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text("Bill To:", 45, 190);
            // doc.setTextColor(0, 0, 0);
            // doc.text("Name:", 43, 210);
            doc.setFontSize(9);
            doc.text(`${res.data.document.name}`, 43, 205);
            doc.text(`${res.data.document.address}`, 43, 220);
            // doc.setDrawColor(255, 0, 0);
            // doc.setFillColor(230, 230, 230);
            // doc.rect(355, 175, 200, 20, "F");
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            // doc.text("Source Document:", 360, 190);
            if (bill.sourceDocument) {
              doc.text(`${bill.sourceDocument.name}`, 440, 90);
            }

            // doc.setTextColor(0, 0, 0);
            // doc.text("Name & Address:", 358, 210);
            doc.setFontSize(30);
            // doc.setFont("Sans-serif");
            doc.setTextColor(0, 0, 0);
            doc.text("Bill", 260, 40);
            let height = 200;

            // Restructure line items
            let array = new Array();
            response?.data?.newinvoiceLines?.map((e) => {
              let obj = new Object();

              obj.productName = e.productName;
              obj.label = e.label;
              // obj.accountName = e.accountName;
              obj.quantity = e.quantity;
              obj.unitPrice = e.unitPrice.toFixed(2);
              obj.taxes = e.taxes + "%";
              obj.subTotal = e.subTotal.toFixed(2);
              array.push(obj);
            });
            console.log(array);

            doc.autoTable({
              margin: { top: 280 },
              styles: {
                lineColor: [153, 153, 153],
                lineWidth: 1,
                fillColor: [179, 179, 179],
              },
              columnStyles: {
                europe: { halign: "center" },
                0: { cellWidth: 88 },
                2: { cellWidth: 80, halign: "center" },
                3: { cellWidth: 50, halign: "right" },
                4: { cellWidth: 65 },
                5: { cellWidth: 40, halign: "right" },
                6: { cellWidth: 88, halign: "left" },
              },
              // body: response.data.newinvoiceLines,
              body: array,
              columns: [
                { header: "Product", dataKey: "productName" },
                { header: "Label", dataKey: "label" },
                // {
                //   header: "Account",
                //   dataKey: "accountName",
                //   halign: "center",
                // },
                { header: "Quantity", dataKey: "quantity", halign: "center" },
                { header: "Unit Price", dataKey: "unitPrice" },
                // { header: "Taxes", dataKey: "taxes" },
                { header: "Sub Total", dataKey: "subTotal" },
              ],
              didDrawPage: (d) => (height = d.cursor.y), // calculate height of the autotable dynamically
            });

            let h = height + 30;

            // Calculate taxes
            let totalTaxAmount = 0;
            bill.invoiceLines.map((e) => {
              totalTaxAmount += parseFloat((e.subTotal * e.taxes) / 100);
            });

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            // doc.text("CGST: ", 460, h);
            // // doc.text(`${bill.estimation?.cgst}`, 490, h);
            // doc.text(`${parseFloat(totalTaxAmount / 2).toFixed(2)}`, 490, h);
            // doc.text("SGST: ", 460, h + 10);
            // doc.text(
            //   `${parseFloat(totalTaxAmount / 2).toFixed(2)}`,
            //   490,
            //   h + 10
            // );
            // doc.text("IGST: ", 460, h + 20);
            // doc.text(`${totalTaxAmount}`, 490, h + 20);
            doc.line(460, h + 30, 560, h + 30);
            console.log(parseFloat(totalTaxAmount / 2));
            console.log(parseFloat(totalTaxAmount / 2).toFixed(2));
            doc.text("Total: ", 460, h + 40);
            doc.text(`${parseFloat(bill.total).toFixed(2)}`, 490, h + 40);
            doc.line(460, h + 50, 560, h + 50);

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            const pageCount = doc.internal.getNumberOfPages();

            doc.text(`${pageCount}`, 300, 820);

            doc.save(`Bill - ${bill.name}.pdf`);
          } else {
            alert("something wrong in geting vendor!!!");
          }
        });
      }
    });
  },

  //BILL PAYEMENT PDF
  // generateBillPaymentPDF(billPaymentId) {
  //     console.log(billPaymentId)
  //     ApiService.setHeader();
  //     ApiService.get('billPayment/' + billPaymentId).then(response => {
  //         console.log(response);
  //         if (response.data.isSuccess) {
  //             const billPayment = response.data.document;

  //             let Products = new Array();
  //             var doc = new jsPDF('p', 'pt', 'a4');

  //             doc.setDrawColor(0);
  //             doc.setFillColor(255, 255, 255);
  //             doc.rect(0, 0, 700, 40, "F");
  //             doc.setFontSize(12);
  //             doc.text("Date:", 430, 90);
  //             doc.text(`${billPayment.date?.slice(0, 10)}`, 460, 90);
  //             // doc.rect(460, 62, 90, 15);
  //             doc.setFontSize(17);
  //             doc.setFont("bold");
  //             // doc.text("PO#:", 430, 95);
  //             //POO number
  //             doc.text(`${billPayment.name}`, 460, 70);
  //             // doc.rect(460, 77, 90, 15);

  //             doc.setFontSize(22);
  //             // doc.setFont("times", "italic");
  //             doc.text("Company:", 40, 70);
  //             // doc.line(40, 68, 90, 68)
  //             doc.setFontSize(17);
  //             doc.text(`PBTI`, 138, 70);

  //             doc.setFontSize(12);
  //             doc.text("Address:", 40, 90);
  //             doc.setFontSize(9);
  //             doc.text("\nWebel Software, Ground Floor, \nDN Block, Sector V, \nWest Bengal 700091", 90, 80);

  //             doc.setFontSize(12);
  //             doc.text("Phone:", 40, 140);
  //             doc.setFontSize(9);
  //             doc.text("8282822924", 80, 140);
  //             doc.setFontSize(12);
  //             doc.text("Website:", 40, 160);
  //             doc.setFontSize(9);
  //             doc.text("www.paapri.com", 90, 160);
  //             // doc.text("Website:", 40, 200);

  //             doc.setDrawColor(255, 0, 0);
  //             doc.setFillColor(102, 194, 255);
  //             doc.rect(40, 175, 200, 20, "F");
  //             doc.setFontSize(12);
  //             doc.setTextColor(0, 0, 0);
  //             doc.text("Billed To:", 45, 190);
  //             doc.setTextColor(0, 0, 0);
  //             doc.text("Name & Address:", 43, 210);
  //             doc.setFontSize(9);
  //             doc.text(`${billPayment.vendor.name}`, 43, 220);
  //             doc.text(`${billPayment.vendor.address}`, 43, 230);
  //             // doc.setDrawColor(255, 0, 0);
  //             // doc.setFillColor(102, 194, 255);
  //             // doc.rect(355, 175, 200, 20, "F");
  //             // doc.setFontSize(12);
  //             // doc.setTextColor(0, 0, 0);
  //             // doc.text("Ship To:", 360, 190);
  //             // doc.setTextColor(0, 0, 0);
  //             // doc.text("Name & Address:", 358, 210);
  //             doc.setFontSize(30);
  //             doc.setFont('Sans-serif');
  //             doc.setTextColor(255, 255, 255);
  //             doc.text("Print Bill", 220, 28);
  //             let height = 200;

  //             doc.autoTable({

  //                 margin: { top: 280 },
  //                 styles: {
  //                     lineColor: [102, 194, 255],
  //                     lineWidth: 1,
  //                     fillColor: [102, 194, 255],

  //                 },
  //                 columnStyles: {
  //                     europe: { halign: 'center' },
  //                     0: { cellWidth: 88 },
  //                     2: { cellWidth: 40, halign: 'center' },
  //                     3: { cellWidth: 57, halign: 'right' },
  //                     4: { cellWidth: 65 },
  //                     5: { cellWidth: 65, halign: 'right' },
  //                 },
  //                 body: billPayment.products,
  //                 columns: [
  //                     { header: 'Journal Type', dataKey: 'journalType' },
  //                     // { header: 'Cash', dataKey: 'cash' },
  //                     { header: 'Amount', dataKey: 'amount', halign: 'center' },
  //                     { header: 'Recipient Bank', dataKey: 'recipientBank', halign: 'center' },
  //                     { header: 'Payment Date', dataKey: 'paymentDate', halign: 'center' },
  //                     { header: 'Memo', dataKey: 'memo' },
  //                     // { header: 'Sub Total', dataKey: 'subTotal' },
  //                 ],
  //                 didDrawPage: (d) => height = d.cursor.y,// calculate height of the autotable dynamically
  //             })

  //             let h = height + 30;

  //             doc.setTextColor(0, 0, 0);
  //             doc.setFontSize(10);
  //             const pageCount = doc.internal.getNumberOfPages();

  //             doc.text(`${pageCount}`, 300, 820);
  //             doc.save(`Bill Payment - ${billPayment.name}.pdf`);

  //         }

  //     })

  // },

  generatePurchaseOrderPDF(purchaseOrderId) {
    console.log(purchaseOrderId);

    ApiService.get("purchaseOrder/" + purchaseOrderId)
      .then((response) => {
        if (response.data.isSuccess) {
          const purchaseOrder = response.data.document;
          ApiService.get("vendor/" + purchaseOrder.vendor[0].id).then((res) => {
            if (res.data.isSuccess) {
              let products = new Array();
              var doc = new jsPDF("p", "pt", "a4");
              //header color
              doc.setDrawColor(0);
              doc.setFillColor(255, 255, 255);
              doc.rect(0, 0, 700, 40, "F");
              doc.setFontSize(12);
              doc.text("Date:", 460, 90);
              doc.text(`${purchaseOrder.date?.slice(0, 10)}`, 490, 90);
              // doc.rect(460, 62, 90, 15);
              doc.setFontSize(17);
              doc.setFont("bold");
              // doc.text("PO#:", 430, 95);
              //POO number
              doc.text(`${purchaseOrder.name}`, 460, 70);
              // doc.rect(460, 77, 90, 15);

              doc.setFontSize(22);
              // doc.setFont("times", "italic");
              doc.text("Company:", 40, 70);
              // doc.line(40, 68, 90, 68)
              doc.setFontSize(17);
              doc.text(`PBTI`, 138, 70);

              // doc.setFontSize(12);
              // doc.text("Address:", 40, 90);
              // doc.setFontSize(9);
              // doc.text("\nWebel Software, Ground Floor, \nDN Block, Sector V, \nWest Bengal 700091", 90, 80);

              // doc.setFontSize(9);
              // doc.text("8282822924", 80, 140);
              doc.setFontSize(12);
              doc.text("Website:", 40, 90);
              doc.setFontSize(9);
              doc.text("www.paapri.com", 90, 90);
              // doc.text("Website:", 40, 200);

              doc.setDrawColor(255, 0, 0);
              doc.setFillColor(230, 230, 230);
              doc.rect(40, 175, 200, 20, "F");
              doc.setFontSize(12);
              doc.setTextColor(0, 0, 0);
              doc.text("Vendor:", 45, 190);
              doc.setTextColor(0, 0, 0);
              // doc.text("Name & Address:", 45, 210);
              doc.setFontSize(9);
              doc.text(`${res.data.document.name}`, 43, 210);
              var vendorAddress = doc.splitTextToSize(
                `${res.data.document.address}`,
                180 - 0 - 0
              );
              doc.text(vendorAddress, 43, 220);

              var vendorAddressDimension = doc.getTextDimensions(vendorAddress);
              doc.setFontSize(12);
              doc.setTextColor(0, 0, 0);
              doc.text("Phone:", 42, vendorAddressDimension.h + 230);
              doc.text(
                `${res.data.document.phone}`,
                78,
                vendorAddressDimension.h + 230
              );
              doc.setFontSize(12);
              doc.setTextColor(0, 0, 0);
              // doc.text("Phone:", 42, 273);
              // doc.text(`${res.data.document.phone}`, 78, 273);
              doc.setDrawColor(255, 0, 0);
              doc.setFillColor(230, 230, 230);
              doc.rect(355, 175, 200, 20, "F");
              doc.setFontSize(12);
              doc.setTextColor(0, 0, 0);
              doc.text("Ship To:", 360, 190);
              doc.setTextColor(0, 0, 0);
              doc.setFontSize(9);
              doc.text("Address :", 360, 210);
              doc.text(
                "\nWebel Software, Ground Floor, \nDN Block, Sector V, \nWest Bengal 700091",
                360,
                213
              );

              doc.setFontSize(9);
              // doc.text(`${purchaseOrder.name}`, 358, 220);
              // doc.text(`${purchaseOrder.address}`, 358, 230);
              doc.setFontSize(30);
              doc.setFont("Sans-serif");
              doc.setTextColor(0, 0, 0);
              doc.text("Purchase Order", 210, 40);
              let height = 200;

              // reconstract the line item array
              let array = new Array();
              purchaseOrder?.products?.map((e) => {
                let obj = new Object();

                obj.name = e.product[0].name;
                obj.description = e.description;
                obj.quantity = e.quantity;
                obj.unitPrice = e.unitPrice?.toFixed(2);
                obj.taxes = e.taxes + "%";
                obj.subTotal = e.subTotal?.toFixed(2);
                array.push(obj);
              });
              console.log(array);

              // Create the table of products data
              if (array.length) {
                doc.autoTable({
                  // margin: { top: 280 },
                  margin: { top: 250 + vendorAddressDimension.h },
                  styles: {
                    lineColor: [153, 153, 153],
                    lineWidth: 1,
                    fillColor: [179, 179, 179],
                  },
                  columnStyles: {
                    europe: { halign: "center" },
                    0: { cellWidth: 88 },
                    2: { cellWidth: 40, halign: "center" },
                    3: { cellWidth: 57, halign: "right" },
                    4: { cellWidth: 65 },
                    5: { cellWidth: 65, halign: "right" },
                  }, // European countries centered
                  // body: purchaseOrder.products,
                  body: array,
                  columns: [
                    { header: "Product", dataKey: "name" },
                    { header: "Description", dataKey: "description" },
                    { header: "Qty", dataKey: "quantity", halign: "center" },
                    {
                      header: "Unit Price",
                      dataKey: "unitPrice",
                      halign: "center",
                    },
                    { header: "GST", dataKey: "taxes" },
                    { header: "Amount", dataKey: "subTotal" },
                    // { header: 'Cgst', dataKey: 'cgst' },
                    // { header: 'Sgst', dataKey: 'sgst' },
                  ],
                  didDrawPage: (d) => (height = d.cursor.y), // calculate height of the autotable dynamically
                });
              } else {
                alert(
                  "issue in printing PO pdf. Please contact to your developer."
                );
              }

              let h = height + 30;

              // var formatter = new Intl.NumberFormat('en-in', {
              //     style: 'currency',
              //     currency: 'INR',
              // });

              // var currencyFormatted = formatter.format(purchaseOrder.estimation?.total);

              // doc.setTextColor(0, 0, 0);
              // doc.setFontSize(10);
              // doc.text("Total:", 460, h);
              // doc.text(`${purchaseOrder.estimation?.total}`, 490, h);

              doc.setTextColor(0, 0, 0);
              doc.setFontSize(10);
              doc.text("TAX:", 460, h + 10);
              doc.text(
                `${purchaseOrder?.estimation?.tax?.toFixed(2)}`,
                490,
                h + 10
              );
              // doc.text("SGST:", 460, h + 20);
              // doc.text(
              //   `${purchaseOrder?.estimation?.sgst?.toFixed(2)}`,
              //   490,
              //   h + 20
              // );
              // doc.text("IGST:", 460, h + 20);
              // doc.text(`${purchaseOrder.estimation?.igst}`, 490, h + 20);
              doc.line(460, h + 30, 550, h + 30);

              doc.setTextColor(0, 0, 0);
              doc.setFontSize(12);
              doc.text("TOTAL:", 440, h + 45);
              doc.line(460, h + 50, 550, h + 50);
              doc.text(
                `${purchaseOrder?.estimation?.total?.toFixed(2)}`,
                490,
                h + 45
              );

              // doc.text("taxes:", 40, h);
              // doc.text('${}', 80, h);
              // doc.text(`Total: ${currencyFormatted}`, 380, h);
              const pageCount = doc.internal.getNumberOfPages();

              doc.text(`${pageCount}`, 300, 820);
              doc.save(`Purchase Order - ${purchaseOrder.name}.pdf`);
            } else {
              console.log("something wrong while get vendor value");
              alert("something wrong while get vendor value");
            }
          });
        } else {
          console.log(
            "Something went wrong while generating purchase order pdf"
          );
          alert("Something went wrong while generating purchase order pdf");
        }
      })
      .catch((e) => {
        console.log(e);
        alert(e);
      });
  },

  generateStandaloneBillPDF(billId) {
    ApiService.setHeader();
    ApiService.get("bill/forpdf/" + billId).then((response) => {
      console.log(response);
      if (response.data.isSuccess) {
        const bill = response.data.document;
        ApiService.get("vendor/" + bill.vendor).then((res) => {
          if (res.data.isSuccess) {
            console.log(res.data.document);
            let Products = new Array();
            var doc = new jsPDF("p", "pt", "a4");

            doc.setDrawColor(0);
            doc.setFillColor(255, 255, 255);
            doc.rect(0, 0, 700, 40, "F");
            doc.setFontSize(12);
            doc.text("Date:", 440, 110);
            doc.text(`${bill.billDate?.slice(0, 10)}`, 470, 110);
            // doc.rect(460, 62, 90, 15);
            doc.setFontSize(17);
            // doc.setFont("bold");

            doc.text(bill.name ? bill.name : "", 440, 70);
            // doc.rect(460, 77, 90, 15);

            doc.setFontSize(22);
            // doc.setFont("times", "italic");
            doc.text("Company:", 40, 70);
            // doc.line(40, 68, 90, 68)
            doc.setFontSize(17);
            doc.text(`PBTI`, 138, 70);

            doc.setFontSize(12);
            doc.text("Address:", 40, 90);
            doc.setFontSize(9);
            doc.text(
              "\nWebel Software, Ground Floor, \nDN Block, Sector V, \nWest Bengal 700091",
              90,
              80
            );

            doc.setFontSize(12);
            doc.text("Phone:", 40, 140);
            doc.setFontSize(9);
            doc.text("8282822924", 80, 140);
            doc.setFontSize(12);
            doc.text("Website:", 40, 160);
            doc.setFontSize(9);
            doc.text("www.paapri.com", 90, 160);

            doc.setDrawColor(255, 0, 0);
            doc.setFillColor(230, 230, 230);
            doc.rect(40, 175, 200, 20, "F");
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text("Bill To:", 45, 190);
            // doc.setTextColor(0, 0, 0);
            // doc.text("Name:", 43, 210);
            doc.setFontSize(9);
            doc.text(`${res.data.document.name}`, 43, 205);
            doc.text(`${res.data.document.address}`, 43, 220);
            // doc.setDrawColor(255, 0, 0);
            // doc.setFillColor(230, 230, 230);
            // doc.rect(355, 175, 200, 20, "F");
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            // doc.text("Source Document:", 360, 190);
            if (bill.sourceDocument) {
              doc.text(`${bill.sourceDocument.name}`, 440, 90);
            }

            // doc.setTextColor(0, 0, 0);
            // doc.text("Name & Address:", 358, 210);
            doc.setFontSize(30);
            // doc.setFont("Sans-serif");
            doc.setTextColor(0, 0, 0);
            doc.text("Bill", 260, 40);
            let height = 200;

            doc.autoTable({
              margin: { top: 280 },
              styles: {
                lineColor: [153, 153, 153],
                lineWidth: 1,
                fillColor: [179, 179, 179],
              },
              columnStyles: {
                europe: { halign: "center" },
                0: { cellWidth: 88 },
                2: { cellWidth: 80, halign: "center" },
                3: { cellWidth: 50, halign: "right" },
                4: { cellWidth: 65 },
                5: { cellWidth: 40, halign: "right" },
                6: { cellWidth: 88, halign: "left" },
              },
              body: response.data.newinvoiceLines,
              columns: [
                { header: "Product", dataKey: "productName" },
                { header: "Label", dataKey: "label" },
                {
                  header: "Account",
                  dataKey: "accountName",
                  halign: "center",
                },
                { header: "Quantity", dataKey: "quantity", halign: "center" },
                { header: "Unit Price", dataKey: "unitPrice" },
                { header: "Taxes", dataKey: "taxes" },
                { header: "Sub Total", dataKey: "subTotal" },
              ],
              didDrawPage: (d) => (height = d.cursor.y), // calculate height of the autotable dynamically
            });

            let h = height + 30;

            // Calculate taxes
            let totalTaxAmount = 0;
            bill.invoiceLines.map((e) => {
              totalTaxAmount += parseFloat((e.subTotal * e.taxes) / 100);
            });

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            doc.text("CGST: ", 460, h);
            // doc.text(`${bill.estimation?.cgst}`, 490, h);
            doc.text(`${parseFloat(totalTaxAmount / 2).toFixed(2)}`, 490, h);
            doc.text("SGST: ", 460, h + 10);
            doc.text(
              `${parseFloat(totalTaxAmount / 2).toFixed(2)}`,
              490,
              h + 10
            );
            // doc.text("IGST: ", 460, h + 20);
            // doc.text(`${totalTaxAmount}`, 490, h + 20);
            doc.line(460, h + 30, 490, h + 30);
            console.log(parseFloat(totalTaxAmount / 2));
            console.log(parseFloat(totalTaxAmount / 2).toFixed(2));
            doc.text("Total: ", 460, h + 40);
            doc.text(`${parseFloat(bill.total).toFixed(2)}`, 490, h + 40);
            doc.line(460, h + 50, 490, h + 50);

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            const pageCount = doc.internal.getNumberOfPages();

            doc.text(`${pageCount}`, 300, 820);

            doc.save(`Bill - ${bill.name}.pdf`);
          } else {
            alert("something wrong in geting vendor!!!");
          }
        });
      }
    });
  },
};

const SalesOrderPDF = {
  generateSalesOrderPDF(salesOrderId) {
    console.log(salesOrderId);
    ApiService.setHeader();
    ApiService.get("salesOrder/" + salesOrderId)
      .then((response) => {
        if (response.data.isSuccess) {
          console.log(salesOrderId);
          const salesOrder = response.data.document;
          console.log(salesOrder);
          ApiService.get("customer/" + salesOrder.customer[0]._id).then(
            async (res) => {
              if (res.data.isSuccess) {
                //Test to get image
                let lstat = "";
                await ApiService.get("company/getCompanyImage").then(
                  async (r) => {
                    console.log(r.data);
                  }
                );
                //

                let products = new Array();
                var doc = new jsPDF("p", "pt", "a4");
                //header color
                doc.setDrawColor(0);
                doc.setFillColor(255, 255, 255);
                doc.rect(0, 0, 700, 40, "F");
                doc.setFontSize(12);
                doc.text("Date:", 430, 90);
                doc.text(`${salesOrder.date?.slice(0, 10)}`, 460, 90);
                doc.text("Delivery Date:", 380, 110);
                doc.text(`${salesOrder.deliveryDate?.slice(0, 10)}`, 460, 110);
                // doc.rect(460, 62, 90, 15);
                doc.setFontSize(17);
                doc.setFont("bold");
                // doc.text("PO#:", 430, 95);
                //POO number
                doc.text(`${salesOrder.name}`, 460, 70);
                // doc.rect(460, 77, 90, 15);

                doc.setFontSize(22);
                // doc.setFont("times", "italic");
                doc.text("Company:", 40, 70);
                // doc.line(40, 68, 90, 68)
                doc.setFontSize(17);
                doc.text(`PBTI`, 138, 70);

                doc.setFontSize(12);
                doc.text("Address:", 40, 90);
                doc.setFontSize(9);
                doc.text(
                  "\nWebel Software, Ground Floor, \nDN Block, Sector V, \nWest Bengal 700091",
                  90,
                  80
                );

                doc.setFontSize(12);
                doc.text("Phone:", 40, 140);
                doc.setFontSize(9);
                doc.text("8282822924", 80, 140);
                doc.setFontSize(12);
                doc.text("Website:", 40, 160);
                doc.setFontSize(9);
                doc.text("www.paapri.com", 90, 160);
                // doc.text("Website:", 40, 200);
                doc.setDrawColor(255, 0, 0);
                doc.setFillColor(230, 230, 230);
                doc.rect(40, 175, 200, 20, "F");
                doc.setFontSize(12);
                doc.setTextColor(0, 0, 0);
                doc.text("Customer Name:", 45, 190);
                doc.setTextColor(0, 0, 0);
                // doc.text("Name & Address:", 43, 210);
                doc.text(`${res.data.document.name}`, 47, 220);

                // doc.setFontSize(9);
                // doc.text(`${salesOrder}`, 43, 220);
                // doc.text(`${salesOrder.bilingAddress}`, 43, 230);
                doc.setDrawColor(255, 0, 0);
                doc.setFillColor(230, 230, 230);
                doc.rect(355, 175, 200, 20, "F");
                doc.setFontSize(12);
                doc.setTextColor(0, 0, 0);
                doc.text("Ship To:", 360, 190);
                doc.setTextColor(0, 0, 0);
                // doc.text("Name & Address:", 358, 210);
                doc.setFontSize(9);
                doc.setTextColor(0, 0, 0);
                // doc.text(`${salesOrder.customerName}`, 400, 220);
                doc.text(`${salesOrder.shippingAddress}`, 358, 230);
                doc.setFontSize(30);
                doc.setFont("Sans-serif");
                doc.setTextColor(0, 0, 0);
                doc.text("Sales Order", 215, 40);
                let height = 200;

                // Restructure line items
                let array = new Array();
                salesOrder?.products.map(async (e) => {
                  let obj = new Object();

                  obj.name = e.name;
                  obj.description = e.description;
                  obj.quantity = e.quantity;
                  obj.delivered = e.delivered;
                  obj.invoiced = e.invoiced;
                  obj.unitPrice = e.unitPrice.toFixed(2);
                  obj.taxes = e.taxes + "%";
                  obj.subTotal = e.subTotal.toFixed(2);
                  array.push(obj);
                });
                console.log(salesOrder?.products);
                console.log(array);

                // Create the table of products data
                doc.autoTable({
                  margin: { top: 280 },
                  tableWidth: 200,
                  styles: {
                    lineColor: [153, 153, 153],
                    lineWidth: 1,
                    fillColor: [179, 179, 179],
                  },
                  columnStyles: {
                    europe: { halign: "center" },
                    0: { cellWidth: 88 },
                    1: { cellWidth: 75, halign: "center" },
                    2: { cellWidth: 50, halign: "center" },
                    3: { cellWidth: 57, halign: "left" },
                    4: { cellWidth: 60 },
                    5: { cellWidth: 60, halign: "right" },
                    6: { cellWidth: 57, halign: "center" },
                    7: { cellWidth: 67, halign: "right" },
                  }, // European countries centered
                  // body: salesOrder.products,
                  body: array,
                  columns: [
                    { header: "Product", dataKey: "name" },
                    { header: "Description", dataKey: "description" },
                    {
                      header: "Qty",
                      dataKey: "quantity",
                      halign: "center",
                      valign: "center",
                    },
                    { header: "Delivered", dataKey: "delivered" },
                    {
                      header: "Invoiced",
                      dataKey: "invoiced",
                      halign: "center",
                    },
                    {
                      header: "Unit Rate",
                      dataKey: "unitPrice",
                      halign: "center",
                    },
                    { header: "Taxes(%)", dataKey: "taxes", halign: "right" },
                    {
                      header: "Sub Total",
                      dataKey: "subTotal",
                      halign: "center",
                    },
                  ],
                  didDrawPage: (d) => (height = d.cursor.y), // calculate height of the autotable dynamically
                });

                let h = height + 30;

                doc.setTextColor(0, 0, 0);
                doc.setFontSize(10);
                // doc.text("CGST:", 460, h);
                // doc.text(
                //   `${parseFloat(salesOrder.estimation?.tax / 2)?.toFixed(2)}`,
                //   490,
                //   h
                // );
                doc.text("Tax:", 460, h + 27);
                doc.text(
                  `${parseFloat(salesOrder.estimation?.tax)?.toFixed(2)}`,
                  490,
                  h + 27
                );

                doc.line(460, h + 30, 530, h + 30);

                doc.setTextColor(0, 0, 0);
                doc.setFontSize(12);
                doc.text("Total:", 460, h + 45);
                doc.text(
                  `${salesOrder.estimation?.total.toFixed(2)}`,
                  490,
                  h + 45
                );
                const pageCount = doc.internal.getNumberOfPages();

                doc.text(`${pageCount}`, 300, 820);
                doc.save(`Sales Order - ${salesOrder.name}.pdf`);
              } else {
                console.log(
                  "Something went wrong while generating sales order pdf"
                );
              }
            }
          );
        } else {
          console.log("Something went wrong while generating sales order pdf");
        }
      })
      .catch((e) => {
        console.log(e);
      });
  },

  generateInvoicePdDF(id) {
    ApiService.setHeader();
    ApiService.get("invoice/getInvoiceForPdf/" + id)
      .then(async (res) => {
        if (res.data.isSuccess) {
          const inv = res.data.document;
          console.log(inv);

          var doc = new jsPDF("p", "pt", "a4");
          //header color
          doc.setDrawColor(0);
          doc.setFillColor(255, 255, 255);
          doc.rect(0, 0, 700, 40, "F");
          doc.setFontSize(12);
          doc.text("Date:", 430, 90);
          doc.text(`${inv.invoiceDate?.slice(0, 10)}`, 460, 90);
          // doc.text("Delivery Date:", 380, 110);
          // doc.text(`${salesOrder.deliveryDate?.slice(0, 10)}`, 460, 110);
          // doc.rect(460, 62, 90, 15);
          doc.setFontSize(13);
          doc.setFont("bold");
          // doc.text("PO#:", 430, 95);
          //POO number
          doc.text(`${inv.name}`, 400, 70);
          // doc.rect(460, 77, 90, 15);

          doc.setFontSize(22);
          // doc.setFont("times", "italic");
          doc.text("Company:", 40, 70);
          // doc.line(40, 68, 90, 68)
          doc.setFontSize(17);
          doc.text(`PBTI`, 138, 70);

          doc.setFontSize(12);
          doc.text("Address:", 40, 90);
          doc.setFontSize(9);
          doc.text(
            "\nWebel Software, Ground Floor, \nDN Block, Sector V, \nWest Bengal 700091",
            90,
            80
          );

          doc.setFontSize(12);
          doc.text("Phone:", 40, 140);
          doc.setFontSize(9);
          doc.text("8282822924", 80, 140);
          doc.setFontSize(12);
          doc.text("Website:", 40, 160);
          doc.setFontSize(9);
          doc.text("www.paapri.com", 90, 160);
          // doc.text("Website:", 40, 200);
          doc.setDrawColor(255, 0, 0);
          doc.setFillColor(230, 230, 230);
          doc.rect(40, 175, 200, 20, "F");
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.text("Customer Name:", 45, 190);
          doc.setTextColor(0, 0, 0);
          doc.text(`${inv.customer[0]?.name}`, 43, 210);
          doc.setFontSize(9);
          // doc.text(`${salesOrder.billingAddress}`, 43, 220);
          // doc.text(`${salesOrder.bilingAddress}`, 43, 230);
          // get customer details
          let addr;
          await ApiService.get("customer/" + inv.customer[0]._id).then((r) => {
            addr = r.data.document.address;
          });

          doc.setDrawColor(255, 0, 0);
          doc.setFillColor(230, 230, 230);
          doc.rect(355, 175, 200, 20, "F");
          doc.setFontSize(9);
          doc.setTextColor(0, 0, 0);
          doc.text("Ship To:", 360, 190);
          doc.setTextColor(0, 0, 0);
          doc.text(`${addr}`, 358, 210);
          doc.setFontSize(9);
          // doc.text(`${salesOrder.shippingAddress}`, 358, 220);
          doc.setFontSize(30);
          doc.setFont("Sans-serif");
          doc.setTextColor(0, 0, 0);
          doc.text("Invoice", 215, 40);
          let height = 200;

          // Restructure line items
          let array = new Array();
          console.log(res?.data?.newinvoiceLines);
          res?.data?.newinvoiceLines?.map(async (e) => {
            let obj = new Object();

            obj.productName = e.productName;
            obj.label = e.label;
            obj.quantity = e.quantity;
            obj.unitPrice = e.unitPrice.toFixed(2);
            obj.subTotal = e.subTotal.toFixed(2);
            array.push(obj);
          });

          // Create the table of items data
          doc.autoTable({
            margin: { top: 220 },
            styles: {
              lineColor: [153, 153, 153],
              lineWidth: 0.5,
              fillColor: [179, 179, 179],
            },
            columnStyles: {
              europe: { halign: "center" },
              0: { cellWidth: 88 },
              2: { cellWidth: 40 },
              3: { cellWidth: 57 },
              4: { cellWidth: 65 },
            }, // European countries centered
            // body: res.data.newinvoiceLines,
            body: array,
            columns: [
              { header: "Product", dataKey: "productName" },
              { header: "Label", dataKey: "label" },
              { header: "Qty", dataKey: "quantity" },
              { header: "UnitPrice", dataKey: "unitPrice" },
              { header: "Sub Total", dataKey: "subTotal" },
            ],
            didDrawPage: (d) => (height = d.cursor.y), // calculate height of the autotable dynamically
          });

          let h = height + 30;

          var formatter = new Intl.NumberFormat("en-in", {
            style: "currency",
            currency: "INR",
          });

          // var currencyFormatted = formatter.format(inv.estimation.total);
          // var currencyFormatted = formatter.format(inv.total);

          // doc.setTextColor(0, 0, 0);
          // doc.setFontSize(10);
          // doc.text(`Total: ${currencyFormatted}`, 380, h);

          doc.setTextColor(0, 0, 0);
          doc.setFontSize(12);
          doc.text("Tax Total:", 440, h + 35);
          doc.text(`${inv.totalTaxAmount?.toFixed(2)}`, 495, h + 35);
          doc.text("Total:", 460, h + 45);
          doc.text(`${inv.total.toFixed(2)}`, 495, h + 45);
          const pageCount = doc.internal.getNumberOfPages();

          doc.text(`${pageCount}`, 300, 820);
          doc.save(`INVOICE - ${inv.name}.pdf`);
        } else {
          console.log(
            "Something went wrong while generating purchase order pdf"
          );
        }
      })
      .catch((e) => {
        console.log(e);
      });
  },

  generateStandaloneInvoicePdDF(id) {
    ApiService.setHeader();
    // ApiService.get("invoice/" + id)
    ApiService.get("invoice/getInvoiceForPdf/" + id)
      .then((res) => {
        if (res.data.isSuccess) {
          const inv = res.data.document;
          const invLines = res.data.newinvoiceLines;
          console.log(res);
          ApiService.get(`customer/${inv.customer.id}`)
            .then((res) => {
              if (res.data.isSuccess) {
                console.log(res.data.document);
                var doc = new jsPDF("p", "pt", "a4");
                //header color
                doc.setDrawColor(0);
                doc.setFillColor(255, 255, 255);
                doc.rect(0, 0, 700, 40, "F");
                doc.setFontSize(12);
                doc.text("Date:", 430, 90);
                doc.text(`${inv.invoiceDate?.slice(0, 10)}`, 460, 90);
                // doc.text("Delivery Date:", 380, 110);
                // doc.text(`${salesOrder.deliveryDate?.slice(0, 10)}`, 460, 110);
                // doc.rect(460, 62, 90, 15);
                doc.setFontSize(13);
                doc.setFont("bold");
                // doc.text("PO#:", 430, 95);
                //POO number
                doc.text(`${inv.name}`, 400, 70);
                // doc.rect(460, 77, 90, 15);

                doc.setFontSize(22);
                // doc.setFont("times", "italic");
                doc.text("Company:", 40, 70);
                // doc.line(40, 68, 90, 68)
                doc.setFontSize(17);
                doc.text(`PBTI`, 138, 70);

                doc.setFontSize(12);
                doc.text("Address:", 40, 90);
                doc.setFontSize(9);
                doc.text(
                  "\nWebel Software, Ground Floor, \nDN Block, Sector V, \nWest Bengal 700091",
                  90,
                  80
                );

                doc.setFontSize(12);
                doc.text("Phone:", 40, 140);
                doc.setFontSize(9);
                // doc.text("8282822924", 80, 140);
                doc.text(`${res.data.document.phone}`, 80, 140);
                doc.setFontSize(12);
                doc.text("Website:", 40, 160);
                doc.setFontSize(9);
                doc.text("www.paapri.com", 90, 160);
                // doc.text("Website:", 40, 200);
                doc.setDrawColor(255, 0, 0);
                doc.setFillColor(230, 230, 230);
                doc.rect(40, 175, 200, 20, "F");
                doc.setFontSize(12);
                doc.setTextColor(0, 0, 0);
                doc.text("Customer Name:", 45, 190);
                doc.setFontSize(9);
                doc.setTextColor(0, 0, 0);
                doc.text(`${res.data.document.name}`, 43, 210);
                doc.setFontSize(9);
                // doc.text(`${salesOrder.billingAddress}`, 43, 220);
                // doc.text(`${salesOrder.bilingAddress}`, 43, 230);
                doc.setDrawColor(255, 0, 0);
                doc.setFillColor(230, 230, 230);
                doc.rect(355, 175, 200, 20, "F");
                doc.setFontSize(12);
                doc.setTextColor(0, 0, 0);
                doc.text("Ship To:", 360, 190);
                doc.setFontSize(9);
                doc.setTextColor(0, 0, 0);
                doc.text(`${res.data.document.address}`, 358, 210);
                doc.setFontSize(9);
                // doc.text(`${salesOrder.shippingAddress}`, 358, 220);
                doc.setFontSize(30);
                doc.setFont("Sans-serif");
                doc.setTextColor(0, 0, 0);
                doc.text("Invoice", 215, 40);
                let height = 200;

                // let itemObjects = new Array();
                // // console.log(inv.invoiceLines);
                // inv.invoiceLines.map(async (item) => {
                //   let newObject = new Object();
                //   let itemData = await ApiService.get(
                //     `product/${item.product}`
                //   );

                //   newObject.product = itemData.data.document.name;
                //   newObject.label = item.label;
                //   newObject.quantity = item.quantity;
                //   newObject.unitPrice = item.unitPrice;
                //   newObject.subTotal = item.subTotal;
                //   newObject.totalAfterTax =
                //     item.subTotal + (item.subTotal * item.taxes) / 100;

                //   // console.log(itemData.data.document.name);
                //   // console.log(newObject);
                //   itemObjects.push(newObject);
                // });

                // Create the table of items data
                doc.autoTable({
                  margin: { top: 220 },
                  styles: {
                    lineColor: [153, 153, 153],
                    lineWidth: 0.5,
                    fillColor: [179, 179, 179],
                  },
                  columnStyles: {
                    europe: { halign: "center" },
                    0: { cellWidth: 88 },
                    2: { cellWidth: 40 },
                    3: { cellWidth: 57 },
                    4: { cellWidth: 65 },
                  }, // European countries centered
                  body: invLines,
                  columns: [
                    { header: "Product", dataKey: "productName" },
                    { header: "Label", dataKey: "label" },
                    { header: "Qty", dataKey: "quantity" },
                    { header: "UnitPrice", dataKey: "unitPrice" },
                    { header: "Sub Total", dataKey: "subTotal" },
                  ],
                  didDrawPage: (d) => (height = d.cursor.y), // calculate height of the autotable dynamically
                });

                let h = height + 30;

                var formatter = new Intl.NumberFormat("en-in", {
                  style: "currency",
                  currency: "INR",
                });

                // var currencyFormatted = formatter.format(inv.estimation.total);
                // var currencyFormatted = formatter.format(inv.total);

                // doc.setTextColor(0, 0, 0);
                // doc.setFontSize(10);
                // doc.text(`Total: ${currencyFormatted}`, 380, h);

                doc.setTextColor(0, 0, 0);
                doc.setFontSize(12);
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(10);
                doc.text("CGST:", 460, h);
                doc.text(`${inv.estimation?.cgst.toFixed(2)}`, 490, h);
                doc.text("SGST:", 460, h + 10);
                doc.text(`${inv.estimation?.sgst.toFixed(2)}`, 490, h + 10);
                // doc.text("IGST:", 460, h + 20);
                // doc.text(`${inv.estimation?.igst}`, 490, h + 20);
                doc.line(460, h + 30, 490, h + 30);

                doc.setTextColor(0, 0, 0);
                doc.setFontSize(12);
                doc.text("Total:", 460, h + 45);
                doc.text(`${inv.estimation?.total.toFixed(2)}`, 490, h + 45);
                const pageCount = doc.internal.getNumberOfPages();

                doc.text(`${pageCount}`, 300, 820);
                doc.save(`INVOICE - ${inv.name}.pdf`);
              }
            })
            .catch((e) => {
              console.log(e);
            });
        } else {
          alert("Something went wrong while generating Invoice order pdf");
        }
      })
      .catch((e) => {
        console.log(e);
      });
  },

  generateDeliveryPDF(id) {
    ApiService.setHeader();
    ApiService.get("productDelivery/" + id).then((response) => {
      console.log(response);
      if (response.data.isSuccess) {
        const bill = response.data.document;
        ApiService.get("customer/" + bill.customer[0]._id).then((res) => {
          if (res.data.isSuccess) {
            let Products = new Array();
            var doc = new jsPDF("p", "pt", "a4");

            doc.setDrawColor(0);
            doc.setFillColor(255, 255, 255);
            doc.rect(0, 0, 700, 40, "F");
            doc.setFontSize(12);
            doc.text("Date:", 440, 110);
            doc.text(`${bill.effectiveDate?.slice(0, 10)}`, 470, 110);
            // doc.rect(460, 62, 90, 15);
            doc.setFontSize(17);
            doc.setFont("bold");

            doc.text(`${bill.name}`, 440, 70);
            // doc.rect(460, 77, 90, 15);

            doc.setFontSize(22);
            // doc.setFont("times", "italic");
            doc.text("Company:", 40, 70);
            // doc.line(40, 68, 90, 68)
            doc.setFontSize(17);
            doc.text(`PBTI`, 138, 70);

            doc.setFontSize(12);
            doc.text("Address:", 40, 90);
            doc.setFontSize(9);
            doc.text(
              "\nWebel Software, Ground Floor, \nDN Block, Sector V, \nWest Bengal 700091",
              90,
              80
            );

            doc.setFontSize(12);
            doc.text("Phone:", 40, 140);
            doc.setFontSize(9);
            doc.text("8282822924", 80, 140);
            doc.setFontSize(12);
            doc.text("Website:", 40, 160);
            doc.setFontSize(9);
            doc.text("www.paapri.com", 90, 160);

            doc.setDrawColor(255, 0, 0);
            doc.setFillColor(230, 230, 230);
            doc.rect(40, 175, 200, 20, "F");
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text("Bill To:", 45, 190);
            // doc.setTextColor(0, 0, 0);
            // doc.text("Name:", 43, 210);
            doc.setFontSize(9);
            doc.text(`${res.data.document.name}`, 43, 205);
            // doc.text(`${bill.vendor.address}`, 43, 220);
            // doc.setDrawColor(255, 0, 0);
            // doc.setFillColor(230, 230, 230);
            // doc.rect(355, 175, 200, 20, "F");
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            // doc.text("Source Document:", 360, 190);
            doc.text(`${bill.sourceDocument.name}`, 440, 90);

            // doc.setTextColor(0, 0, 0);
            // doc.text("Name & Address:", 358, 210);
            doc.setFontSize(30);
            doc.setFont("Sans-serif");
            doc.setTextColor(0, 0, 0);
            doc.text("Product Delivery", 230, 40);
            let height = 200;

            doc.autoTable({
              margin: { top: 280 },
              styles: {
                lineColor: [153, 153, 153],
                lineWidth: 0.5,
                fillColor: [179, 179, 179],
              },
              columnStyles: {
                europe: { halign: "center" },
                0: { cellWidth: 88 },
                1: { cellWidth: 250, halign: "center" },
                2: { cellWidth: 88, halign: "right" },
                3: { cellWidth: 88 },
                // 5: { cellWidth: 65, halign: "right" },
              },
              body: bill.operations,
              columns: [
                { header: "Product", dataKey: "name" },
                { header: "description", dataKey: "description" },
                {
                  header: "demandQuantity",
                  dataKey: "demandQuantity",
                  halign: "center",
                },
                {
                  header: "doneQuantity",
                  dataKey: "doneQuantity",
                  halign: "center",
                },
              ],
              didDrawPage: (d) => (height = d.cursor.y), // calculate height of the autotable dynamically
            });

            let h = height + 30;

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            const pageCount = doc.internal.getNumberOfPages();

            doc.text(`${pageCount}`, 300, 820);

            doc.save(`Product Delivery - ${bill.name}.pdf`);
          } else {
            alert("Something is wrong in geting customer!!!");
          }
        });
      }
    });
  },
};

const BarcodePDF = {
  generateDefaultPurchaseOrderBarcodePDF(qty, data, company, product) {
    // if (data?.barcode) {
    let size;
    var doc = new jsPDF("p", "pt", "a4");
    let c = 0;
    let y = 0;
    let height = 0;
    let requirePages;
    // const pageHeight = doc.internal.pageSize.height;
    var pages = qty / 14; // Calculate require pages
    console.log(pages);

    // Format require pages
    if (Number.isInteger(pages) == false) {
      requirePages = parseInt(pages) + 1;
    } else {
      requirePages = pages;
    }

    // Add pages in PDF
    for (var t = 0; t < requirePages - 1; t++) {
      doc.addPage();
    }

    console.log(company);

    // Set each page and print barcode in each pages of the PDF
    for (var k = 0; k < requirePages; k++) {
      doc.setPage(k);

      for (var i = 0; i <= 6; i++) {
        for (var j = 0; j <= 1; j++) {
          if (qty != c) {
            doc.rect(20 + j * 300, 20 + i * 110, 250, 100);
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text(`${company?.name}`, 90 + j * 300, 35 + i * 110);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            if (data?.size) {
              if (data.size >= 14 && data.size <= 16) {
                size = "";
              }
              switch (parseInt(data.size)) {
                case 18:
                  size = "18, Age: 1 to 2";
                  break;
                case 20:
                  size = "20, Age: 2 to 3";
                  break;
                case 22:
                  size = "22, Age: 3 to 4";
                  break;
                case 24:
                  size = "24, Age: 5 to 6";
                  break;
                case 26:
                  size = "26, Age: 7 to 8";
                  break;
                case 28:
                  size = "28, Age: 9 to 10";
                  break;
                case 30:
                  size = "30, Age: 11 to 12";
                  break;
                case 32:
                  size = "32, Age: 13 to 14";
                  break;
                case 34:
                  size = "34, Age: 15 to 16";
                  break;
                case 36:
                  size = "36, Age: 17 to 18";
                  break;
                case 38:
                  size = "38, Age: 19 to 20";
                  break;
                case 40:
                  size = "40, Age: 21 to 22";
                  break;
              }

              doc.text(
                `Size: ${data?.incomeAccount ? "" : size}`,
                95 + j * 300,
                50 + i * 110
              );
            }
            doc.text(
              `Price: Rs. ${
                data?.incomeAccount ? data?.salesPrice : data?.subTotal
              }`,
              95 + j * 300,
              65 + i * 110
            );
            doc.text(
              `MFG Date: ${product.mfgDate}`,
              95 + j * 300,
              80 + i * 110
            );

            doc.barcode(`${data?.barcode}`, {
              // barcodeValue: "123456789101",
              // barcodeText: "123456789101",
              format: "EAN13",
              displayValue: true,
              fontSize: 30,
              textColor: "#000000",
              x: 88 + j * 300,
              y: 110 + i * 110,
            });
            c += 1;
          }
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(1);
          const pageCount = doc.internal.getNumberOfPages();
          console.log(pageCount);

          doc.text(`${k}`, 300, 820);
        }
      }
    }

    doc.save(`Barcode-${new Date()}.pdf`);
    // } else {
    //   infoNotification("Item does not have a barcode");
    // }
  },
};

export { PurchaseOrderPDF, SalesOrderPDF, BarcodePDF };
