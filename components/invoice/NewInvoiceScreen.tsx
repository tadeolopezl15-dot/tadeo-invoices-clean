"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

type Lang = "es" | "en";

type ItemRow = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

type NewInvoiceScreenProps = {
  action: (formData: FormData) => void | Promise<void>;
};

const copy = {
  es: {
    badge: "Nueva factura",
    eyebrow: "facturación profesional",
    titleA: "Crea una factura",
    titleB: "moderna, clara y lista para enviar",
    desc: "Completa los datos del cliente, agrega conceptos y genera una factura con imagen mucho más profesional.",
    clientSection: "Cliente",
    invoiceSection: "Factura",
    itemsSection: "Conceptos",
    summarySection: "Resumen",
    clientName: "Nombre del cliente",
    clientEmail: "Correo del cliente",
    issueDate: "Fecha de emisión",
    dueDate: "Fecha de vencimiento",
    currency: "Moneda",
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
    create: "Crear factura",
    creating: "Creando factura...",
    emptyItem: "Agrega al menos un concepto válido.",
    placeholderClient: "Nombre del cliente",
    placeholderEmail: "cliente@email.com",
    placeholderDesc: "Ej. Instalación de piso porcelanato",
    quickTips: "Vista pro del documento",
    tip1: "Cliente y fechas claras",
    tip2: "Conceptos organizados",
    tip3: "Resumen visual elegante",
  },
  en: {
    badge: "New invoice",
    eyebrow: "professional invoicing",
    titleA: "Create an invoice",
    titleB: "modern, clear, and ready to send",
    desc: "Complete the client details, add items, and generate an invoice with a much more professional look.",
    clientSection: "Client",
    invoiceSection: "Invoice",
    itemsSection: "Items",
    summarySection: "Summary",
    clientName: "Client name",
    clientEmail: "Client email",
    issueDate: "Issue date",
    dueDate: "Due date",
    currency: "Currency",
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
    create: "Create invoice",
    creating: "Creating invoice...",
    emptyItem: "Add at least one valid item.",
    placeholderClient: "Client name",
    placeholderEmail: "client@email.com",
    placeholderDesc: "Ex. Porcelain floor installation",
    quickTips: "Pro document view",
    tip1: "Clear client and dates",
    tip2: "Well-organized items",
    tip3: "Elegant visual summary",
  },
} as const;

export default function NewInvoiceScreen({ action }: NewInvoiceScreenProps) {
  const [lang, setLang] = useState<Lang>("es");
  const [items, setItems] = useState<ItemRow[]>([
    { id: cryptoRandomId(), description: "", quantity: 1, unitPrice: 0 },
  ]);

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

  const subtotal = items.reduce(
    (sum, item) => sum + safeNumber(item.quantity) * safeNumber(item.unitPrice),
    0
  );
  const tax = 0;
  const total = subtotal + tax;

  const money = (value: number) =>
    new Intl.NumberFormat(lang === "es" ? "es-US" : "en-US", {
      style: "currency",
      currency: "USD",
    }).format(value || 0);

  const updateItem = (
    id: string,
    field: keyof ItemRow,
    value: string | number
  ) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
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
      { id: cryptoRandomId(), description: "", quantity: 1, unitPrice: 0 },
    ]);
  };

  const removeItem = (id: string) => {
    setItems((current) =>
      current.length === 1 ? current : current.filter((item) => item.id !== id)
    );
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
          <section className="space-y-4">
            <Card>
              <SectionHeader title={t.clientSection} subtitle={t.quickTips} />

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Field
                  label={t.clientName}
                  name="client_name"
                  placeholder={t.placeholderClient}
                  required
                />
                <Field
                  label={t.clientEmail}
                  name="client_email"
                  type="email"
                  placeholder={t.placeholderEmail}
                />
              </div>
            </Card>

            <Card>
              <SectionHeader title={t.invoiceSection} subtitle={t.quickTips} />

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <Field
                  label={t.issueDate}
                  name="issue_date"
                  type="date"
                  defaultValue={todayInputValue()}
                />
                <Field label={t.dueDate} name="due_date" type="date" />
                <SelectField
                  label={t.currency}
                  name="currency"
                  defaultValue="USD"
                  options={[
                    { value: "USD", label: "USD" },
                    { value: "EUR", label: "EUR" },
                    { value: "MXN", label: "MXN" },
                  ]}
                />
              </div>

              <div className="mt-4">
                <TextAreaField
                  label={t.notes}
                  name="notes"
                  placeholder={t.notesPlaceholder}
                />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between gap-4">
                <SectionHeader title={t.itemsSection} subtitle={t.quickTips} />
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
                      key={item.id}
                      className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4"
                    >
                      <div className="grid gap-4 lg:grid-cols-[1.5fr_0.45fr_0.6fr_0.4fr]">
                        <Field
                          label={`${t.itemDescription} ${index + 1}`}
                          name="item_description"
                          placeholder={t.placeholderDesc}
                          value={item.description}
                          onChange={(e) =>
                            updateItem(item.id, "description", e.target.value)
                          }
                          required
                        />

                        <Field
                          label={t.itemQuantity}
                          name="item_quantity"
                          type="number"
                          min="1"
                          step="1"
                          value={String(item.quantity)}
                          onChange={(e) =>
                            updateItem(item.id, "quantity", e.target.value)
                          }
                          required
                        />

                        <Field
                          label={t.itemPrice}
                          name="item_unit_price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={String(item.unitPrice)}
                          onChange={(e) =>
                            updateItem(item.id, "unitPrice", e.target.value)
                          }
                          required
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
                            onClick={() => removeItem(item.id)}
                            disabled={items.length === 1}
                            className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {t.remove}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </section>

          <aside className="space-y-4">
            <Card>
              <SectionHeader title={t.summarySection} subtitle={t.quickTips} />

              <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                <div className="space-y-3">
                  <SummaryRow label={t.subtotal} value={money(subtotal)} />
                  <SummaryRow label={t.tax} value={money(tax)} />
                  <div className="h-px bg-white/10" />
                  <SummaryRow label={t.total} value={money(total)} strong />
                </div>
              </div>

              <div className="mt-5">
                <SubmitButton create={t.create} creating={t.creating} />
              </div>
            </Card>

            <Card>
              <p className="text-xs uppercase tracking-[0.22em] text-white/35">
                {t.quickTips}
              </p>

              <div className="mt-4 grid gap-3">
                <MiniInfo title={t.clientSection} value={t.tip1} />
                <MiniInfo title={t.itemsSection} value={t.tip2} />
                <MiniInfo title={t.summarySection} value={t.tip3} />
              </div>
            </Card>
          </aside>
        </form>
      </div>
    </main>
  );
}

function SubmitButton({
  create,
  creating,
}: {
  create: string;
  creating: string;
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
          {creating}
        </>
      ) : (
        <>
          {create}
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
        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"
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
}: {
  label: string;
  name: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white/80">{label}</label>
      <textarea
        name={name}
        placeholder={placeholder}
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

function todayInputValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function cryptoRandomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}