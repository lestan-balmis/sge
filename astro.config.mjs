// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { VISIBLE_MODULES } from './src/config/content-visibility.ts';

// Inyectar el componente de fullview en cada página
const fullViewHTML = `
<div class="fullview-toggle-buttons left-side">
  <button class="fullview-toggle-btn" id="toggle-left-sidebar" title="Ocultar/Mostrar menú lateral izquierdo" aria-label="Alternar menú lateral izquierdo">◀</button>
</div>
<div class="fullview-toggle-buttons right-side">
  <button class="fullview-toggle-btn" id="toggle-right-sidebar" title="Ocultar/Mostrar tabla de contenidos" aria-label="Alternar tabla de contenidos">▶</button>
</div>
<script>
(function() {
  function initFullViewMode() {
    const toggleLeftBtn = document.getElementById('toggle-left-sidebar');
    const toggleRightBtn = document.getElementById('toggle-right-sidebar');
    const body = document.body;
    const STORAGE_LEFT_KEY = 'fullview-left-hidden';
    const STORAGE_RIGHT_KEY = 'fullview-right-hidden';

    function restoreState() {
      if (localStorage.getItem(STORAGE_LEFT_KEY) === 'true') {
        body.setAttribute('data-fullview-left-hidden', '');
        if (toggleLeftBtn) toggleLeftBtn.textContent = '▶';
      }
      if (localStorage.getItem(STORAGE_RIGHT_KEY) === 'true') {
        body.setAttribute('data-fullview-right-hidden', '');
        if (toggleRightBtn) toggleRightBtn.textContent = '◀';
      }
    }

    if (toggleLeftBtn) {
      toggleLeftBtn.addEventListener('click', () => {
        const isHidden = body.hasAttribute('data-fullview-left-hidden');
        if (isHidden) {
          body.removeAttribute('data-fullview-left-hidden');
          localStorage.setItem(STORAGE_LEFT_KEY, 'false');
          toggleLeftBtn.textContent = '◀';
        } else {
          body.setAttribute('data-fullview-left-hidden', '');
          localStorage.setItem(STORAGE_LEFT_KEY, 'true');
          toggleLeftBtn.textContent = '▶';
        }
      });
    }

    if (toggleRightBtn) {
      toggleRightBtn.addEventListener('click', () => {
        const isHidden = body.hasAttribute('data-fullview-right-hidden');
        if (isHidden) {
          body.removeAttribute('data-fullview-right-hidden');
          localStorage.setItem(STORAGE_RIGHT_KEY, 'false');
          toggleRightBtn.textContent = '▶';
        } else {
          body.setAttribute('data-fullview-right-hidden', '');
          localStorage.setItem(STORAGE_RIGHT_KEY, 'true');
          toggleRightBtn.textContent = '◀';
        }
      });
    }

    restoreState();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFullViewMode);
  } else {
    initFullViewMode();
  }
  document.addEventListener('astro:page-load', initFullViewMode);
})();
</script>
`;

// Definición completa de todos los módulos disponibles
const ALL_MODULES = {
	inicio: [
		{ label: 'Presentación del módulo', slug: 'presentacion' },
	],
	odoo: [
		{ label: 'UD1 — Identificación ERP-CRM', slug: 'odoo/ud1' },
		{ label: 'UD2 — Implantación de Odoo', slug: 'odoo/ud2' },
		{ label: 'UD3 — Gestión de Odoo', slug: 'odoo/ud3' },
	],
	spring: [
		{ label: 'UD4 — Introducción a Spring Boot', slug: 'spring/ud4' },
		{ label: 'UD5a — Spring MVC y Thymeleaf', slug: 'spring/ud5a' },
		{ label: 'UD5b — De MVC a REST', slug: 'spring/ud5b' },
		{ label: 'UD5c — DTOs, validación y arquitectura por capas', slug: 'spring/ud5c' },
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
			head: [
				{
					tag: 'script',
					attrs: {
						type: 'text/javascript',
					},
					content: `
					(function() {
						// Crear y insertar los botones en el DOM
						function createFullViewButtons() {
							const leftDiv = document.createElement('div');
							leftDiv.className = 'fullview-toggle-buttons left-side';
							leftDiv.innerHTML = '<button class="fullview-toggle-btn" id="toggle-left-sidebar" title="Ocultar/Mostrar menú lateral izquierdo" aria-label="Alternar menú lateral izquierdo">◀</button>';
							document.body.appendChild(leftDiv);

							const rightDiv = document.createElement('div');
							rightDiv.className = 'fullview-toggle-buttons right-side';
							rightDiv.innerHTML = '<button class="fullview-toggle-btn" id="toggle-right-sidebar" title="Ocultar/Mostrar tabla de contenidos" aria-label="Alternar tabla de contenidos">▶</button>';
							document.body.appendChild(rightDiv);
						}

						function initFullViewMode() {
							// Crear botones si no existen
							if (!document.getElementById('toggle-left-sidebar')) {
								createFullViewButtons();
							}

							const toggleLeftBtn = document.getElementById('toggle-left-sidebar');
							const toggleRightBtn = document.getElementById('toggle-right-sidebar');
							const body = document.body;
							const STORAGE_LEFT_KEY = 'fullview-left-hidden';
							const STORAGE_RIGHT_KEY = 'fullview-right-hidden';

							function restoreState() {
								if (localStorage.getItem(STORAGE_LEFT_KEY) === 'true') {
									body.setAttribute('data-fullview-left-hidden', '');
									if (toggleLeftBtn) toggleLeftBtn.textContent = '▶';
								}
								if (localStorage.getItem(STORAGE_RIGHT_KEY) === 'true') {
									body.setAttribute('data-fullview-right-hidden', '');
									if (toggleRightBtn) toggleRightBtn.textContent = '◀';
								}
							}

							if (toggleLeftBtn) {
								toggleLeftBtn.addEventListener('click', () => {
									const isHidden = body.hasAttribute('data-fullview-left-hidden');
									if (isHidden) {
										body.removeAttribute('data-fullview-left-hidden');
										localStorage.setItem(STORAGE_LEFT_KEY, 'false');
										toggleLeftBtn.textContent = '◀';
									} else {
										body.setAttribute('data-fullview-left-hidden', '');
										localStorage.setItem(STORAGE_LEFT_KEY, 'true');
										toggleLeftBtn.textContent = '▶';
									}
								});
							}

							if (toggleRightBtn) {
								toggleRightBtn.addEventListener('click', () => {
									const isHidden = body.hasAttribute('data-fullview-right-hidden');
									if (isHidden) {
										body.removeAttribute('data-fullview-right-hidden');
										localStorage.setItem(STORAGE_RIGHT_KEY, 'false');
										toggleRightBtn.textContent = '▶';
									} else {
										body.setAttribute('data-fullview-right-hidden', '');
										localStorage.setItem(STORAGE_RIGHT_KEY, 'true');
										toggleRightBtn.textContent = '◀';
									}
								});
							}

							restoreState();
						}

						if (document.readyState === 'loading') {
							document.addEventListener('DOMContentLoaded', initFullViewMode);
						} else {
							initFullViewMode();
						}
						document.addEventListener('astro:page-load', initFullViewMode);
					})();
					`,
				},
			],
			components: {
				Page: './src/overrides/pages/index.astro',
			},
			sidebar: [
				{
					label: 'Inicio',
					items: filterVisibleItems(ALL_MODULES.inicio),
				},
				// Fase Odoo - Solo si hay items visibles
				...(filterVisibleItems(ALL_MODULES.odoo).length > 0 ? [
					{
						label: 'Odoo',
						items: filterVisibleItems(ALL_MODULES.odoo),
					},
				] : []),
				// Fase Spring Boot - Solo si hay items visibles
				...(filterVisibleItems(ALL_MODULES.spring).length > 0 ? [
					{
						label: 'Spring Boot',
						items: filterVisibleItems(ALL_MODULES.spring),
					},
				] : []),
				// Fase Retos ERP Balmis - Solo si hay items visibles
				...(filterVisibleItems(ALL_MODULES.retos).length > 0 ? [
					{
						label: 'Retos - ERP Balmis',
						items: filterVisibleItems(ALL_MODULES.retos),
					},
				] : []),
			],
		}),
	],
});
