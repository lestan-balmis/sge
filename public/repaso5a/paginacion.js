function inicializarPaginacion(idTabla, idPaginacion, filasPorPagina) {
  const tabla = document.getElementById(idTabla);
  if (!tabla) return; // Si la tabla no existe en esta página, no hace nada

  const tbody = tabla.querySelector('tbody');
  const filas = tbody.querySelectorAll('tr');
  const totalFilas = filas.length;
  const totalPaginas = Math.ceil(totalFilas / filasPorPagina);
  const contenedorPaginacion = document.getElementById(idPaginacion);

  if (!contenedorPaginacion) return;

  function mostrarPagina(pagina) {
    const inicio = (pagina - 1) * filasPorPagina;
    const fin = inicio + filasPorPagina;

    filas.forEach((fila, indice) => {
      if (indice >= inicio && indice < fin) {
        fila.style.display = '';
      } else {
        fila.style.display = 'none';
      }
    });

    const botones = contenedorPaginacion.querySelectorAll('.page-item');
    botones.forEach((boton, indice) => {
      const enlace = boton.querySelector('.page-link');
      if (indice + 1 === pagina) {
        // boton.classList.add('active');          Opción por defecto
        // Aplicamos estilos de botón activo en color naranja (warning)
        enlace.classList.add('bg-warning', 'text-dark', 'border-warning');
        // Quitamos el color de texto azul por defecto de Bootstrap
        enlace.classList.remove('text-primary'); 
      } else {
        // boton.classList.remove('active');       Opción por defecto
        // Restauramos el diseño de los botones que no están activos
        enlace.classList.remove('bg-warning', 'text-dark', 'border-warning');
        // Aseguramos que los números no activos mantengan un color sutil (ej. gris oscuro o azul)
        enlace.classList.add('text-secondary'); 
      }
    });
  }

  function crearBotonesPaginacion() {
    contenedorPaginacion.innerHTML = '';

    for (let i = 1; i <= totalPaginas; i++) {
      const li = document.createElement('li');
      li.className = 'page-item';
      
      const a = document.createElement('a');
      a.className = 'page-link';
      a.href = '#';
      a.textContent = i;
      
      a.addEventListener('click', (e) => {
        e.preventDefault();
        mostrarPagina(i);
      });

      li.appendChild(a);
      contenedorPaginacion.appendChild(li);
    }
  }

  // Ejecución inicial
  crearBotonesPaginacion();
  mostrarPagina(1);
}
