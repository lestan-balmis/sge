---
title: "Repaso 1ª evaluación: Listados de entidades con Spring Boot"
description: Práctica de repaso para el examen de la 1ª evaluación. Entidades JPA, repositorios, datos iniciales y listados MVC con Thymeleaf.
---

> **Teoría requerida:** [UD4 — Introducción a Spring Boot](/sge/spring/ud4) · [UD5a — Spring MVC y Thymeleaf](/sge/spring/ud5a)
> **Repasos de referencia:** [Repaso 1](/sge/repaso1eval/repaso4) · [Repaso 2](/sge/repaso1eval/repaso5a)

## 📌 Enunciado

El Departamento de Informática del IES Doctor Balmis gestiona el préstamo de portátiles a los profesores. Se pide crear una aplicación Spring Boot que **solo muestre listados** de tres entidades: departamentos, profesores y portátiles.

> **No se piden** formularios, altas, bajas ni modificaciones. Todo el trabajo es de lectura de datos y presentación.

Tiempo estimado: **4 horas de clase**.

## 1. Proyecto y configuración

- Crea un proyecto Maven con el nombre **repaso1ev**, Group `com.iesdoctorbalmis` y paquete `com.iesdoctorbalmis.repaso1ev`. Java 25 y Spring Boot 4.1.x.
- Dependencias: **Spring Web**, **Spring Data JPA**, **H2 Database**, **Lombok**, **Thymeleaf** y **Spring Boot DevTools**.
- En `application.properties` usa la misma configuración que en el [Repaso 1](/sge/repaso1eval/repaso4): puerto `9000`, H2 en memoria, consola H2 en `/h2-console`, `ddl-auto=create-drop`, `import.sql` como datos iniciales y `open-in-view=false`.

## 2. Modelo de datos (entidades JPA)

Crea las entidades en el paquete `entity`. Usa `@Entity`, `@Table`, `@Id` con `GenerationType.IDENTITY` y las anotaciones `@Column` necesarias.

### 2.1 Departamento (tabla `departamentos`)

| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | `Long` | Clave primaria |
| `codigo` | `String` | Obligatorio, único, máximo 10 caracteres |
| `nombre` | `String` | Obligatorio, máximo 60 caracteres |
| `planta` | `Integer` | Planta del edificio donde está el departamento |

### 2.2 Profesor (tabla `profesores`)

| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | `Long` | Clave primaria |
| `nombre` | `String` | Obligatorio, máximo 40 caracteres |
| `apellidos` | `String` | Obligatorio, máximo 80 caracteres |
| `email` | `String` | Único, máximo 100 caracteres |
| `activo` | `boolean` | Obligatorio |
| `departamentoId` | `Long` | Columna `departamento_id`, obligatoria (solo el ID, sin relación JPA) |

### 2.3 Portátil (tabla `portatiles`)

| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | `Long` | Clave primaria |
| `codigo` | `String` | Obligatorio, único, máximo 15 caracteres (ej. `PORT-001`) |
| `marca` | `String` | Obligatorio, máximo 40 caracteres |
| `modelo` | `String` | Obligatorio, máximo 40 caracteres |
| `ram` | `Integer` | Memoria en GB |
| `estado` | `EstadoPortatil` | Enum guardado como texto, obligatorio |
| `profesorId` | `Long` | Columna `profesor_id`, **puede ser nula** (un portátil disponible no tiene profesor, solo el ID, sin relación JPA) |
| `fechaAlta` | `LocalDate` | Obligatoria |

### 2.4 Enum `EstadoPortatil`

Crea el enum en el paquete `entity` con cuatro valores. Cada valor tiene una descripción en español que se mostrará en la web:

| Valor | Descripción |
|---|---|
| `DISPONIBLE` | Disponible |
| `PRESTADO` | Prestado |
| `REPARACION` | En reparación |
| `BAJA` | De baja |

Para ello, el enum debe tener un atributo `descripcion` con su getter.

> Usa Lombok (`@Data`, `@NoArgsConstructor`, `@AllArgsConstructor`) en las entidades, como en el Repaso 1.

## 3. Repositorios JPA

Crea los repositorios en el paquete `repository`, extendiendo `JpaRepository`:

```java
public interface DepartamentoRepository extends JpaRepository<Departamento, Long> {
}

public interface ProfesorRepository extends JpaRepository<Profesor, Long> {
}

public interface PortatilRepository extends JpaRepository<Portatil, Long> {
}
```

Cada repositorio tendrá automáticamente los métodos básicos como `findAll()`, `findById()`, `save()`, `delete()`, etc. **El ordenamiento y filtrado se hará en los controladores** usando las colecciones de Java (streams, lambdas, etc.).

## 4. Datos iniciales (`import.sql`)

Crea `src/main/resources/import.sql` con datos suficientes para que los listados tengan contenido variado:

- Mínimo **4 departamentos**.
- Mínimo **8 profesores**, con al menos **2 inactivos** y repartidos entre distintos departamentos.
- Mínimo **15 portátiles**, con **todos los estados** representados y al menos **3 disponibles sin profesor**.

Recuerda el orden de inserción: departamentos, después profesores y por último portátiles, porque hay claves ajenas.

## 5. Controladores MVC y listados

Crea tres controladores en el paquete `controller`. Cada uno inyecta sus repositorios **por constructor** y usa los métodos básicos como `findAll()`. **El ordenamiento y filtrado se hace en el controlador** usando streams de Java:

| Controlador | Repositorios inyectados | Ruta | Plantilla | Contenido |
|---|---|---|---|---|
| `DepartamentosController` | `DepartamentoRepository` | `/departamentos` | `departamentos/lista` | Departamentos ordenados por nombre (usando `stream().sorted(...)`) |
| `ProfesoresController` | `ProfesorRepository`, `DepartamentoRepository` | `/profesores` | `profesores/lista` | Profesores ordenados por apellidos (con stream), enriquecidos con el nombre de su departamento |
| `PortatilesController` | `PortatilRepository`, `ProfesorRepository` | `/portatiles` | `portatiles/lista` | Portátiles ordenados por código (con stream), opcionalmente filtrados por estado |

**Filtro de portátiles:** el método de `/portatiles` recibe un parámetro opcional `estado` (`@RequestParam(required = false)`). Si no llega, muestra todos ordenados por código; si llega, filtra solo los de ese estado ordenados por código. Así `/portatiles?estado=DISPONIBLE` funciona. Usa streams para filtrar y ordenar.

## 6. Plantillas Thymeleaf

- **Layout común:** crea `templates/fragments/layout.html` reutilizando el fragmento del [Repaso 2](/sge/repaso1eval/repaso5a). Añade una barra de navegación con enlaces a los tres listados, usando `@{...}`.
- **`departamentos/lista.html`:** tabla con id, código, nombre y planta.
- **`profesores/lista.html`:** tabla con nombre completo, email, nombre del departamento y una insignia (`badge`) verde si está activo o gris si no lo está (usa `th:classappend`).
  - El nombre del departamento se obtiene del mapa o lista que el controlador pasa al modelo.
- **`portatiles/lista.html`:** tabla con código, marca y modelo, RAM, estado y profesor. Requisitos:
  - El estado se muestra con su **descripción** y con un color distinto para cada valor.
  - Si el portátil no tiene profesor (profesorId es nulo), se muestra el texto **"Sin asignar"**.
  - Si tiene profesor, se muestra el nombre completo del profesor (obtenido del mapa que pasa el controlador).
  - Encima de la tabla aparecen enlaces para filtrar por cada estado y para ver todos. Muestra también el **número de resultados** con `#lists.size`.

## 7. Ampliación opcional

Si terminas antes, puedes añadir cualquiera de estas mejoras:

- Resaltar en la navegación el enlace de la sección activa.
- Mostrar en la cabecera de `/portatiles` el estado filtrado, por ejemplo: "Mostrando: Prestado (5)".
- Hacer que el filtro por estado funcione también con un `<select>` dentro de un formulario `GET`.

## 8. Pistas

- Recuerda usar `@Column(name = "departamento_id")` en la entidad Profesor para mapear el campo `departamentoId` con la columna `departamento_id` en la base de datos.
- En el controlador de Profesores:
  - Usa `profesorRepository.findAll()` para obtener todos los profesores.
  - Ordénalos por apellidos con `stream().sorted(Comparator.comparing(Profesor::getApellidos)).collect(Collectors.toList())`.
  - Busca todos los departamentos con `departamentoRepository.findAll()` y crea un `Map<Long, String>` con ID → nombre.
  - Pasa ambos al modelo.
- En el controlador de Portátiles:
  - Usa `portatilRepository.findAll()` para obtener todos los portátiles.
  - Si llega parámetro `estado`, filtra con `stream().filter(p -> p.getEstado().equals(estadoParam))`.
  - Ordena siempre por código.
  - Busca todos los profesores y crea un `Map<Long, String>` con ID → nombre completo.
  - Pasa los portátiles y el mapa al modelo.
- Para comprobar los datos, abre `http://localhost:9000/h2-console` y consulta las tres tablas.

## 9. Planificación sugerida (4 horas)

| Bloque | Tiempo | Contenido |
|---|---|---|
| 1 | 30 min | Crear el proyecto y configurar `application.properties` |
| 2 | 45 min | Entidades, enum `EstadoPortatil` y relaciones |
| 3 | 45 min | Repositorios, consultas y `import.sql`. Comprobar en H2 |
| 4 | 60 min | Controladores y listados, incluido el filtro |
| 5 | 45 min | Layout y plantillas Thymeleaf |
| 6 | 15 min | Pruebas en el navegador y revisión |
| — | 60 min | Ampliación opcional y depuración de errores |

## 10. Entrega

### Estructura esperada

```
src/
└── main/
    ├── java/com/iesdoctorbalmis/repaso1ev/
    │   ├── Repaso1evApplication.java
    │   ├── controller/
    │   │   ├── DepartamentosController.java
    │   │   ├── ProfesoresController.java
    │   │   └── PortatilesController.java
    │   ├── entity/
    │   │   ├── Departamento.java
    │   │   ├── Profesor.java
    │   │   ├── Portatil.java
    │   │   └── EstadoPortatil.java
    │   └── repository/
    │       ├── DepartamentoRepository.java
    │       ├── ProfesorRepository.java
    │       └── PortatilRepository.java
    └── resources/
        ├── application.properties
        ├── import.sql
        └── templates/
            ├── fragments/layout.html
            ├── departamentos/lista.html
            ├── profesores/lista.html
            └── portatiles/lista.html
```

### Comprobación final

Con la aplicación en marcha (`mvn spring-boot:run`), estas URLs deben funcionar:

| URL | Resultado esperado |
|---|---|
| `http://localhost:9000/departamentos` | Listado de departamentos ordenados por nombre |
| `http://localhost:9000/profesores` | Listado de profesores con su departamento |
| `http://localhost:9000/portatiles` | Listado completo de portátiles, incluidos los que no tienen profesor |
| `http://localhost:9000/portatiles?estado=DISPONIBLE` | Solo portátiles disponibles |
| `http://localhost:9000/h2-console` | Consola H2 con las tres tablas |

### Requisitos de entrega

1. **Repositorio Git:** crea un repositorio en tu organización llamado **Repaso1ev_Apellido1_Nombre** (ejemplo: **Repaso1ev_Estañ_Luis**).
2. **Commits:** haz commits a medida que avanzas, con mensajes descriptivos (ej.: "Añadir entidades JPA", "Crear consultas con JOIN FETCH", "Añadir filtro por estado en portátiles").
3. **Subida:** usa el Control de Código Fuente de VS Code para hacer commit y push.

## 11. Criterios de evaluación

| Criterio | Puntos |
|---|---|
| Entidades y enum, mapeo correcto de campos (anotaciones `@Column` para IDs) | 2 |
| Repositorios extendiendo JpaRepository (sin consultas personalizadas) | 1 |
| Datos iniciales en `import.sql` que cumplen los mínimos | 1 |
| Controladores con inyección por constructor, uso de streams para ordenar/filtrar, enriquecimiento con mapas | 3 |
| Plantillas con layout, `th:each`, `th:classappend`, uso de mapas para mostrar nombres | 2 |
| Ampliación opcional | +1 |

---

## 12. Soluciones de referencia (solo para el profesor)

### 12.1 Entidades JPA

#### EstadoPortatil.java

```java
package com.iesdoctorbalmis.repaso1ev.entity;

public enum EstadoPortatil {
    DISPONIBLE("Disponible"),
    PRESTADO("Prestado"),
    REPARACION("En reparación"),
    BAJA("De baja");

    private final String descripcion;

    EstadoPortatil(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
```

#### Departamento.java

```java
package com.iesdoctorbalmis.repaso1ev.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "departamentos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Departamento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 10, nullable = false, unique = true)
    private String codigo;

    @Column(length = 60, nullable = false)
    private String nombre;

    private Integer planta;
}
```

#### Profesor.java

```java
package com.iesdoctorbalmis.repaso1ev.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "profesores")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Profesor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 40, nullable = false)
    private String nombre;

    @Column(length = 80, nullable = false)
    private String apellidos;

    @Column(length = 100, unique = true)
    private String email;

    @Column(nullable = false)
    private boolean activo;

    @Column(name = "departamento_id", nullable = false)
    private Long departamentoId;
}
```

#### Portatil.java

```java
package com.iesdoctorbalmis.repaso1ev.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "portatiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Portatil {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 15, nullable = false, unique = true)
    private String codigo;

    @Column(length = 40, nullable = false)
    private String marca;

    @Column(length = 40, nullable = false)
    private String modelo;

    private Integer ram;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoPortatil estado;

    @Column(name = "profesor_id")
    private Long profesorId;

    @Column(nullable = false)
    private LocalDate fechaAlta;
}
```

### 12.2 Repositorios

#### DepartamentoRepository.java

```java
package com.iesdoctorbalmis.repaso1ev.repository;

import com.iesdoctorbalmis.repaso1ev.entity.Departamento;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartamentoRepository extends JpaRepository<Departamento, Long> {
}
```

#### ProfesorRepository.java

```java
package com.iesdoctorbalmis.repaso1ev.repository;

import com.iesdoctorbalmis.repaso1ev.entity.Profesor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfesorRepository extends JpaRepository<Profesor, Long> {
}
```

#### PortatilRepository.java

```java
package com.iesdoctorbalmis.repaso1ev.repository;

import com.iesdoctorbalmis.repaso1ev.entity.Portatil;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PortatilRepository extends JpaRepository<Portatil, Long> {
}
```

### 12.3 Controladores

#### DepartamentosController.java

```java
package com.iesdoctorbalmis.repaso1ev.controller;

import com.iesdoctorbalmis.repaso1ev.repository.DepartamentoRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Comparator;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/departamentos")
public class DepartamentosController {
    private final DepartamentoRepository departamentoRepository;

    public DepartamentosController(DepartamentoRepository departamentoRepository) {
        this.departamentoRepository = departamentoRepository;
    }

    @GetMapping
    public String lista(Model model) {
        var departamentos = departamentoRepository.findAll().stream()
                .sorted(Comparator.comparing(d -> d.getNombre()))
                .collect(Collectors.toList());
        model.addAttribute("departamentos", departamentos);
        return "departamentos/lista";
    }
}
```

#### ProfesoresController.java

```java
package com.iesdoctorbalmis.repaso1ev.controller;

import com.iesdoctorbalmis.repaso1ev.entity.Profesor;
import com.iesdoctorbalmis.repaso1ev.repository.DepartamentoRepository;
import com.iesdoctorbalmis.repaso1ev.repository.ProfesorRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Comparator;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/profesores")
public class ProfesoresController {
    private final ProfesorRepository profesorRepository;
    private final DepartamentoRepository departamentoRepository;

    public ProfesoresController(ProfesorRepository profesorRepository, 
                                DepartamentoRepository departamentoRepository) {
        this.profesorRepository = profesorRepository;
        this.departamentoRepository = departamentoRepository;
    }

    @GetMapping
    public String lista(Model model) {
        var profesores = profesorRepository.findAll().stream()
                .sorted(Comparator.comparing(Profesor::getApellidos))
                .collect(Collectors.toList());
        
        Map<Long, String> departamentosPorId = departamentoRepository.findAll().stream()
                .collect(Collectors.toMap(d -> d.getId(), d -> d.getNombre()));
        
        model.addAttribute("profesores", profesores);
        model.addAttribute("departamentosPorId", departamentosPorId);
        return "profesores/lista";
    }
}
```

#### PortatilesController.java

```java
package com.iesdoctorbalmis.repaso1ev.controller;

import com.iesdoctorbalmis.repaso1ev.entity.EstadoPortatil;
import com.iesdoctorbalmis.repaso1ev.entity.Portatil;
import com.iesdoctorbalmis.repaso1ev.repository.PortatilRepository;
import com.iesdoctorbalmis.repaso1ev.repository.ProfesorRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/portatiles")
public class PortatilesController {
    private final PortatilRepository portatilRepository;
    private final ProfesorRepository profesorRepository;

    public PortatilesController(PortatilRepository portatilRepository,
                               ProfesorRepository profesorRepository) {
        this.portatilRepository = portatilRepository;
        this.profesorRepository = profesorRepository;
    }

    @GetMapping
    public String lista(@RequestParam(required = false) String estado, Model model) {
        List<Portatil> portatiles = portatilRepository.findAll().stream()
                .filter(p -> estado == null || p.getEstado().name().equals(estado))
                .sorted(Comparator.comparing(Portatil::getCodigo))
                .collect(Collectors.toList());
        
        Map<Long, String> profesoresPorId = profesorRepository.findAll().stream()
                .collect(Collectors.toMap(
                    p -> p.getId(), 
                    p -> p.getNombre() + " " + p.getApellidos()
                ));
        
        model.addAttribute("portatiles", portatiles);
        model.addAttribute("profesoresPorId", profesoresPorId);
        model.addAttribute("estadoSeleccionado", estado);
        return "portatiles/lista";
    }
}
```

### 12.4 Datos iniciales (import.sql)

```sql
-- Departamentos
INSERT INTO departamentos (codigo, nombre, planta) VALUES ('INF', 'Informática', 2);
INSERT INTO departamentos (codigo, nombre, planta) VALUES ('MAT', 'Matemáticas', 1);
INSERT INTO departamentos (codigo, nombre, planta) VALUES ('FIS', 'Física', 1);
INSERT INTO departamentos (codigo, nombre, planta) VALUES ('LEN', 'Lengua', 3);

-- Profesores
INSERT INTO profesores (nombre, apellidos, email, activo, departamento_id) VALUES ('Juan', 'García López', 'juan.garcia@iesdoctorbalmis.es', true, 1);
INSERT INTO profesores (nombre, apellidos, email, activo, departamento_id) VALUES ('María', 'Rodríguez Martín', 'maria.rodriguez@iesdoctorbalmis.es', true, 1);
INSERT INTO profesores (nombre, apellidos, email, activo, departamento_id) VALUES ('Carlos', 'López Fernández', 'carlos.lopez@iesdoctorbalmis.es', false, 2);
INSERT INTO profesores (nombre, apellidos, email, activo, departamento_id) VALUES ('Elena', 'Martínez García', 'elena.martinez@iesdoctorbalmis.es', true, 2);
INSERT INTO profesores (nombre, apellidos, email, activo, departamento_id) VALUES ('Pedro', 'Sánchez Díaz', 'pedro.sanchez@iesdoctorbalmis.es', true, 3);
INSERT INTO profesores (nombre, apellidos, email, activo, departamento_id) VALUES ('Rosa', 'Fernández López', 'rosa.fernandez@iesdoctorbalmis.es', false, 3);
INSERT INTO profesores (nombre, apellidos, email, activo, departamento_id) VALUES ('Luis', 'Gómez Torres', 'luis.gomez@iesdoctorbalmis.es', true, 4);
INSERT INTO profesores (nombre, apellidos, email, activo, departamento_id) VALUES ('Ana', 'Jiménez Ruiz', 'ana.jimenez@iesdoctorbalmis.es', true, 4);

-- Portátiles
INSERT INTO portatiles (codigo, marca, modelo, ram, estado, profesor_id, fecha_alta) VALUES ('PORT-001', 'Dell', 'Latitude 5550', 16, 'DISPONIBLE', NULL, '2025-01-15');
INSERT INTO portatiles (codigo, marca, modelo, ram, estado, profesor_id, fecha_alta) VALUES ('PORT-002', 'HP', 'ProBook 450', 8, 'DISPONIBLE', NULL, '2025-01-15');
INSERT INTO portatiles (codigo, marca, modelo, ram, estado, profesor_id, fecha_alta) VALUES ('PORT-003', 'Lenovo', 'ThinkPad E16', 16, 'PRESTADO', 1, '2025-01-10');
INSERT INTO portatiles (codigo, marca, modelo, ram, estado, profesor_id, fecha_alta) VALUES ('PORT-004', 'Dell', 'Latitude 5440', 8, 'PRESTADO', 2, '2025-01-10');
INSERT INTO portatiles (codigo, marca, modelo, ram, estado, profesor_id, fecha_alta) VALUES ('PORT-005', 'HP', 'EliteBook 840', 16, 'PRESTADO', 4, '2025-01-08');
INSERT INTO portatiles (codigo, marca, modelo, ram, estado, profesor_id, fecha_alta) VALUES ('PORT-006', 'Lenovo', 'ThinkPad X1', 32, 'REPARACION', NULL, '2024-12-20');
INSERT INTO portatiles (codigo, marca, modelo, ram, estado, profesor_id, fecha_alta) VALUES ('PORT-007', 'Dell', 'Latitude 3000', 4, 'BAJA', NULL, '2023-06-01');
INSERT INTO portatiles (codigo, marca, modelo, ram, estado, profesor_id, fecha_alta) VALUES ('PORT-008', 'ASUS', 'VivoBook 14', 8, 'DISPONIBLE', NULL, '2025-02-01');
INSERT INTO portatiles (codigo, marca, modelo, ram, estado, profesor_id, fecha_alta) VALUES ('PORT-009', 'HP', 'Pavilion 15', 8, 'REPARACION', NULL, '2025-01-25');
INSERT INTO portatiles (codigo, marca, modelo, ram, estado, profesor_id, fecha_alta) VALUES ('PORT-010', 'Lenovo', 'IdeaPad 5', 16, 'PRESTADO', 5, '2025-01-12');
INSERT INTO portatiles (codigo, marca, modelo, ram, estado, profesor_id, fecha_alta) VALUES ('PORT-011', 'Dell', 'Latitude 5550', 16, 'PRESTADO', 7, '2025-01-14');
INSERT INTO portatiles (codigo, marca, modelo, ram, estado, profesor_id, fecha_alta) VALUES ('PORT-012', 'HP', 'ZBook Fury', 32, 'PRESTADO', 8, '2025-01-11');
INSERT INTO portatiles (codigo, marca, modelo, ram, estado, profesor_id, fecha_alta) VALUES ('PORT-013', 'ASUS', 'ROG Book', 16, 'REPARACION', NULL, '2025-01-20');
INSERT INTO portatiles (codigo, marca, modelo, ram, estado, profesor_id, fecha_alta) VALUES ('PORT-014', 'Lenovo', 'ThinkBook 13', 8, 'BAJA', NULL, '2023-11-15');
INSERT INTO portatiles (codigo, marca, modelo, ram, estado, profesor_id, fecha_alta) VALUES ('PORT-015', 'Dell', 'Inspiron 15', 8, 'DISPONIBLE', NULL, '2024-10-05');
```

### 12.5 Plantillas Thymeleaf

#### templates/departamentos/lista.html

```html
<!DOCTYPE html>
<html lang="es" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Departamentos</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">
            <a class="navbar-brand" href="/">Gestor de Portátiles</a>
            <div class="collapse navbar-collapse">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item"><a class="nav-link" th:href="@{/departamentos}">Departamentos</a></li>
                    <li class="nav-item"><a class="nav-link" th:href="@{/profesores}">Profesores</a></li>
                    <li class="nav-item"><a class="nav-link" th:href="@{/portatiles}">Portátiles</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <div class="container mt-4">
        <h1>Listado de Departamentos</h1>
        <table class="table table-striped table-hover">
            <thead class="table-dark">
                <tr>
                    <th>ID</th>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Planta</th>
                </tr>
            </thead>
            <tbody>
                <tr th:each="dept : ${departamentos}">
                    <td th:text="${dept.id}"></td>
                    <td th:text="${dept.codigo}"></td>
                    <td th:text="${dept.nombre}"></td>
                    <td th:text="${dept.planta}"></td>
                </tr>
            </tbody>
        </table>
    </div>
</body>
</html>
```

#### templates/profesores/lista.html

```html
<!DOCTYPE html>
<html lang="es" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profesores</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">
            <a class="navbar-brand" href="/">Gestor de Portátiles</a>
            <div class="collapse navbar-collapse">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item"><a class="nav-link" th:href="@{/departamentos}">Departamentos</a></li>
                    <li class="nav-item"><a class="nav-link" th:href="@{/profesores}">Profesores</a></li>
                    <li class="nav-item"><a class="nav-link" th:href="@{/portatiles}">Portátiles</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <div class="container mt-4">
        <h1>Listado de Profesores</h1>
        <table class="table table-striped table-hover">
            <thead class="table-dark">
                <tr>
                    <th>Nombre Completo</th>
                    <th>Email</th>
                    <th>Departamento</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
                <tr th:each="prof : ${profesores}">
                    <td th:text="${prof.nombre} + ' ' + ${prof.apellidos}"></td>
                    <td th:text="${prof.email}"></td>
                    <td th:text="${departamentosPorId.get(prof.departamentoId)}"></td>
                    <td>
                        <span th:if="${prof.activo}" class="badge bg-success">Activo</span>
                        <span th:unless="${prof.activo}" class="badge bg-secondary">Inactivo</span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</body>
</html>
```

#### templates/portatiles/lista.html

```html
<!DOCTYPE html>
<html lang="es" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portátiles</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        .badge-disponible { background-color: #28a745; }
        .badge-prestado { background-color: #007bff; }
        .badge-reparacion { background-color: #ffc107; color: black; }
        .badge-baja { background-color: #6c757d; }
    </style>
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">
            <a class="navbar-brand" href="/">Gestor de Portátiles</a>
            <div class="collapse navbar-collapse">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item"><a class="nav-link" th:href="@{/departamentos}">Departamentos</a></li>
                    <li class="nav-item"><a class="nav-link" th:href="@{/profesores}">Profesores</a></li>
                    <li class="nav-item"><a class="nav-link" th:href="@{/portatiles}">Portátiles</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <div class="container mt-4">
        <h1>Listado de Portátiles</h1>
        
        <div class="btn-group mb-3" role="group">
            <a th:href="@{/portatiles}" class="btn btn-outline-primary">Todos</a>
            <a th:href="@{/portatiles?estado=DISPONIBLE}" class="btn btn-outline-success">Disponibles</a>
            <a th:href="@{/portatiles?estado=PRESTADO}" class="btn btn-outline-info">Prestados</a>
            <a th:href="@{/portatiles?estado=REPARACION}" class="btn btn-outline-warning">En reparación</a>
            <a th:href="@{/portatiles?estado=BAJA}" class="btn btn-outline-secondary">De baja</a>
        </div>

        <p class="text-muted">Resultados: <strong th:text="${#lists.size(portatiles)}"></strong></p>

        <table class="table table-striped table-hover">
            <thead class="table-dark">
                <tr>
                    <th>Código</th>
                    <th>Marca</th>
                    <th>Modelo</th>
                    <th>RAM (GB)</th>
                    <th>Estado</th>
                    <th>Profesor</th>
                </tr>
            </thead>
            <tbody>
                <tr th:each="port : ${portatiles}">
                    <td th:text="${port.codigo}"></td>
                    <td th:text="${port.marca}"></td>
                    <td th:text="${port.modelo}"></td>
                    <td th:text="${port.ram}"></td>
                    <td>
                        <span class="badge" 
                              th:classappend="'badge-' + ${port.estado.name().toLowerCase()}"
                              th:text="${port.estado.descripcion}"></span>
                    </td>
                    <td>
                        <span th:if="${port.profesorId != null}" 
                              th:text="${profesoresPorId.get(port.profesorId)}"></span>
                        <span th:unless="${port.profesorId != null}" class="text-muted">Sin asignar</span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</body>
</html>
```

