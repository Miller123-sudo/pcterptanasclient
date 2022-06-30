import ApiService from "./ApiServices";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "jspdf-barcode";
import { infoNotification } from "./Utils";

// 1. Purchase Order, Product Receipt, Bill, Bill Payment
const PurchaseOrderPDF = {
  // Generate RTGS PDF
  generateRTGS(data) {
    var doc = new jsPDF("p", "pt", "a4");

    // Format data for PDF
    let array = new Array();
    console.log(data);
    data?.map((e) => {
      let obj = new Object();
      obj.name = e.anything.vendorArray[0].name;
      // obj.date = new Date(e.billDate).toLocaleDateString();
      obj.accountno = String(e.bankAccount[0].name).split(" ")[0];
      obj.total = e.amount;
      // obj.paymentStatus = e.paymentStatus;

      array.push(obj);
    });

    doc.setFontSize(35);
    doc.setTextColor("#3498DB");
    doc.setFont("sans-serif", "bold");
    doc.text("TANAS CREATION LLP", 50, 60);
    doc.setFont("sans-serif", "bold");
    doc.setFontSize(15);
    doc.setTextColor("#A52A2A");
    doc.text("Wholesale & Retail Cloth & General Merchants", 80, 90);

    doc.setFontSize(10);
    doc.setFont("sans-serif", "normal");
    doc.text("Phone:", 450, 40);
    doc.text("03192-230419", 480, 40);

    doc.setFontSize(10);
    doc.setFont("sans-serif", "bold");
    doc.setTextColor("#2471A3");
    doc.text("ABERDEEN BAZAAR, PORT BLAIR- 744101, ANADAMANS", 70, 120);
    doc.setLineWidth(0.5); // line width
    doc.setDrawColor("#EC7063"); // draw red lines
    doc.line(0, 125, 700, 125);
    doc.setFont("italic");
    doc.text("Ref No.", 50, 140);
    doc.text(`Date- ${new Date().toLocaleDateString()}`, 450, 140);

    doc.setFont("sans-serif", "normal");
    doc.setTextColor("black");
    doc.setFontSize(10);
    doc.text("To,", 50, 160);
    doc.text("The Manager", 60, 180);
    doc.text("Axis Bank", 60, 200);
    doc.text("Port Blair", 60, 220);

    doc.setFontSize(10);
    doc.setFont("sans-serif", "bold");
    doc.text("Sub:", 150, 240);
    doc.setFont("sans-serif", "bold");
    doc.text("Request for RTGS in the following name given below", 170, 240);
    doc.setDrawColor("#000000"); // draw red lines
    doc.line(170, 245, 400, 245);
    doc.setTextColor("black");
    doc.setFontSize(10);
    doc.setFont("sans-serif", "normal");
    doc.text("Dear Sir,", 50, 260);
    doc.text(
      "We at TANAS Creation LLP having a Current A/c No: 919020051359611. We would like you to kindly make\nRTGS payment against yourself for RTGS cheque no- 210839 issued to you in the following names given below.",
      80,
      280
    );

    let height = 200;
    console.log(array);

    doc.autoTable({
      margin: { top: 320 },
      styles: {
        lineColor: [0, 0, 0],
        textColor: [0, 0, 0],
        fontStyle: ["sans-serif", "normal"],
        lineWidth: 1,
        fillColor: [255, 255, 255],
      },
      columnStyles: {
        europe: { halign: "center" },
        0: { cellWidth: 95 },
        2: { cellWidth: 100, halign: "right" },
        3: { cellWidth: 80, halign: "right" },
        4: { cellWidth: 80 },
      },
      body: array,
      columns: [
        { header: "Name", dataKey: "name" },
        { header: "Account No.", dataKey: "accountno" },
        { header: "Bank Name", dataKey: `` },
        { header: "Total", dataKey: `total` },
        // { header: "Bank Name", dataKey: "branch" },
        { header: "Branch", dataKey: "branch" },
        { header: "IFS Code", dataKey: "ifsc" },
      ],
      didDrawPage: (d) => (height = d.cursor.y), // calculate height of the autotable dynamically
    });

    let h = height + 30;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text("Kindly do the needful", 50, h);
    doc.text("Yours faithfyully", 450, h);
    doc.text("Thanking you", 50, h + 30);
    doc.text("Tanas Creation LLP", 450, h + 30);

    // doc.text("Yours faithfyully", 450, 500);
    // doc.text("Thank you", 50, 530);
    // doc.text("Tanas creation", 450, 530);

    const pageCount = doc.internal.getNumberOfPages();

    doc.text(`${pageCount}`, 300, 820);

    doc.save(`RTGS.pdf`);
  },

  generateSingleRTGS(data) {
    var doc = new jsPDF("p", "pt", "a4");

    // // Format data for PDF
    // let array = new Array();
    // console.log(data);
    // data?.map((e) => {
    //   let obj = new Object();
    //   obj.name = e.anything.vendorArray[0].name;
    //   // obj.date = new Date(e.billDate).toLocaleDateString();
    //   obj.accountno = String(e.bankAccount[0].name).split(" ")[0];
    //   obj.total = e.amount;
    //   // obj.paymentStatus = e.paymentStatus;

    //   array.push(obj);
    // });

    doc.setFontSize(35);
    doc.setTextColor("#3498DB");
    doc.setFont("sans-serif", "bold");
    doc.text("TANAS CREATION LLP", 50, 60);
    doc.setFont("sans-serif", "bold");
    doc.setFontSize(15);
    doc.setTextColor("#A52A2A");
    doc.text("Wholesale & Retail Cloth & General Merchants", 80, 90);

    doc.setFontSize(10);
    doc.setFont("sans-serif", "normal");
    doc.text("Phone:", 450, 40);
    doc.text("03192-230419", 480, 40);

    doc.setFontSize(10);
    doc.setFont("sans-serif", "bold");
    doc.setTextColor("#2471A3");
    doc.text("ABERDEEN BAZAAR, PORT BLAIR- 744101, ANADAMANS", 70, 120);
    doc.setLineWidth(0.5); // line width
    doc.setDrawColor("#EC7063"); // draw red lines
    doc.line(0, 125, 700, 125);
    doc.setFont("italic");
    doc.text("Ref No.", 50, 140);
    doc.text(`Date- ${new Date().toLocaleDateString()}`, 450, 140);

    doc.setFont("sans-serif", "normal");
    doc.setTextColor("black");
    doc.setFontSize(10);
    doc.text("To,", 50, 160);
    doc.text("The Manager", 60, 180);
    doc.text("Axis Bank", 60, 200);
    doc.text("Port Blair", 60, 220);

    doc.setFontSize(10);
    doc.setFont("sans-serif", "bold");
    doc.text("Sub:", 150, 240);
    doc.setFont("sans-serif", "bold");
    doc.text("Request for RTGS in the following name given below", 170, 240);
    doc.setDrawColor("#000000"); // draw red lines
    doc.line(170, 245, 400, 245);
    doc.setTextColor("black");
    doc.setFontSize(10);
    doc.setFont("sans-serif", "normal");
    doc.text("Dear Sir,", 50, 260);
    doc.text(
      "We at TANAS Creation LLP having a Current A/c No: 919020051359611. We would like you to kindly make\nRTGS payment against yourself for RTGS cheque no- 210839 issued to you in the following names given below.",
      80,
      280
    );

    let height = 200;

    doc.autoTable({
      margin: { top: 320 },
      styles: {
        lineColor: [0, 0, 0],
        textColor: [0, 0, 0],
        fontStyle: ["sans-serif", "normal"],
        lineWidth: 1,
        fillColor: [255, 255, 255],
      },
      columnStyles: {
        europe: { halign: "center" },
        0: { cellWidth: 95 },
        2: { cellWidth: 100, halign: "right" },
        3: { cellWidth: 80, halign: "right" },
        4: { cellWidth: 80 },
      },
      body: data,
      columns: [
        { header: "Name", dataKey: "name" },
        { header: "Account No.", dataKey: "accountno" },
        { header: "Bank Name", dataKey: `` },
        { header: "Total", dataKey: `total` },
        // { header: "Bank Name", dataKey: "branch" },
        { header: "Branch", dataKey: "branch" },
        { header: "IFS Code", dataKey: "ifsc" },
      ],
      didDrawPage: (d) => (height = d.cursor.y), // calculate height of the autotable dynamically
    });

    let h = height + 30;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text("Kindly do the needful", 50, h);
    doc.text("Yours faithfyully", 450, h);
    doc.text("Thanking you", 50, h + 30);
    doc.text("Tanas Creation LLP", 450, h + 30);

    // doc.text("Yours faithfyully", 450, 500);
    // doc.text("Thank you", 50, 530);
    // doc.text("Tanas creation", 450, 530);

    const pageCount = doc.internal.getNumberOfPages();

    doc.text(`${pageCount}`, 300, 820);

    doc.save(`RTGS.pdf`);
  },

  // Generate cheque PDF
  generateCheque(payee, pay, amountInWord, amount) {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [200.66, 91.44], // Standard cheque size 7.9 inch width & 3.6 inch height (here uses in mm);
    });

    console.log(new Date().toLocaleDateString().split("/"));
    let a, b, c, d, e, f, g, h;
    e = new Date().toLocaleDateString().split("/")[2].charAt(0);
    f = new Date().toLocaleDateString().split("/")[2].charAt(1);
    g = new Date().toLocaleDateString().split("/")[2].charAt(2);
    h = new Date().toLocaleDateString().split("/")[2].charAt(3);
    if (new Date().toLocaleDateString().split("/")[1].length < 2) {
      a = 0;
      b = new Date().toLocaleDateString().split("/")[1];
    } else {
      a = new Date().toLocaleDateString().split("/")[1].slice(0, 1);
      b = new Date().toLocaleDateString().split("/")[1].slice(1);
    }

    if (new Date().toLocaleDateString().split("/")[0].length < 2) {
      c = 0;
      d = new Date().toLocaleDateString().split("/")[0];
    } else {
      c = new Date().toLocaleDateString().split("/")[0].slice(0, 1);
      d = new Date().toLocaleDateString().split("/")[0].slice(1);
    }
    console.log(`${a},${b},${c},${d}`);

    var pageWidth = 200.66;
    var pageHeight = 91.44;

    var unitHeight = pageHeight / 10;
    doc.setDrawColor(102, 102, 102);

    /** Header */
    // doc.setDrawColor(0);
    doc.setFillColor(242, 242, 242);
    doc.rect(0, 0, pageWidth, unitHeight * 2, "F");

    /**Bank Primary details */
    doc.text("BANK NAME", 10, 7.5);
    doc.setFontSize(8);
    doc.text("Bank Address", 10, 11);
    doc.text("Bank IFSC code", 10, 14);

    /**Type of Cheque */
    doc.line(
      pageWidth / 2 - pageWidth / 15,
      7.5,
      pageWidth - pageWidth / 2 + pageWidth / 15,
      7.5
    );
    doc.line(
      pageWidth / 2 - pageWidth / 15,
      7.5 + unitHeight * 0.5,
      pageWidth - pageWidth / 2 + pageWidth / 15,
      7.5 + unitHeight * 0.5
    );
    doc.text(`${payee}`, 5 + pageWidth / 2 - pageWidth / 15, 11);

    /**Date */
    doc.setFontSize(6);
    doc.text(
      "VALID FOR THREE MONTHS FROM THE DATE OF ISSUE",
      pageWidth - 10,
      6.5,
      "right"
    );

    doc.setFontSize(8);
    doc.text("DATE", (pageWidth / 4) * 3 - 20, 7.5 + unitHeight * 0.4);
    doc.rect((pageWidth / 4) * 3 - 10, 7.5, pageWidth / 4, unitHeight * 0.5);

    doc.setFontSize(6);
    doc.line(
      (pageWidth / 4) * 3 + (pageWidth / 4 / 8) * 1 - 10,
      7.5,
      (pageWidth / 4) * 3 + (pageWidth / 4 / 8) * 1 - 10,
      7.5 + unitHeight * 0.5
    );
    doc.text(
      "D",
      (pageWidth / 4) * 3 + (pageWidth / 4 / 8) * 1 - 14,
      7.5 + unitHeight * 0.8
    );
    doc.line(
      (pageWidth / 4) * 3 + (pageWidth / 4 / 8) * 2 - 10,
      7.5,
      (pageWidth / 4) * 3 + (pageWidth / 4 / 8) * 2 - 10,
      7.5 + unitHeight * 0.5
    );
    doc.text(
      "D",
      (pageWidth / 4) * 3 + (pageWidth / 4 / 8) * 2 - 14,
      7.5 + unitHeight * 0.8
    );
    doc.line(
      (pageWidth / 4) * 3 + (pageWidth / 4 / 8) * 3 - 10,
      7.5,
      (pageWidth / 4) * 3 + (pageWidth / 4 / 8) * 3 - 10,
      7.5 + unitHeight * 0.5
    );
    doc.text(
      "M",
      (pageWidth / 4) * 3 + (pageWidth / 4 / 8) * 3 - 14,
      7.5 + unitHeight * 0.8
    );
    doc.line(
      (pageWidth / 4) * 3 + (pageWidth / 4 / 8) * 4 - 10,
      7.5,
      (pageWidth / 4) * 3 + (pageWidth / 4 / 8) * 4 - 10,
      7.5 + unitHeight * 0.5
    );
    doc.text(
      "M",
      (pageWidth / 4) * 3 + (pageWidth / 4 / 8) * 4 - 14,
      7.5 + unitHeight * 0.8
    );
    doc.line(
      (pageWidth / 4) * 3 + (pageWidth / 4 / 8) * 5 - 10,
      7.5,
      (pageWidth / 4) * 3 + (pageWidth / 4 / 8) * 5 - 10,
      7.5 + unitHeight * 0.5
    );
    doc.text(
      "Y",
      (pageWidth / 4) * 3 + (pageWidth / 4 / 8) * 5 - 14,
      7.5 + unitHeight * 0.8
    );
    doc.line(
      (pageWidth / 4) * 3 + (pageWidth / 4 / 8) * 6 - 10,
      7.5,
      (pageWidth / 4) * 3 + (pageWidth / 4 / 8) * 6 - 10,
      7.5 + unitHeight * 0.5
    );
    doc.text(
      "Y",
      (pageWidth / 4) * 3 + (pageWidth / 4 / 8) * 6 - 14,
      7.5 + unitHeight * 0.8
    );
    doc.line(
      (pageWidth / 4) * 3 + (pageWidth / 4 / 8) * 7 - 10,
      7.5,
      (pageWidth / 4) * 3 + (pageWidth / 4 / 8) * 7 - 10,
      7.5 + unitHeight * 0.5
    );
    doc.text(
      "Y",
      (pageWidth / 4) * 3 + (pageWidth / 4 / 8) * 7 - 14,
      7.5 + unitHeight * 0.8
    );
    doc.line(
      (pageWidth / 4) * 3 + (pageWidth / 4 / 8) * 8 - 10,
      7.5,
      (pageWidth / 4) * 3 + (pageWidth / 4 / 8) * 8 - 10,
      7.5 + unitHeight * 0.5
    );
    doc.text(
      "Y",
      (pageWidth / 4) * 3 + (pageWidth / 4 / 8) * 8 - 14,
      7.5 + unitHeight * 0.8
    );

    //Setting date value
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(
      `${a}`,
      (pageWidth / 4) * 3 + (pageWidth / 4 / 8) * 1 - 14,
      7.5 + unitHeight * 0.4
    );
    doc.text(
      `${b}`,
      (pageWidth / 4) * 3 + (pageWidth / 4 / 8) * 2 - 14,
      7.5 + unitHeight * 0.4
    );
    doc.text(
      `${c}`,
      (pageWidth / 4) * 3 + (pageWidth / 4 / 8) * 3 - 14,
      7.5 + unitHeight * 0.4
    );
    doc.text(
      `${d}`,
      (pageWidth / 4) * 3 + (pageWidth / 4 / 8) * 4 - 14,
      7.5 + unitHeight * 0.4
    );
    doc.text(
      `${e}`,
      (pageWidth / 4) * 3 + (pageWidth / 4 / 8) * 5 - 14,
      7.5 + unitHeight * 0.4
    );
    doc.text(
      `${f}`,
      (pageWidth / 4) * 3 + (pageWidth / 4 / 8) * 6 - 14,
      7.5 + unitHeight * 0.4
    );
    doc.text(
      `${g}`,
      (pageWidth / 4) * 3 + (pageWidth / 4 / 8) * 7 - 14,
      7.5 + unitHeight * 0.4
    );
    doc.text(
      `${h}`,
      (pageWidth / 4) * 3 + (pageWidth / 4 / 8) * 8 - 14,
      7.5 + unitHeight * 0.4
    );
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");

    /** Lines Parts */
    doc.setLineWidth(0.25);
    doc.text("Pay", 10, unitHeight * 3 - 2);

    //Setting payee name
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`${pay}`, 20, unitHeight * 3 - 2);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");

    doc.line(10, unitHeight * 3, pageWidth - 10, unitHeight * 3);
    doc.text("OR ORDER", pageWidth - 25, unitHeight * 3 - 2);

    doc.text("Rupees", 10, unitHeight * 4 - 2);

    //Setting paying amount in words
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`${amountInWord}`, 25, unitHeight * 4 - 2);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");

    doc.line(10, unitHeight * 4, pageWidth - 10, unitHeight * 4);
    doc.text("RS.", (pageWidth / 4) * 3 - 7, unitHeight * 5 - 3);

    //Setting paying amount in numbers
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`${amount}/-`, (pageWidth / 4) * 3 + 5, unitHeight * 5 - 3);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");

    doc.line(
      (pageWidth / 4) * 3 - 10,
      unitHeight * 4,
      (pageWidth / 4) * 3 - 10,
      unitHeight * 5
    );
    doc.line(
      (pageWidth / 4) * 3,
      unitHeight * 4,
      (pageWidth / 4) * 3,
      unitHeight * 5
    );
    doc.line(pageWidth - 10, unitHeight * 4, pageWidth - 10, unitHeight * 5);
    doc.line(10, unitHeight * 5, pageWidth - 10, unitHeight * 5);

    /**Account No box */
    doc.text("A/C NO.", 15, unitHeight * 6 - 2);
    doc.rect(10, unitHeight * 5.25, pageWidth / 3, unitHeight * 0.75);

    //Setting A/c number
    doc.text("919020051359611", 40, unitHeight * 6 - 2);
    doc.line(
      10 + pageWidth / 9,
      unitHeight * 5.25,
      10 + pageWidth / 9,
      unitHeight * 6
    ); //vertical line

    /**Company */
    //Setting Company
    doc.text(
      "For TANAS CREATION LLP",
      pageWidth - 10,
      unitHeight * 5.5,
      "right"
    );

    /**Signature */
    doc.text(
      "Authorised Signatory(ies)",
      pageWidth - 10,
      unitHeight * 8 - 5,
      "right"
    );
    doc.setFontSize(6);
    doc.text("Please sign above", pageWidth - 10, unitHeight * 8 - 2, "right");

    /**Instruction */
    var txtWidth = doc.getTextWidth(
      "Payable at par at all branches of Bank Name in India."
    );
    doc.text(
      "Payable at par at all branches of Bank Name in India.",
      pageWidth / 2 - txtWidth / 2,
      unitHeight * 8 - 2
    );

    /**Other box */
    doc.setFillColor(179, 179, 179);
    doc.rect(10, unitHeight * 6.5, pageWidth / 4, unitHeight, "F");

    /** Footer */
    doc.setFillColor(242, 242, 242);
    doc.rect(0, pageHeight - unitHeight * 2, pageWidth, unitHeight * 2, "F");
    doc.setFontSize(10);
    doc.setFont("courier", "bold");
    var txtWidth2 = doc.getTextWidth('||" 210402 ||" 744211002|: 157460||" 29');
    doc.text(
      '||" 210402 ||" 744211002|: 157460||" 29',
      pageWidth / 2 - txtWidth2 / 2,
      unitHeight * 9
    );

    // console.log(converter.toWords(20000));

    /**Saving document */
    doc.save(`Cheque.pdf`);
  },

  // Generate acknoledgement
  generateAcknowledgment(data) {
    var doc = new jsPDF("p", "pt", "a4");

    // Format data for PDF
    let array = new Array();
    let total = 0;
    console.log(data);
    data?.map((e) => {
      let obj = new Object();
      obj.billno = e.name;
      obj.billdate = e.billDate
        ? new Date(e.billDate).toLocaleDateString()
        : new Date(e.paymentDate).toLocaleDateString();
      obj.billamount = e.estimation?.total ? e.estimation.total : e.amount;

      total += e.estimation?.total ? e.estimation.total : e.amount;
      array.push(obj);
    });

    doc.setFontSize(35);
    doc.setTextColor("#3498DB");
    doc.setFont("sans-serif", "bold");
    doc.text("TANAS CREATION LLP", 50, 60);
    doc.setFont("sans-serif", "bold");
    doc.setFontSize(15);
    doc.setTextColor("#A52A2A");
    doc.text("Wholesale & Retail Cloth & General Merchants", 50, 90);
    doc.setFontSize(10);
    doc.setFont("sans-serif", "normal");
    doc.setTextColor("#000000");
    doc.text("Off: 230419, 231184", 480, 55);
    doc.setDrawColor("#7FB3D5"); // draw blue lines
    doc.line(0, 110, 700, 110);
    doc.line(0, 113, 700, 113);
    doc.setFont("sans-serif", "bold");
    doc.text("ABERDEEN BAZAAR,   PORT BLAIR- 744101,    ANADAMANS", 50, 125);
    doc.setFont("italic");
    doc.text("Ref No.", 50, 150);
    doc.text(`Date- ${new Date().toLocaleDateString()}`, 450, 150);
    doc.setFont("sans-serif", "normal");
    doc.setTextColor("black");
    doc.setFontSize(10);
    doc.text("To,", 50, 170);
    doc.text("M/s", 60, 190);
    doc.setDrawColor("#000000"); // draw black lines
    doc.setLineWidth(0.2);
    doc.line(75, 195, 520, 195);
    doc.line(75, 230, 520, 230);
    doc.line(75, 265, 520, 265);
    doc.setFont("sans-serif", "bold");
    doc.text("Dear Sir,", 50, 290);
    doc.setFont("sans-serif", "normal");
    doc.setTextColor("black");
    doc.text(
      "We have a pleasure to inform you that today we are enclosing herewith one D.D/Cheque No.",
      50,
      310
    );
    var txtWidth = doc.getTextWidth(
      "We have a pleasure to inform you that today we are enclosing herewith one D.D/Cheque No."
    );
    doc.line(50 + txtWidth, 312, 520, 312);
    doc.text(`Dt. ${new Date().toLocaleDateString()}`, 50, 330);
    doc.line(60, 332, 150, 332);
    doc.text(`for Rs. ${total}`, 150, 330);
    var txtWidth1 = doc.getTextWidth("for Rs.");
    doc.line(160 + txtWidth1, 332, 350, 332);
    doc.text("Rupees", 350, 330);
    var textWidht2 = doc.getTextWidth("Rupees");
    doc.line(360 + textWidht2, 332, 520, 332);
    doc.line(50, 365, 510, 365);
    doc.text("only", 510, 365);
    doc.text("drawn on S.B.I/ Axis Bank", 50, 385);
    var txtWidth3 = doc.getTextWidth("drawn on S.B.I/ Axis Bank");
    doc.line(50 + txtWidth3, 387, 370, 387);
    doc.text("branch against PART / FULL payment", 372, 387);
    doc.text("of your bills as per  following details", 50, 405);

    let height = 200;

    var data = [
      {
        billno: "1",
        billdate: "1",
        billamount: "1",
        discount: "1",
        permtr: "1",
      },
      {
        billno: "1",
        billdate: "1",
        billamount: "1",
        discount: "1",
        permtr: "1",
      },
      {
        billno: "1",
        billdate: "1",
        billamount: "1",
        discount: "1",
        permtr: "1",
      },
      {
        billno: "1",
        billdate: "1",
        billamount: "1",
        discount: "1",
        permtr: "1",
      },
      {
        billno: "1",
        billdate: "1",
        billamount: "1",
        discount: "1",
        permtr: "1",
      },
      {
        billno: "1",
        billdate: "1",
        billamount: "1",
        discount: "1",
        permtr: "1",
      },
      {
        billno: "1",
        billdate: "1",
        billamount: "1",
        discount: "1",
        permtr: "1",
      },
      {
        billno: "1",
        billdate: "1",
        billamount: "1",
        discount: "1",
        permtr: "1",
      },
      {
        billno: "1",
        billdate: "1",
        billamount: "1",
        discount: "1",
        permtr: "1",
      },
      {
        billno: "1",
        billdate: "1",
        billamount: "1",
        discount: "1",
        permtr: "1",
      },
      {
        billno: "1",
        billdate: "1",
        billamount: "1",
        discount: "1",
        permtr: "1",
      },
      {
        billno: "1",
        billdate: "1",
        billamount: "1",
        discount: "1",
        permtr: "1",
      },
      {
        billno: "1",
        billdate: "1",
        billamount: "1",
        discount: "1",
        permtr: "1",
      },
      {
        billno: "1",
        billdate: "1",
        billamount: "1",
        discount: "1",
        permtr: "1",
      },
      {
        billno: "1",
        billdate: "1",
        billamount: "1",
        discount: "1",
        permtr: "1",
      },
      {
        billno: "1",
        billdate: "1",
        billamount: "1",
        discount: "1",
        permtr: "1",
      },
      {
        billno: "1",
        billdate: "1",
        billamount: "1",
        discount: "1",
        permtr: "1",
      },
      {
        billno: "1",
        billdate: "1",
        billamount: "1",
        discount: "1",
        permtr: "1",
      },
    ];
    doc.autoTable({
      margin: { top: 420 },
      styles: {
        lineColor: [0, 0, 0],
        textColor: [0, 0, 0],
        fontStyle: ["sans-serif", "normal"],
        lineWidth: 1,
        fillColor: [255, 255, 255],
      },
      columnStyles: {
        europe: { halign: "center" },
        0: { cellWidth: 130 },
        2: { cellWidth: 80, halign: "right" },
        3: { cellWidth: 80, halign: "right" },
        4: { cellWidth: 80 },
      },
      body: array,
      columns: [
        { header: "Bill No.", dataKey: "billno" },
        { header: "Bill Date", dataKey: "billdate" },
        { header: "Amount", dataKey: "billamount" },
        // { header: "Discount less", dataKey: "discount" },
        // { header: "Per mtr", dataKey: "permtr" },
        // { header: "Bill No.", dataKey: "" },
        // { header: "Bill Dt.", dataKey: "" },
        // { header: "Bill Amount", dataKey: "." },
        // { header: "Discount less", dataKey: "" },
        // { header: "Per Mtr", dataKey: "" },
      ],
      didDrawPage: (d) => (height = d.cursor.y), // calculate height of the autotable dynamically
    });

    let h = height + 30;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("sans-serif", "bold");
    doc.text("Kindly acknowledge the receipt", 50, h);
    doc.text("Yours faithfully", 450, h);
    doc.text("Thanking You,", 50, h + 30);

    const pageCount = doc.internal.getNumberOfPages();

    doc.text(`${pageCount}`, 300, 820);

    doc.save(`ACk.pdf`);
  },

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
  generateDefaultPurchaseOrderBarcodePDF(
    qty,
    data,
    company,
    product,
    stickerType
  ) {
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

              if (stickerType == 1) {
                doc.text(`Size: ${size}`, 95 + j * 300, 50 + i * 110);
              }
            }
            doc.text(
              `Price: Rs. ${
                data?.incomeAccount ? data?.salesPrice : data?.subTotal
              }`,
              95 + j * 300,
              65 + i * 110
            );
            if (stickerType == 1) {
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
            } else {
              doc.text(
                `Barcode: ${data?.barcode}`,
                88 + j * 300,
                110 + i * 110
              );
            }
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
