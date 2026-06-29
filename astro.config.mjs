// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

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
					items: [
						{ label: 'Presentación del módulo', slug: 'presentacion' },
					],
				},
				{
					label: 'Fase Axelor',
					items: [
						{ label: 'UD1 — Identificación ERP-CRM', slug: 'axelor/ud1' },
						{ label: 'UD2 — Implantación Axelor', slug: 'axelor/ud2' },
						{ label: 'UD3 — Gestión y Consultas', slug: 'axelor/ud3' },
					],
				},
				{
					label: 'Fase Spring Boot',
					items: [
						{ label: 'UD4 — Introducción a Spring Boot', slug: 'spring/ud4' },
						{ label: 'UD5 — Spring MVC, REST y Arquitectura por Capas', slug: 'spring/ud5' },
						{ label: 'UD6 — Formularios Web con Thymeleaf', slug: 'spring/ud6' },
						{ label: 'UD7 — Módulos Avanzados y Dashboard', slug: 'spring/ud7' },
					],
				},
				{
					label: 'Fase Retos — ERP Balmis',
					items: [
						{ label: 'Reto 0: La Semilla — UD4', slug: 'retos/reto0' },
						{ label: 'Reto 1: El Modelo — UD4', slug: 'retos/reto1' },
						{ label: 'Reto 2: La Vista — UD5', slug: 'retos/reto2' },
						{ label: 'Reto 3: La Transición — UD5', slug: 'retos/reto3' },
						{ label: 'Reto 4: El CRM — UD5/UD6', slug: 'retos/reto4' },
						{ label: 'Reto 5: Las Ventas — UD6', slug: 'retos/reto5' },
						{ label: 'Reto 6: La Seguridad — UD6', slug: 'retos/reto6' },
						{ label: 'Reto 7: Las Compras — UD7', slug: 'retos/reto7' },
						{ label: 'Reto 8 Final: Dashboard — UD7', slug: 'retos/reto8-final' },
					],
				},
				// {
				// 	label: 'Repositorios',
				// 	items: [
				// 		// { label: 'Código fuente Reto 0', link: 'https://github.com/lestan-balmis/sge-reto0', attrs: { target: '_blank' } },
				// 	],
				// },
			],
		}),
	],
});
