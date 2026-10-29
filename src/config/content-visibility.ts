/**
 * Control de visibilidad de módulos del curso
 * 
 * Descomenta los módulos que desees mostrar en el curso
 * Formato: 'seccion/modulo' o 'modulo' para la sección Inicio
 */
export const VISIBLE_MODULES = [
	'presentacion',           

	// Odoo
	'odoo/ud1',
	'odoo/ud2',
	'odoo/ud3',

	// Spring Boot
	'spring/ud4',
	'spring/ud5a',
	'spring/ud5b',
	// 'spring/ud5c',
	// 'spring/ud6',
	// 'spring/ud7',
	// 'spring/ud8',

	// Retos ERP Balmis
	'retos/reto0',
	'retos/reto1',
	'retos/reto2',
	'retos/reto3',
	// 'retos/reto4',
	// 'retos/reto5',
	// 'retos/reto6',
	// 'retos/reto7',
	// 'retos/reto8',
	// 'retos/reto9',

	// Repaso 1ª Evaluación
	// 'repaso1eval/repaso4',
	// 'repaso1eval/repaso5a',
	// 'repaso1eval/repaso5b',
];

/**
 * Función para verificar si un módulo está visible
 */
export function isModuleVisible(slug: string): boolean {
	return VISIBLE_MODULES.includes(slug);
}

/**
 * Función para filtrar items del sidebar según visibilidad
 */
export function filterSidebarItems(items: any[]): any[] {
	return items.filter(item => isModuleVisible(item.slug));
}
