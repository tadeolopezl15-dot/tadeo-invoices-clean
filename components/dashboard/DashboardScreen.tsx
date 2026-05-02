"use client";

import Link from "next/link";
import { useMemo } from "react";

type Invoice = {
  id: string;
  total: number;
  status: string;
  created_at: string;
};

type Props = {
  invoices: Invoice[];
};

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);
}

export default function DashboardScreen({ invoices }: Props) {
  const stats = useMemo(() => {
    const total = invoices.reduce((sum, i) => sum + Number(i.total || 0), 0);

    const paid = invoices
      .filter((i) => i.status === "paid")
      .reduce((sum, i) => sum + Number(i.total || 0), 0);

    const pending = invoices
      .filter((i) => i.status !== "paid")
      .reduce((sum, i) => sum + Number(i.total || 0), 0);

    return { total, paid, pending };
  }, [invoices]);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-cyan-300">
              Tadeo Invoices
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Control de tu negocio
            </p>
          </div>

          <Link
            href={"/invoice/new" as any}
            className="rounded-2xl bg-cyan-400 px-6 py-3 font-bold text-slate-950 hover:bg-cyan-300"
          >
            + Nueva factura
          </Link>
        </div>

        {/* STATS */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card title="Ingresos totales" value={money(stats.total)} />
          <Card title="Pagado" value={money(stats.paid)} />
          <Card title="Pendiente" value={money(stats.pending)} />
        </div>

        {/* ACTIONS */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <ActionCard
            title="Ver facturas"
            description="Lista completa de facturas"
            href="/invoice"
          />

          <ActionCard
            title="Crear factura"
            description="Nueva factura profesional"
            href="/invoice/new"
          />

          <ActionCard
            title="Configuración"
            description="Ajustes del sistema"
            href="/configuracion"
          />
        </div>
      </div>
    </main>
  );
}

/* ---------- COMPONENTES ---------- */

function Card({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <p className="text-sm text-slate-400">{title}</p>
      <h2 className="mt-2 text-3xl font-black text-cyan-300">{value}</h2>
    </div>
  );
}

function ActionCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href as any}
      className="group rounded-[22px] border border-white/10 bg-white/[0.04] p-6 transition hover:bg-white/[0.06]"
    >
      <h3 className="text-lg font-black text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </Link>
  );
}