export type InvoiceItem = {
  description: string;
  quantity: number;
  unit_price: number;
};

export type Profile = {
  id: string;
  full_name: string | null;
  company_name: string | null;
  company_email: string | null;
  company_phone: string | null;
  company_address: string | null;
  role: string | null;
  plan: string | null;
  logo_url: string | null;
  created_at: string;
};

export type Invoice = {
  id: string;
  user_id: string;
  invoice_number: string;
  company_name: string;
  company_email: string;
  client_name: string;
  client_email: string;
  issue_date: string;
  due_date: string;
  status: string;
  currency: string;
  notes: string | null;
  subtotal: number;
  tax: number;
  total: number;
  public_token: string;
  items: InvoiceItem[];
  created_at: string;
};