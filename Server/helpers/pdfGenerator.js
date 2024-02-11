// createInvoice.js
import fs from 'fs';
import PDFDocument from 'pdfkit';
import orderSchema from "../model/oederSchema.js";
import path from 'path';

async function createInvoice(orderDetails, path) {
  let doc = new PDFDocument({ margin: 50 });
  const orderProducts = await orderSchema
  .findById(orderDetails._id)
  .populate('products', '-photo')
  .populate('buyer', 'name address');
  generateHeader(doc, orderProducts);
  generateCustomerInformation(doc, orderProducts);
  generateInvoiceTable(doc, orderProducts)
  generateFooter(doc);


  doc.end();
  doc.pipe(fs.createWriteStream(path));
}

function generateHeader(doc, orderDetails) {
  const logoPath = './logo.jpg';
  doc.image(logoPath, 50, 45, { width: 50 })
    .fillColor('#444444')
    .fontSize(20)
    .text('A-rof Traders', 110, 57)
    .fontSize(10)
    .text('Pazhayanagdi', 200, 65, { align: 'right' })
    .text('Kannur, Kerala', 200, 80, { align: 'right' })
    .moveDown();
  
  // Customize the header based on orderDetails
  doc.fontSize(12).text(`Invoice for Order ID: ${orderDetails.orderID}`, 50, 150);
  // Add more header details as needed
}


function generateFooter(doc) {
  doc.fontSize(
    10,
  ).text(
    'Payment is due within 15 days. Thank you for your business.',
    50,
    780,
    { align: 'center', width: 500 },
  );
}
async function generateCustomerInformation(doc, orderProducts) {
  let invoice_no = 1;
  try {
    const invoiceDate = new Date();
    const formattedDate = invoiceDate.toLocaleDateString('en-US');
    
    doc.fillColor("#444444")
      .fontSize(20)
      .text("Invoice", 50, 150, { align: 'center' });

    generateHr(doc, 185);

    const customerInformationTop = 200;

    doc.fontSize(10)
      .text("Invoice Number:", 50, customerInformationTop)
      .font("Helvetica-Bold")
      .text(invoice_no, 150, customerInformationTop)
      .font("Helvetica")
      .text("Invoice Date:", 50, customerInformationTop + 15)
      .text(formattedDate, 150, customerInformationTop + 15)  // Corrected line
      .text(`Buyer:    ${orderProducts.buyer.name}`, 50, customerInformationTop + 30)  // Moved to a new line
      .text(`Buyer:    ${orderProducts.buyer.address.city}`, 50, customerInformationTop + 36)  // Moved to a new line
      .text(`Bill Amount:   ${orderProducts.payment.originalAmount}`, 50, customerInformationTop + 45);  // Moved to a new line

  } catch (error) {
    console.error(error);
    // Handle the error appropriately, e.g., send an error response
  }
}


function generateTableRow(
  doc,
  y,
  item,
  unitCost,
  quantity,
  lineTotal
) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(unitCost, 280, y, { width: 90, align: "right" })
    .text(quantity, 370, y, { width: 90, align: "right" })
    .text(lineTotal, 0, y, { align: "right" });
}


function generateInvoiceTable(doc, orderProducts) {
  console.log('table,',orderProducts);

  const invoiceTableTop = 330;
  
  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    invoiceTableTop,
    "Item",
    "Unit Cost",
    "Quantity",
    " Total"
  );
  const shippingPosition = invoiceTableTop + (orderProducts.products.length + 1) * 30;
  generateTableRow(
    doc,
    shippingPosition,
    "Shipping Charge",
    "",
    "",
    70
  );
  const subtotalPosition = shippingPosition + 30;
  generateTableRow(
    doc,
    subtotalPosition,
    "",  // Empty string for the item name
    "",  // Empty string for the unit cost
    "Subtotal",
    orderProducts.payment.originalAmount
  );
  
  generateHr(doc, invoiceTableTop + 20);
  doc.font("Helvetica");

  orderProducts.products.forEach((item, index) => {
    const position = invoiceTableTop + (index + 1) * 30;
  
    // Customize the function to extract the necessary data from your item object
    const itemName = item.name;
    const itemUnitPrice = item.price;
    const itemQuantity = item.quantity;
    const itemTotal = item.price * item.quantity;
  
    generateTableRow(
      doc,
      position,
      itemName,
      itemUnitPrice,
      itemQuantity,
      itemTotal
    );
    generateHr(doc, position + 20);

  });
}  

function generateHr(doc, y) {
  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
}



export default createInvoice;
