/** UI strings of the docs components, per locale. */
const strings = {
  en: {
    props: 'Properties',
    events: 'Events',
    slots: 'Slots',
    parts: 'CSS parts',
    cssProperties: 'CSS custom properties',
    keyboard: 'Keyboard',
    name: 'Name',
    type: 'Type',
    default: 'Default',
    description: 'Description',
    platforms: 'Platforms',
    all: 'All',
    detail: 'Detail',
    keys: 'Keys',
    action: 'Action',
    defaultSlot: '(default)',
    theme: 'Cosmos theme',
    controls: 'Controls',
    code: 'Code',
    component: 'Component',
    status: 'Status',
    priority: 'Priority',
    dependsOn: 'Depends on',
    next: 'Suggested next',
    statusLabels: { stable: 'Stable', 'in-progress': 'In progress', planned: 'Planned' },
    summary: (stable: number, progress: number, planned: number) =>
      `${stable} stable · ${progress} in progress · ${planned} planned`,
    notApplicable: 'Not applicable',
  },
  es: {
    props: 'Propiedades',
    events: 'Eventos',
    slots: 'Slots',
    parts: 'Partes CSS',
    cssProperties: 'Propiedades CSS personalizadas',
    keyboard: 'Teclado',
    name: 'Nombre',
    type: 'Tipo',
    default: 'Por defecto',
    description: 'Descripción',
    platforms: 'Plataformas',
    all: 'Todas',
    detail: 'Detalle',
    keys: 'Teclas',
    action: 'Acción',
    defaultSlot: '(por defecto)',
    theme: 'Tema Cosmos',
    controls: 'Controles',
    code: 'Código',
    component: 'Componente',
    status: 'Estado',
    priority: 'Prioridad',
    dependsOn: 'Depende de',
    next: 'Siguientes sugeridos',
    statusLabels: { stable: 'Estable', 'in-progress': 'En progreso', planned: 'Planificado' },
    summary: (stable: number, progress: number, planned: number) =>
      `${stable} estables · ${progress} en progreso · ${planned} planificados`,
    notApplicable: 'No aplica',
  },
} as const;

export type Locale = keyof typeof strings;

export function t(locale: string | undefined) {
  return strings[locale === 'es' ? 'es' : 'en'];
}

/** `fullWidth` → `full-width` (attribute names of the Web Components). */
export const toAttribute = (name: string) => name.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`);
