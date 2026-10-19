---
// Script que se ejecuta en la compilación para inyectar los botones en Starlight
// Este archivo crea el contenido del componente como un string y lo inyecta

export const injectFullViewToggle = () => {
  const html = `
    <div class="fullview-toggle-buttons left-side">
      <button
        class="fullview-toggle-btn"
        id="toggle-left-sidebar"
        title="Ocultar/Mostrar menú lateral izquierdo"
        aria-label="Alternar menú lateral izquierdo"
      >
        ◀
      </button>
    </div>

    <div class="fullview-toggle-buttons right-side">
      <button
        class="fullview-toggle-btn"
        id="toggle-right-sidebar"
        title="Ocultar/Mostrar tabla de contenidos"
        aria-label="Alternar tabla de contenidos"
      >
        ▶
      </button>
    </div>

    <script type="module">
      function initFullViewMode() {
        const toggleLeftBtn = document.getElementById('toggle-left-sidebar');
        const toggleRightBtn = document.getElementById('toggle-right-sidebar');
        const body = document.body;

        const STORAGE_LEFT_KEY = 'fullview-left-hidden';
        const STORAGE_RIGHT_KEY = 'fullview-right-hidden';

        function restoreState() {
          const leftHidden = localStorage.getItem(STORAGE_LEFT_KEY) === 'true';
          const rightHidden = localStorage.getItem(STORAGE_RIGHT_KEY) === 'true';

          if (leftHidden) {
            body.setAttribute('data-fullview-left-hidden', '');
            updateLeftButtonState(true);
          }
          if (rightHidden) {
            body.setAttribute('data-fullview-right-hidden', '');
            updateRightButtonState(true);
          }
        }

        function updateLeftButtonState(isHidden) {
          if (toggleLeftBtn) {
            toggleLeftBtn.textContent = isHidden ? '▶' : '◀';
            toggleLeftBtn.title = isHidden ? 'Mostrar menú lateral izquierdo' : 'Ocultar menú lateral izquierdo';
          }
        }

        function updateRightButtonState(isHidden) {
          if (toggleRightBtn) {
            toggleRightBtn.textContent = isHidden ? '◀' : '▶';
            toggleRightBtn.title = isHidden ? 'Mostrar tabla de contenidos' : 'Ocultar tabla de contenidos';
          }
        }

        if (toggleLeftBtn) {
          toggleLeftBtn.addEventListener('click', () => {
            const isHidden = body.hasAttribute('data-fullview-left-hidden');
            if (isHidden) {
              body.removeAttribute('data-fullview-left-hidden');
              localStorage.setItem(STORAGE_LEFT_KEY, 'false');
              updateLeftButtonState(false);
            } else {
              body.setAttribute('data-fullview-left-hidden', '');
              localStorage.setItem(STORAGE_LEFT_KEY, 'true');
              updateLeftButtonState(true);
            }
          });
        }

        if (toggleRightBtn) {
          toggleRightBtn.addEventListener('click', () => {
            const isHidden = body.hasAttribute('data-fullview-right-hidden');
            if (isHidden) {
              body.removeAttribute('data-fullview-right-hidden');
              localStorage.setItem(STORAGE_RIGHT_KEY, 'false');
              updateRightButtonState(false);
            } else {
              body.setAttribute('data-fullview-right-hidden', '');
              localStorage.setItem(STORAGE_RIGHT_KEY, 'true');
              updateRightButtonState(true);
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
    </script>
  `;

  return html;
};
