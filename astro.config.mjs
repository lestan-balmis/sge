// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://lestan-balmis.github.io',
	base: '/sge',
	integrations: [
		starlight({
			title: 'SGE — IES Balmis',
			description: 'Módulo Sistemas de Gestión Empresarial · DAM · IES Balmis · Curso 2026-2027',
			expressiveCode: false,
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
					label: 'Fase Retos — ERP Balmis',
					items: [
						{ label: 'UD4 — Reto 0: La Semilla', slug: 'retos/reto0' },
						{ label: 'UD4 — Reto 1: El Modelo', slug: 'retos/reto1' },
						{ label: 'UD5 — Reto 2: La Vista', slug: 'retos/reto2' },
						{ label: 'UD5 — Reto 3: La Transición', slug: 'retos/reto3' },
						{ label: 'UD5/UD6 — Reto 4: El CRM', slug: 'retos/reto4' },
						{ label: 'UD6 — Reto 5: Las Ventas', slug: 'retos/reto5' },
						{ label: 'UD6 — Reto 6: La Seguridad', slug: 'retos/reto6' },
						{ label: 'UD7 — Reto 7: Las Compras', slug: 'retos/reto7' },
					{ label: 'UD7 — Reto 8 Final: Dashboard', slug: 'retos/reto8-final' },
					],
				},
				{
					label: 'Repositorios',
					items: [
						// { label: 'Código fuente Reto 0', link: 'https://github.com/lestan-balmis/sge-reto0', attrs: { target: '_blank' } },
					],
				},
			],
		}),
	],
});
