---
title: "Repaso 3: UD5b + Reto 3"
description: Transformar los controladores MVC del Repaso 2 en una primera API REST con @RestController.
---

> **Teoría requerida:** [UD5b — De MVC a REST](/sge/spring/ud5b)                        
> **Reto anterior:** [Repaso 2: UD5a + Reto 2](/sge/repaso1eval/repaso5a)

## 📌 Resumen del trabajo a realizar

En est tercera parte trabajaremos lo siguiente:
- **`@RestController`:** La diferencia con `@Controller` explicada con código
- **Endpoints GET JSON:** Libros y Cursos devueltos en formato JSON
- **404 con `ResponseEntity`:** Respuesta HTTP correcta cuando el recurso no existe
- **Coexistencia MVC + REST:** Las vistas Thymeleaf y la API comparten los mismos repositorios
- **Navegador:** Verificación de los endpoints con la herramienta de API

> **Conceptos teóricos:** La diferencia entre `@Controller` y `@RestController`, Jackson y los códigos de estado HTTP se explican en [UD5b — secciones 5 a 8](/sge/spring/ud5b).

## 1. Preparación

### Crea una copia del proyecto
- Continuaremos el proyecto anterior desde tu carpeta de trabajo **workspace-spring**, llamado **spring**, por lo que no tendremos que hacer nada. 
- Desde el IDE de VSCode, añadiremos la capa REST

## 2. `LibroRestController`

Dentro de la carpeta `controller` creamos la carpeta `rest`.
Dentro de la carpeta `rest` creamos el fichero `LibroRestController.java`, de forma similar al `ClienteRestController` del `Reto 3`.

## 3. `CursoRestController`

Dentro de la carpeta `rest` creamos el fichero `CursoRestController.java`, de forma similar al `ProductoRestController` del `Reto 3`.

## 4. Ejecución

Ejecutamos de forma gráfica con el icono lateral de `Spring Boot Dashboard`, o desde el terminal.

```bash
# Compilar
mvn spring-boot:run
```

### URLs disponibles

Las rutas MVC siguen funcionando. Se añaden los nuevos endpoints REST:

| URL | Tipo | Respuesta |
|---|---|---|
| `http://localhost:9000/` | MVC | HTML — Panel de Inicio |
| `http://localhost:9000/alumnos` | MVC | HTML — Tabla de alumnos |
| `http://localhost:9000/cursos` | MVC | HTML — Tabla de cursos |
| `http://localhost:9000/libros` | MVC | HTML — Tabla de libros |
| `http://localhost:9000/api/libros` | REST | JSON — Lista de libros |
| `http://localhost:9000/api/libros/{id}` | REST | JSON — Libro o 404 |
| `http://localhost:9000/api/cursos` | REST | JSON — Lista de cursos |
| `http://localhost:9000/h2-console` | Admin | Consola H2 |

### Prueba en el navegador

Los endpoints GET se pueden probar directamente en el navegador y verse el JSON en la pantalla.

Se pueden probar estas peticiones:
- `http://localhost:9000/api/libros`

   ![Api Libros](/sge/repaso5b/repaso5b_api_libros.png)

- `http://localhost:9000/api/libros/1`

   ![Api Libros 1](/sge/repaso5b/repaso5b_api_libros_1.png)

- `http://localhost:9000/api/libros/999` ← debe devolver **404**

   ![Api Libros 999](/sge/repaso5b/repaso5b_api_libros_999.png)

- `http://localhost:9000/api/cursos`

   ![Api Cursos](/sge/repaso5b/repaso5b_api_cursos.png)

## 5. Entrega del Repaso 3

### Estructura esperada

La estructura final del proyecto será:

```
src/
└── main/
    ├── java/com/iesdoctorbalmis/spring/
    │   ├── Application.java
    │   ├── controller/              (sin cambios — MVC del Repaso 2)
    │   │   ├── HomeController.java
    │   │   ├── AlumnosController.java
    │   │   ├── CursosController.java
    │   │   └── LibrosController.java
    │   ├── controller/rest/         ← NUEVO en Reto 3
    │   │   ├── LibroRestController.java
    │   │   └── CursoRestController.java
    │   ├── entity/                  (sin cambios)
    │   └── repository/              (sin cambios)
    └── resources/                   (sin cambios — MVC del Repaso 2)
```

> El pom.xml, application.properties, import.sql y las plantillas Thymeleaf no cambian.


### Requisitos de entrega

1. **Repositorio Git:** Actualiza el repositorio en tu organización con el nombre **Repaso1ev_Apellido1_Nombre** (ejemplo: **Repaso1ev_Estañ_Luis**)

2. **Commits en Git:** 
   - Realiza commits necesarios conforme avanzas en el reto.
   - Usa mensajes descriptivos (ej: "Añadir anotaciones JPA", "Configurar H2 database", etc.)
   - Usa Control de Código Fuente en VSCode para hacer commit y push

3. **.gitignore:** Asegúrate de que tu repositorio incluya un `.gitignore` con contenido mínimo:
   ```
   target/
   .DS_Store
   .vscode/
   .idea/
   *.log
   ```

4. **README.md:** Incluye un archivo `README.md` con:
   - Título del reto
   - Descripción breve
   - Instrucciones para ejecutar la aplicación

5. **Push al repositorio:** Sube todos tus cambios a la rama `main` de tu repositorio remoto antes de la fecha de entrega

6. **Acceso al profesor:** Asegúrate de que tu profesor tiene acceso a tu organización para revisar el trabajo

---
