const invoiceConfig = {
  title: "Invoice",
  localStorageKey: "invoices",
  numberPrefix: "FS/26-27/",
  currency: "₹",
  companyDetails: {
    name: "Futentia Solutions Private Limited",
    address: "03, Pratham Meadows, Nr. Navarachana Int. School, Bhayli, Vadodara, Gujarat - 391410.",
    email: "info@futentia.com",
    phone: "+91 8866778903",
    website: "www.futentia.com",
    gstin: "24AAGCF9740H1ZI",
  },
  fields: [
    "invoiceNumber",
    "name",
    "address",
    "phone",
    "gstin",
    "createdDate",
    "dueDate",
    "email",
    "description",
    "rate"
  ]
};

export default invoiceConfig;
