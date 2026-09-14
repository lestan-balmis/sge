/**
 * Control de visibilidad de módulos del curso
 * 
 * Descomenta los módulos que desees mostrar en el curso
 * Formato: 'seccion/modulo' o 'modulo' para la sección Inicio
 */
export const VISIBLE_MODULES = [
	'presentacion',           // Semana 1 - Siempre visible

	// Fase Axelor - Descomenta según avance del curso
	// 'axelor/ud1',
	// 'axelor/ud2',
	// 'axelor/ud3',

	// Fase Spring Boot - Descomenta según avance del curso
	// 'spring/ud4',
	// 'spring/ud5',
	// 'spring/ud6',
	// 'spring/ud7',
	// 'spring/ud8',

	// Fase Retos ERP Balmis - Descomenta según avance del curso
	// 'retos/reto0',
	// 'retos/reto1',
	// 'retos/reto2',
	// 'retos/reto3',
	// 'retos/reto4',
	// 'retos/reto5',
	// 'retos/reto6',
	// 'retos/reto7',
	// 'retos/reto8',
	// 'retos/reto9',
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
