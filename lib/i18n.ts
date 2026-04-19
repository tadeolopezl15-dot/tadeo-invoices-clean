export type Lang = "es" | "en";

export const defaultLang: Lang = "es";

export const translations = {
  es: {
    common: {
      language: "Idioma",
      spanish: "Español",
      english: "Inglés",

      dashboard: "Panel",
      invoices: "Facturas",
      settings: "Configuración",
      pricing: "Precios",

      login: "Iniciar sesión",
      signup: "Crear cuenta",
      logout: "Cerrar sesión",

      save: "Guardar",
      cancel: "Cancelar",
      edit: "Editar",
      delete: "Eliminar",
      create: "Crear",
      search: "Buscar",

      status: "Estado",
      paid: "Pagada",
      pending: "Pendiente",
      overdue: "Vencida",

      total: "Total",
      client: "Cliente",
      date: "Fecha",
      actions: "Acciones",

      welcome: "Bienvenido",
      description: "Descripción",
      amount: "Monto",
      name: "Nombre",
      email: "Correo",
      phone: "Teléfono",
      company: "Empresa",

      monthly: "Mensual",
      yearly: "Anual",
      free: "Gratis",

      startNow: "Comenzar ahora",
      getStarted: "Empezar",
      choosePlan: "Elegir plan",
    },

    home: {
      heroTitle: "Facturación profesional para tu negocio",
      heroSubtitle: "Crea, envía y administra facturas en un solo lugar.",
      heroButton: "Comenzar",

      sectionTitle: "Todo lo que necesitas",
      sectionSubtitle:
        "Herramientas modernas para facturación, clientes y membresías.",
    },

    pricing: {
      title: "Planes y precios",
      subtitle: "Elige el plan ideal para tu negocio.",

      starter: "Inicial",
      pro: "Profesional",
      business: "Empresarial",

      starterDesc: "Ideal para empezar con facturas básicas.",
      proDesc:
        "Para negocios que necesitan más control y automatización.",
      businessDesc:
        "Para equipos y empresas con mayor volumen.",

      perMonth: "/ mes",
    },

    dashboard: {
      title: "Panel principal",
      subtitle: "Resumen general de tu negocio",

      totalInvoices: "Facturas totales",
      paidInvoices: "Facturas pagadas",
      pendingInvoices: "Facturas pendientes",
      revenue: "Ingresos",

      recentInvoices: "Facturas recientes",
      topClients: "Mejores clientes",
      monthlyReport: "Reporte mensual",
    },

    login: {
      title: "Inicia sesión",
      subtitle:
        "Accede a tu cuenta para gestionar tu negocio.",

      email: "Correo electrónico",
      password: "Contraseña",

      button: "Entrar",

      noAccount: "¿No tienes cuenta?",
      createOne: "Crear una cuenta",
    },

    signup: {
      title: "Crear cuenta",
      subtitle: "Empieza a usar la plataforma hoy.",

      fullName: "Nombre completo",
      companyName: "Nombre de empresa",
      email: "Correo electrónico",
      password: "Contraseña",

      button: "Registrarme",

      haveAccount: "¿Ya tienes cuenta?",
      login: "Iniciar sesión",
    },

    settings: {
      title: "Configuración",
      subtitle:
        "Administra la información de tu empresa",

      companyInfo: "Información de la empresa",
      logo: "Logo",
      uploadLogo: "Subir logo",

      companyName: "Nombre de la empresa",
      companyEmail: "Correo de la empresa",
      companyPhone: "Teléfono de la empresa",
      address: "Dirección",
      taxId: "Tax ID / RUC",

      saveChanges: "Guardar cambios",
    },

    invoices: {
      title: "Facturas",
      subtitle: "Administra todas tus facturas",

      newInvoice: "Nueva factura",
      invoiceNumber: "Número de factura",

      createInvoice: "Crear factura",
      sendInvoice: "Enviar factura",

      noInvoices: "No hay facturas aún",

      markPaid: "Marcar como pagada",
      markPending: "Marcar como pendiente",
    },
  },

  en: {
    common: {
      language: "Language",
      spanish: "Spanish",
      english: "English",

      dashboard: "Dashboard",
      invoices: "Invoices",
      settings: "Settings",
      pricing: "Pricing",

      login: "Log in",
      signup: "Sign up",
      logout: "Log out",

      save: "Save",
      cancel: "Cancel",
      edit: "Edit",
      delete: "Delete",
      create: "Create",
      search: "Search",

      status: "Status",
      paid: "Paid",
      pending: "Pending",
      overdue: "Overdue",

      total: "Total",
      client: "Client",
      date: "Date",
      actions: "Actions",

      welcome: "Welcome",
      description: "Description",
      amount: "Amount",
      name: "Name",
      email: "Email",
      phone: "Phone",
      company: "Company",

      monthly: "Monthly",
      yearly: "Yearly",
      free: "Free",

      startNow: "Start now",
      getStarted: "Get started",
      choosePlan: "Choose plan",
    },

    home: {
      heroTitle:
        "Professional invoicing for your business",
      heroSubtitle:
        "Create, send, and manage invoices in one place.",
      heroButton: "Get started",

      sectionTitle: "Everything you need",
      sectionSubtitle:
        "Modern tools for invoicing, clients, and memberships.",
    },

    pricing: {
      title: "Plans and pricing",
      subtitle:
        "Choose the ideal plan for your business.",

      starter: "Starter",
      pro: "Professional",
      business: "Business",

      starterDesc:
        "Perfect for getting started with basic invoices.",
      proDesc:
        "For businesses that need more control and automation.",
      businessDesc:
        "For teams and companies with higher volume.",

      perMonth: "/ month",
    },

    dashboard: {
      title: "Main dashboard",
      subtitle:
        "General overview of your business",

      totalInvoices: "Total invoices",
      paidInvoices: "Paid invoices",
      pendingInvoices: "Pending invoices",
      revenue: "Revenue",

      recentInvoices: "Recent invoices",
      topClients: "Top clients",
      monthlyReport: "Monthly report",
    },

    login: {
      title: "Log in",
      subtitle:
        "Access your account to manage your business.",

      email: "Email address",
      password: "Password",

      button: "Log in",

      noAccount: "Don't have an account?",
      createOne: "Create an account",
    },

    signup: {
      title: "Create account",
      subtitle:
        "Start using the platform today.",

      fullName: "Full name",
      companyName: "Company name",
      email: "Email address",
      password: "Password",

      button: "Sign up",

      haveAccount: "Already have an account?",
      login: "Log in",
    },

    settings: {
      title: "Settings",
      subtitle:
        "Manage your company information",

      companyInfo: "Company information",
      logo: "Logo",
      uploadLogo: "Upload logo",

      companyName: "Company name",
      companyEmail: "Company email",
      companyPhone: "Company phone",
      address: "Address",
      taxId: "Tax ID",

      saveChanges: "Save changes",
    },

    invoices: {
      title: "Invoices",
      subtitle: "Manage all your invoices",

      newInvoice: "New invoice",
      invoiceNumber: "Invoice number",

      createInvoice: "Create invoice",
      sendInvoice: "Send invoice",

      noInvoices: "No invoices yet",

      markPaid: "Mark as paid",
      markPending: "Mark as pending",
    },
  },
} as const;

export function getTranslation(lang: Lang) {
  return translations[lang] || translations[defaultLang];
}