export type Lang = "en";

export const defaultLang: Lang = "en";

const translations = {
  en: {
    common: {
      dashboard: "Dashboard",
      invoices: "Invoices",
      clients: "Clients",
      reports: "Reports",
      settings: "Settings",
      pricing: "Pricing",
      login: "Login",
      signup: "Sign up",
      logout: "Logout",
      createInvoice: "Create invoice",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      send: "Send",
      paid: "Paid",
      pending: "Pending",
    },
    invoice: {
      new: "New Invoice",
      edit: "Edit Invoice",
      clientName: "Client name",
      clientEmail: "Client email",
      issueDate: "Issue date",
      dueDate: "Due date",
      currency: "Currency",
      subtotal: "Subtotal",
      total: "Total",
      addItem: "Add item",
      description: "Description",
      quantity: "Quantity",
      price: "Unit price",
    },
    settings: {
      title: "Company settings",
      logo: "Company logo",
      upload: "Upload logo",
      delete: "Delete logo",
      companyName: "Company name",
      email: "Email",
      phone: "Phone",
      address: "Address",
    },
  },
};

export function getTranslation(lang: Lang) {
  return translations[lang];
}