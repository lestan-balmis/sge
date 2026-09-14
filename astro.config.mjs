// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { VISIBLE_MODULES } from './src/config/content-visibility.ts';

// Definición completa de todos los módulos disponibles
const ALL_MODULES = {
	inicio: [
		{ label: 'Presentación del módulo', slug: 'presentacion' },
	],
	axelor: [
		{ label: 'UD1 — Identificación ERP-CRM', slug: 'axelor/ud1' },
		{ label: 'UD2 — Implantación Axelor', slug: 'axelor/ud2' },
		{ label: 'UD3 — Gestión y Consultas', slug: 'axelor/ud3' },
	],
	spring: [
		{ label: 'UD4 — Introducción a Spring Boot', slug: 'spring/ud4' },
		{ label: 'UD5 — Spring MVC, REST y Arquitectura por Capas', slug: 'spring/ud5' },
		{ label: 'UD6 — Formularios Web con Thymeleaf', slug: 'spring/ud6' },
		{ label: 'UD7 — Módulos Avanzados y Dashboard', slug: 'spring/ud7' },
		{ label: 'UD8 — Despliegue, IA y Cloud', slug: 'spring/ud8' },
	],
	retos: [
		{ label: 'Reto 0: La Semilla — UD4', slug: 'retos/reto0' },
		{ label: 'Reto 1: El Modelo — UD4', slug: 'retos/reto1' },
		{ label: 'Reto 2: La Vista — UD5', slug: 'retos/reto2' },
		{ label: 'Reto 3: La Transición — UD5', slug: 'retos/reto3' },
		{ label: 'Reto 4: El CRM — UD5/UD6', slug: 'retos/reto4' },
		{ label: 'Reto 5: Las Ventas — UD6', slug: 'retos/reto5' },
		{ label: 'Reto 6: La Seguridad — UD6', slug: 'retos/reto6' },
		{ label: 'Reto 7: Las Compras — UD7', slug: 'retos/reto7' },
		{ label: 'Reto 8: Dashboard — UD7', slug: 'retos/reto8' },
		{ label: 'Reto 9: La Nube y la IA — UD8', slug: 'retos/reto9' },
	],
};

// Función para filtrar items según visibilidad
function filterVisibleItems(items) {
	return items.filter(item => VISIBLE_MODULES.includes(item.slug));
}

// https://astro.build/config
export default defineConfig({
	site: 'https://lestan-balmis.github.io',
	base: '/sge',
	integrations: [
		starlight({
			title: 'SGE — IES Doctor Balmis',
			description: 'Módulo Sistemas de Gestión Empresarial · DAM · IES Doctor Balmis · Curso 2026-2027',
			expressiveCode: false,
			customCss: ['./src/styles/custom.css'],
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/lestan-balmis' }],
			sidebar: [
				{
					label: 'Inicio',
					items: filterVisibleItems(ALL_MODULES.inicio),
				},
				// Fase Axelor - Solo si hay items visibles
				...(filterVisibleItems(ALL_MODULES.axelor).length > 0 ? [
					{
						label: 'Fase Axelor',
						items: filterVisibleItems(ALL_MODULES.axelor),
					},
				] : []),
				// Fase Spring Boot - Solo si hay items visibles
				...(filterVisibleItems(ALL_MODULES.spring).length > 0 ? [
					{
						label: 'Fase Spring Boot',
						items: filterVisibleItems(ALL_MODULES.spring),
					},
				] : []),
				// Fase Retos ERP Balmis - Solo si hay items visibles
				...(filterVisibleItems(ALL_MODULES.retos).length > 0 ? [
					{
						label: 'Fase Retos — ERP Balmis',
						items: filterVisibleItems(ALL_MODULES.retos),
					},
				] : []),
			],
		}),
	],
});
