"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

type Lang = "es" | "en";

type InvoiceItemRow = {
  rowId: string;
  itemId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  removed: boolean;
};

type EditInvoiceScreenProps = {
  invoice: {
    id: string;
    client_name: string;
    client_email: string;
    issue_date: string;
    due_date: string;
    notes: string;
    currency: string;
    status: string;
    invoice_number: string;
    items: Array<{
      id: string;
      description: string;
      quantity: number;
      unit_price: number;
    }>;
  };
  action: (formData: FormData) => void | Promise<void>;
  errorMessage?: string;
};

const copy = {
  es: {
    badge: "Editar factura",
    eyebrow: "edición profesional",
    titleA: "Actualiza una factura",
    titleB: "con control total y mejor presentación",
    desc: "Edita cliente, fechas, estado, notas y conceptos desde una interfaz moderna, clara y mucho más profesional.",
    clientSection: "Cliente",
    invoiceSection: "Factura",
    itemsSection: "Conceptos",
    summarySection: "Resumen",
    clientName: "Nombre del cliente",
    clientEmail: "Correo del cliente",
    issueDate: "Fecha de emisión",
    dueDate: "Fecha de vencimiento",
    currency: "Moneda",
    status: "Estado",
    notes: "Notas",
    notesPlaceholder: "Notas, términos o detalles del servicio...",
    itemDescription: "Descripción",
    itemQuantity: "Cantidad",
    itemPrice: "Precio unitario",
    addItem: "Agregar concepto",
    remove: "Eliminar",
    subtotal: "Subtotal",
    tax: "Impuesto",
    total: "Total",
    save: "Guardar cambios",
    saving: "Guardando cambios...",
    back: "Volver a factura",
    dashboard: "Dashboard",
    placeholderClient: "Nombre del cliente",
    placeholderEmail: "cliente@email.com",
    placeholderDesc: "Ej. Instalación de piso porcelanato",
    quickTips: "Edición premium",
    tip1: "Actualiza datos del cliente",
    tip2: "Agrega o elimina conceptos",
    tip3: "Control visual del total",
    pending: "Pendiente",
    paid: "Pagada",
    draft: "Borrador",
    overdue: "Vencida",
    removed: "Marcado para eliminar",
    currentInvoice: "Factura actual",
  },
  en: {
    badge: "Edit invoice",
    eyebrow: "professional editing",
    titleA: "Update an invoice",
    titleB: "with full control and better presentation",
    desc: "Edit client, dates, status, notes, and items from a modern, clear, and much more professional interface.",
    clientSection: "Client",
    invoiceSection: "Invoice",
    itemsSection: "Items",
    summarySection: "Summary",
    clientName: "Client name",
    clientEmail: "Client email",
    issueDate: "Issue date",
    dueDate: "Due date",
    currency: "Currency",
    status: "Status",
    notes: "Notes",
    notesPlaceholder: "Notes, terms, or service details...",
    itemDescription: "Description",
    itemQuantity: "Quantity",
    itemPrice: "Unit price",
    addItem: "Add item",
    remove: "Remove",
    subtotal: "Subtotal",
    tax: "Tax",
    total: "Total",
    save: "Save changes",
    saving: "Saving changes...",
    back: "Back to invoice",
    dashboard: "Dashboard",
    placeholderClient: "Client name",
    placeholderEmail: "client@email.com",
    placeholderDesc: "Ex. Porcelain floor installation",
    quickTips: "Premium editing",
    tip1: "Update client data",
    tip2: "Add or remove items",
    tip3: "Visual total control",
    pending: "Pending",
    paid: "Paid",
    draft: "Draft",
    overdue: "Overdue",
    removed: "Marked for removal",
    currentInvoice: "Current invoice",
  },
} as const;

export default function EditInvoiceScreen({
  invoice,
  action,
  errorMessage = "",
}: EditInvoiceScreenProps) {
  const [lang, setLang] = useState<Lang>("es");
  const [items, setItems] = useState<InvoiceItemRow[]>(
    invoice.items.length > 0
      ? invoice.items.map((item) => ({
          rowId: cryptoRandomId(),
          itemId: item.id,
          description: item.description,
          quantity: Number(item.quantity || 1),
          unitPrice: Number(item.unit_price || 0),
          removed: false,
        }))
      : [
          {
            rowId: cryptoRandomId(),
            itemId: "",
            description: "",
            quantity: 1,
            unitPrice: 0,
            removed: false,
          },
        ]
  );

  useEffect(() => {
    const syncLang = () => {
      const saved =
        typeof window !== "undefined"
          ? (localStorage.getItem("app_lang") as Lang | null)
          : null;

      if (saved === "es" || saved === "en") {
        setLang(saved);
      } else {
        setLang("es");
      }
    };

    syncLang();

    window.addEventListener("storage", syncLang);
    window.addEventListener("app-language-changed", syncLang as EventListener);

    return () => {
      window.removeEventListener("storage", syncLang);
      window.removeEventListener(
        "app-language-changed",
        syncLang as EventListener
      );
    };
  }, []);

  const t = useMemo(() => copy[lang], [lang]);

  const activeItems = items.filter((item) => !item.removed);

  const subtotal = activeItems.reduce(
    (sum, item) => sum + safeNumber(item.quantity) * safeNumber(item.unitPrice),
    0
  );
  const tax = 0;
  const total = subtotal + tax;

  const money = (value: number) =>
    new Intl.NumberFormat(lang === "es" ? "es-US" : "en-US", {
      style: "currency",
      currency: invoice.currency || "USD",
    }).format(value || 0);

  const updateItem = (
    rowId: string,
    field: "description" | "quantity" | "unitPrice",
    value: string
  ) => {
    setItems((current) =>
      current.map((item) =>
        item.rowId === rowId
          ? {
              ...item,
              [field]:
                field === "quantity" || field === "unitPrice"
                  ? Number(value)
                  : value,
            }
          : item
      )
    );
  };

  const addItem = () => {
    setItems((current) => [
      ...current,
      {
        rowId: cryptoRandomId(),
        itemId: "",
        description: "",
        quantity: 1,
        unitPrice: 0,
        removed: false,
      },
    ]);
  };

  const toggleRemoveItem = (rowId: string) => {
    setItems((current) => {
      if (current.length === 1) return current;
      return current.map((item) =>
        item.rowId === rowId ? { ...item, removed: !item.removed } : item
      );
    });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#040714] text-white">
      <BackgroundDecor />

      <div className="relative z-10 mx-auto max-w-[1600px] px-5 py-6 sm:px-8 lg:px-10 xl:px-14">
        <header className="rounded-[30px] border border-white/10 bg-white/[0.05] px-5 py-5 shadow-[0_25px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 backdrop-blur-xl">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>
                <span className="text-sm font-medium text-white/75">
                  {t.badge}
                </span>
              </div>

              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
                {t.eyebrow}
              </p>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl xl:text-5xl">
                {t.titleA}
                <span className="mt-2 block bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                  {t.titleB}
                </span>
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60 sm:text-base">
                {t.desc}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <TipCard title={t.tip1} />
              <TipCard title={t.tip2} />
              <TipCard title={t.tip3} />
            </div>
          </div>
        </header>

        <form action={action} className="mt-6 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <input type="hidden" name="invoice_id" value={invoice.id} />

          <section className="space-y-4">
            <Card>
              <div className="flex items-center justify-between gap-4">
                <SectionHeader title={t.clientSection} subtitle={t.currentInvoice} />
                <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                  #{invoice.invoice_number}
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Field
                  label={t.clientName}
                  name="client_name"
                  defaultValue={invoice.client_name}
                  placeholder={t.placeholderClient}
                  required
                />
                <Field
                  label={t.clientEmail}
                  name="client_email"
                  type="email"
                  defaultValue={invoice.client_email}
                  placeholder={t.placeholderEmail}
                />
              </div>
            </Card>

            <Card>
              <SectionHeader title={t.invoiceSection} subtitle={t.currentInvoice} />

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Field
                  label={t.issueDate}
                  name="issue_date"
                  type="date"
                  defaultValue={invoice.issue_date}
                />
                <Field
                  label={t.dueDate}
                  name="due_date"
                  type="date"
                  defaultValue={invoice.due_date}
                />
                <SelectField
                  label={t.currency}
                  name="currency"
                  defaultValue={invoice.currency || "USD"}
                  options={[
                    { value: "USD", label: "USD" },
                    { value: "EUR", label: "EUR" },
                    { value: "MXN", label: "MXN" },
                  ]}
                />
                <SelectField
                  label={t.status}
                  name="status"
                  defaultValue={invoice.status || "pending"}
                  options={[
                    { value: "pending", label: t.pending },
                    { value: "paid", label: t.paid },
                    { value: "draft", label: t.draft },
                    { value: "overdue", label: t.overdue },
                  ]}
                />
              </div>

              <div className="mt-4">
                <TextAreaField
                  label={t.notes}
                  name="notes"
                  defaultValue={invoice.notes}
                  placeholder={t.notesPlaceholder}
                />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between gap-4">
                <SectionHeader title={t.itemsSection} subtitle={t.currentInvoice} />
                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
                >
                  {t.addItem}
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {items.map((item, index) => {
                  const lineTotal =
                    safeNumber(item.quantity) * safeNumber(item.unitPrice);

                  return (
                    <div
                      key={item.rowId}
                      className={`rounded-[24px] border p-4 ${
                        item.removed
                          ? "border-red-400/20 bg-red-400/[0.04] opacity-75"
                          : "border-white/10 bg-white/[0.03]"
                      }`}
                    >
                      <input type="hidden" name="row_id" value={item.rowId} />
                      <input type="hidden" name="item_id" value={item.itemId} />
                      <input
                        type="hidden"
                        name="item_removed"
                        value={item.removed ? "true" : "false"}
                      />

                      <div className="grid gap-4 lg:grid-cols-[1.5fr_0.45fr_0.6fr_0.4fr]">
                        <Field
                          label={`${t.itemDescription} ${index + 1}`}
                          name="item_description"
                          placeholder={t.placeholderDesc}
                          value={item.description}
                          onChange={(e) =>
                            updateItem(item.rowId, "description", e.target.value)
                          }
                          required={!item.removed}
                          disabled={item.removed}
                        />

                        <Field
                          label={t.itemQuantity}
                          name="item_quantity"
                          type="number"
                          min="1"
                          step="1"
                          value={String(item.quantity)}
                          onChange={(e) =>
                            updateItem(item.rowId, "quantity", e.target.value)
                          }
                          required={!item.removed}
                          disabled={item.removed}
                        />

                        <Field
                          label={t.itemPrice}
                          name="item_unit_price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={String(item.unitPrice)}
                          onChange={(e) =>
                            updateItem(item.rowId, "unitPrice", e.target.value)
                          }
                          required={!item.removed}
                          disabled={item.removed}
                        />

                        <div className="flex flex-col justify-end gap-2">
                          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-right">
                            <p className="text-[11px] uppercase tracking-[0.20em] text-white/35">
                              Total
                            </p>
                            <p className="mt-1 text-sm font-semibold text-white">
                              {money(lineTotal)}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleRemoveItem(item.rowId)}
                            disabled={items.length === 1}
                            className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {item.removed ? "Restaurar" : t.remove}
                          </button>
                        </div>
                      </div>

                      {item.removed ? (
                        <p className="mt-3 text-sm font-medium text-red-300">
                          {t.removed}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </Card>
          </section>

          <aside className="space-y-4">
            <Card>
              <SectionHeader title={t.summarySection} subtitle={t.currentInvoice} />

              {errorMessage ? (
                <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-medium text-red-200">
                  {errorMessage}
                </div>
              ) : null}

              <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                <div className="space-y-3">
                  <SummaryRow label={t.subtotal} value={money(subtotal)} />
                  <SummaryRow label={t.tax} value={money(tax)} />
                  <div className="h-px bg-white/10" />
                  <SummaryRow label={t.total} value={money(total)} strong />
                </div>
              </div>

              <div className="mt-5">
                <SubmitButton save={t.save} saving={t.saving} />
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Link
                  href={`/invoice/${invoice.id}`}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.07]"
                >
                  {t.back}
                </Link>

                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.07]"
                >
                  {t.dashboard}
                </Link>
              </div>
            </Card>

            <Card>
              <p className="text-xs uppercase tracking-[0.22em] text-white/35">
                {t.quickTips}
              </p>

              <div className="mt-4 grid gap-3">
                <MiniInfo title={t.clientSection} value={invoice.client_name || "—"} />
                <MiniInfo title={t.status} value={invoice.status || t.pending} />
                <MiniInfo title={t.currency} value={invoice.currency || "USD"} />
              </div>
            </Card>
          </aside>
        </form>
      </div>
    </main>
  );
}

function SubmitButton({
  save,
  saving,
}: {
  save: string;
  saving: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="group inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-[linear-gradient(135deg,#020617,#111827,#1e293b)] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,23,42,0.28)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_50px_rgba(15,23,42,0.36)] focus:outline-none focus:ring-4 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-80 disabled:hover:translate-y-0"
    >
      {pending ? (
        <>
          <Spinner />
          {saving}
        </>
      ) : (
        <>
          {save}
          <span className="transition group-hover:translate-x-0.5">→</span>
        </>
      )}
    </button>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[30px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_25px_60px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
      {children}
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.22em] text-white/35">
        {subtitle}
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
    </div>
  );
}

function Field({
  label,
  name,
  placeholder,
  type = "text",
  value,
  onChange,
  required,
  min,
  step,
  defaultValue,
  disabled,
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  required?: boolean;
  min?: string;
  step?: string;
  defaultValue?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white/80">{label}</label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        min={min}
        step={step}
        defaultValue={defaultValue}
        disabled={disabled}
        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white/80">{label}</label>
      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-slate-900 text-white"
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextAreaField({
  label,
  name,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white/80">{label}</label>
      <textarea
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        rows={5}
        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"
      />
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p
        className={
          strong
            ? "text-base font-semibold text-white"
            : "text-sm text-white/60"
        }
      >
        {label}
      </p>
      <p
        className={
          strong
            ? "text-lg font-semibold text-white"
            : "text-sm font-medium text-white/85"
        }
      >
        {value}
      </p>
    </div>
  );
}

function MiniInfo({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.20em] text-white/35">
        {title}
      </p>
      <p className="mt-2 text-sm font-medium text-white/80">{value}</p>
    </div>
  );
}

function TipCard({ title }: { title: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 text-center">
      <p className="text-sm font-medium text-white/80">{title}</p>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BackgroundDecor() {
  return (
    <>
      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute right-0 top-0 h-[28rem] w-[28rem] rounded-full bg-violet-500/10 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.14]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent,rgba(0,0,0,0.22))]" />
    </>
  );
}

function safeNumber(value: number) {
  return Number.isFinite(value) ? value : 0;
}

function cryptoRandomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}