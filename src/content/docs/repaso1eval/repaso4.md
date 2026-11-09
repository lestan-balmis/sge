---
title: "Repaso 1: UD4 + Reto 0 + Reto 1"
description: Comenzar el nuevo proyecto siguiendo la UD4 y los Retos 0 y 1.
---

> **Teoría requerida:** [UD4 — Introducción a Spring Boot](/sge/spring/ud4)  
> **Retos anteriores:** [Reto 0 — La Semilla](/sge/retos/reto0) - [Reto 1 — De la Semilla a la Raíz](/sge/retos/reto1)

## Explicación del proyecto

- Se trata de un proyecto para gestionar la Xarxallibres de un instituto.
- En esta primera parte se creará el proyecto, las entidades, los repositorios y se cargarán los datos iniciales.
- Al final, obtendremos los datos en H2-console.

## 1. Creación del proyecto con VS Code

- Desde tu carpeta de trabajo **workspace-spring**, cambia el nombre de **spring** por **reto3**. 
- Abre la Paleta de Comandos: **Ctrl+Shift+P**
- Escribe: **"Spring Initializr: Create a Maven Project"**
- Selecciona **"Crear un Proyecto Maven"**
- Se abrirá VS Code con un asistente para crear el proyecto

### Configuración del Proyecto

Rellena los campos siguientes:

| Campo | Valor |
|---|---|
| **Project** | Maven Project |
| **Spring Boot** | 4.1.x (la versión más reciente disponible) |
| **Language** | Java |
| **Project Metadata → Group** | `com.iesdoctorbalmis` |
| **Project Metadata → Artifact** | `spring` |
| **Project Metadata → Name** | `spring` |
| **Project Metadata → Package name** | `com.iesdoctorbalmis.spring` |
| **Project Metadata → Description** | `Xarxallibres` |
| **Packaging** | Jar |
| **Java** | 25 |

### Seleccionar Dependencias

Haz clic en **"Add Dependencies"** y selecciona:

- **Spring Web** → Proporciona `@RestController` y permite iniciar un servidor web.
- **Spring Data JPA** → Para JPA + Hibernate.
- **H2 Database** → Base de datos en memoria; la usaremos en Reto 1.
- **Lombok** → Genera automáticamente getters, setters y constructores.
- **Validation** → Anotaciones `@NotBlank`, `@Email` para validaciones.
- **Spring Boot DevTools** → Reinicio automático del servidor al guardar cambios durante el desarrollo.
- **Thymeleaf** → Motor de plantillas HTML integrado con Spring Boot

Sigue el asistente y confirma los parámetros indicados en el paso anterior, para guardar el proyecto en la carpeta de trabajo **workspace-spring**. VS Code creará automáticamente la estructura del proyecto.

### Verificación del proyecto en VS Code

Una vez creado, VS Code abrirá automáticamente el proyecto. Verás notificaciones de descarga de dependencias Maven en la esquina inferior derecha.

## 2. Modelado del Dominio: Entidades POJO

Antes de crear las entidades, crea la carpeta `model` dentro del paquete principal. En VS Code, haz clic derecho sobre `src/main/java/com/iesdoctorbalmis/spring/` y selecciona **Nueva Carpeta**, con el nombre `model`.

La estructura quedará así:

```
src/main/java/com/iesdoctorbalmis/spring/
└── model/
    ├── Alumnos.java
    ├── TipoAlumno.java
    ├── Cursos.java
    └── Libros.java
```

### 2.1 Entidad Alumnos

Crea la clase `src/main/java/com/iesdoctorbalmis/spring/model/Alumnos.java`:

```java
package com.iesdoctorbalmis.spring.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data 
@NoArgsConstructor 
@AllArgsConstructor 
public class Alumnos {
    private Long id;
    private String nombre;
    private String apellido1;
    private String apellido2;
    private TipoAlumno tipoAlumno;
    private String curso;
}
```

### 2.2 Entidad TipoAlumno

Crea la clase `src/main/java/com/iesdoctorbalmis/spring/model/TipoAlumno.java`:

```java
package com.iesdoctorbalmis.spring.model;

public enum TipoAlumno {
    A,
    B,
    F,
    M,
    P,
    U,
    X;
 }

```

### 2.3 Entidad Cursos

Crea la clase `src/main/java/com/iesdoctorbalmis/spring/model/Cursos.java`:

```java
package com.iesdoctorbalmis.spring.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cursos {
    private Long id;
    private String curso;
    private String descripcion;
    private Integer numGrupos;
    private Integer numAlumnos;
}
```

### 2.4 Entidad Libros

Crea la clase `src/main/java/com/iesdoctorbalmis/spring/model/Libros.java`:

```java
package com.iesdoctorbalmis.spring.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data 
@NoArgsConstructor 
@AllArgsConstructor 
public class Libros {
    private Long id;
    private String curso;
    private String area;
    private String isbn;
    private String titulo;
    private String observaciones;
    private String imagen;
    private Integer cantidad;
}
```

## 3. Anotaciones JPA

Mueve las entidades de `model/` a `entity/`, asegurándote que se han actualizado los `package`. Transforma tus POJOs añadiendo `@Entity` y anotaciones de columnas.

**Alumnos.java**

Abre o crea: `src/main/java/com/iesdoctorbalmis/spring/entity/Alumnos.java`

```java
package com.iesdoctorbalmis.spring.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "alumnos")
@Data 
@NoArgsConstructor 
@AllArgsConstructor 
public class Alumnos {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 40)
    private String nombre;

    @Column(nullable = false, length = 30)
    private String apellido1;

    @Column(nullable = false, length = 30)
    private String apellido2;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_alumno", nullable = false)
    private TipoAlumno tipoAlumno;
    
    @Column(nullable = false, length = 20)
    private String curso;
}
```

**Libros.java**

Abre o crea: `src/main/java/com/iesdoctorbalmis/spring/entity/Libros.java`

```java
package com.iesdoctorbalmis.spring.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "libros")
@Data 
@NoArgsConstructor 
@AllArgsConstructor 
public class Libros {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String curso;
    
    @Column(nullable = false, length = 30)
    private String area;
    
    @Column(length = 15)
    private String isbn;

    @Column(nullable = false, length = 60)
    private String titulo;
    
    @Column(length = 30)
    private String observaciones;

    @Column(length = 20)
    private String imagen;

    @Column(length = 20)
    private Integer cantidad;
}
```

**Cursos.java**

Abre o crea: `src/main/java/com/iesdoctorbalmis/spring/entity/Cursos.java`

```java
package com.iesdoctorbalmis.spring.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "cursos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cursos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String curso;
    
    @Column(length = 50)
    private String descripcion;

    @Column(nullable = false, length = 20)
    private Integer numGrupos;

    @Column(nullable = false, length = 20)
    private Integer numAlumnos;
}
```

**TipoAlumno.java**

Abre o crea: `src/main/java/com/iesdoctorbalmis/spring/entity/TipoAlumno.java`

```java
package com.iesdoctorbalmis.spring.entity;

public enum TipoAlumno {
    A("ABSENTISTA"),
    B("BAJA"),
    F("FPB"),
    M("NO XARXA"),
    P("PAC"),
    U("UECO"),
    X("XARXA");

    private final String descripcion;

    TipoAlumno(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
```

## 4. Configuración de application.properties

Abre el archivo `src/main/resources/application.properties` y añade la siguiente configuración:

```properties
spring.application.name=spring
server.port=9000

spring.datasource.url=jdbc:h2:mem:xarxallibres
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.defer-datasource-initialization=true
spring.jpa.properties.hibernate.hbm2ddl.import_files=
spring.jpa.open-in-view=false

spring.sql.init.mode=always
spring.sql.init.data-locations=classpath:import.sql

spring.thymeleaf.check-template-location=false

logging.level.root=INFO
logging.level.com.iesdoctorbalmis.spring=DEBUG
```

## 5. Repositorios JPA

El **patrón Repositorio** es una capa de abstracción entre la lógica de negocio y el almacenamiento de datos.

Antes de crear los repositorios, crea la carpeta `repository` dentro del paquete principal. En VS Code, haz clic derecho sobre `src/main/java/com/iesdoctorbalmis/spring/` y selecciona **Nueva Carpeta**, con el nombre `repository`.

La estructura quedará así:

```
src/main/java/com/iesdoctorbalmis/spring/
└── repository/
    ├── AlumnosRepository.java
    ├── CursosRepository.java
    └── LibrosRepository.java
```

Por ahora, con que extiendan a `JpaRepository` es suficiente, y podemos dejarlos vacíos.

**AlumnosRepository.java**

```java
package com.iesdoctorbalmis.spring.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.iesdoctorbalmis.spring.entity.Alumnos;

public interface AlumnosRepository extends JpaRepository<Alumnos, Long> {
    
}

```

**CursosRepository.java**

```java
package com.iesdoctorbalmis.spring.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.iesdoctorbalmis.spring.entity.Cursos;

public interface CursosRepository extends JpaRepository<Cursos, Long> {
    
}
```

**LibrosRepository.java**

```java
package com.iesdoctorbalmis.spring.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.iesdoctorbalmis.spring.entity.Libros;

public interface LibrosRepository extends JpaRepository<Libros, Long> {
    
}

```

## 6. Datos Iniciales

Crea `src/main/resources/import.sql`:

```sql
INSERT INTO cursos (curso, descripcion, num_grupos, num_alumnos) VALUES
('1ESO', 'Primero de ESO', 4, 125),
('2ESO', 'Segundo de ESO', 4, 120),
('3ESO', 'Tercero de ESO', 4, 110),
('3ESOPDC', 'Tercero de PDC', 1, 16),
('4ESO', 'Cuarto de ESO', 3, 78),
('4ESOPDC', 'Cuarto de PDC', 1, 18);

INSERT INTO alumnos (nombre, apellido1, apellido2, tipo_alumno, curso) VALUES
('Aitana', 'Alonso', 'Ruiz', 'X', '1ESO'),
('Laura', 'Benitez', 'Ramos', 'X', '4ESO'),
('Lucia', 'Castro', 'Mendez', 'A', '4ESO'),
('Elena', 'Diaz', 'Castro', 'A', '1ESO'),
('Mateo', 'Fernandez', 'Ortega', 'X', '4ESO'),
('Beatriz', 'Garcia', 'Vela', 'P', '2ESO'),
('Noa', 'Gomez', 'Ruiz', 'X', '4ESOPDC'),
('Eva', 'Huarte', 'Sanz', 'A', '4ESOPDC'),
('Clara', 'Ibanez', 'Vidal', 'X', '3ESO'),
('Nora', 'Jimenez', 'Lara', 'A', '3ESO'),
('Irene', 'Lopez', 'Serra', 'U', '2ESO'),
('Hugo', 'Martin', 'Lopez', 'U', '1ESO'),
('Javier', 'Moreno', 'Pina', 'P', '2ESO'),
('Diego', 'Navarro', 'Costa', 'P', '3ESO'),
('Alejandro', 'Pardo', 'Valls', 'M', '4ESOPDC'),
('Raul', 'Mendez', 'Salas', 'X', '4ESOPDC'),
('Pablo', 'Sanz', 'Ortega', 'M', '1ESO'),
('Lucas', 'Roca', 'Flores', 'M', '3ESO'),
('Tomás', 'Romero', 'Vidal', 'M', '2ESO'),
('Daniel', 'Ruiz', 'Navas', 'M', '4ESO'),
('Sara', 'Sanchez', 'Ruiz', 'X', '3ESOPDC'),
('Paula', 'Torres', 'Luna', 'A', '3ESOPDC'),
('Adrian', 'Valero', 'Soler', 'X', '3ESOPDC'),
('Marcos', 'Vidal', 'Rios', 'M', '3ESOPDC');

INSERT INTO libros (curso, area, isbn, titulo, observaciones, imagen, cantidad) VALUES
('1ESO', 'Biología y Geología', '9788469877371', 'Biología y Geología 1', '1 libro', '1eso-01.jpg', 129),
('1ESO', 'Tecnología', '', 'Tecnología 1 ESO', '1 Cuadernillo', '1eso-02.jpg', 139),
('1ESO', 'Valenciano', '9788413581781', 'Quadern de llengua. Ambit Linguístic i Social', '1 cuaderno', '1eso-03.jpg', 131),
('2ESO', 'Física y Química', '9788414300534', '2º ESO Física y Química', '1 Libro', '2eso-01.jpg', 126),
('2ESO', 'Francés', '9788490494509', 'Transit 2, livre de l`élève', '1 Libro (Optativa)', '2eso-02.jpg', 28),
('2ESO', 'Castellano', '9788414407455', '2ESO Lengua Castellana y Literatura', '1 Libro', '2eso-03.jpg', 125),
('3ESO', 'Geografía e Historia', '9788468289724', 'Geografía e Historia 3ª Edición', '2 Volúmenes', '3eso-01.jpg', 108),
('3ESO', 'Matemáticas', '9788414305324', 'Matemáticas 3', '3 Volúmenes', '3eso-02.jpg', 104),
('3ESO', 'Valenciano', '978841382344', 'ESO3  Valencià Llengua i literatura', '1 Libro', '3eso-03.jpg', 107),
('3ESOPDC', 'Ámbito cientifico - matemático', '9788413218311', 'Ámbito Cientifico-Tecnológico I', '1 Libro', '3pdc-01.jpg', 14),
('3ESOPDC', 'Ámbito sociolingüístico', '9788413218304', 'Ámbito Lingüístico y Social I', '1 Libro', '3pdc-02.jpg', 17),
('3ESOPDC', 'Inglés', '9781009220170', 'Game Changer Level 2 Student`s Book', '1 Libro', '3pdc-03.jpg', 16),
('4ESO', 'Educación en Valores', '9788421874479', 'Educación en Valores cívicos y éticos', '1 Libro', '4eso-01.jpg', 80),
('4ESO', 'Form. y Orien. Pers. y Prof.', '9788448638764', 'Formación y Orientación Personal y Profesional 4º ESO', '1 Libro', '4eso-02.jpg', 45),
('4ESO', 'Geografía e Historia', '9788468295343', '4rt ESO Geografia i Historia', '2 Volúmenes', '4eso-03.jpg', 80),
('4ESOPDC', 'Ámbito Lingüístico', '9788411344739', 'Ámbito Lingüístico y Social II', '1 Libro', '4pdc-01.jpg', 16),
('4ESOPDC', 'Valenciano', '9788413584393', 'Quadern de valencià 4t. ESO', '1 Libro', '4pdc-02.jpg', 16),
('4ESOPDC', 'Tecnología', '', 'Tecnología 4 ESO', '1 Cuadernillo', '4pdc-03.jpg', 18);

```

## 7. Verificación

```bash
mvn spring-boot:run
```

Abre `http://localhost:9000/h2-console` para inspeccionar la BD.

![Repaso de UD4](/sge/repaso4/repaso4_h2-console.png)

![Repaso de UD4](/sge/repaso4/repaso4_Alumnos.png)

![Repaso de UD4](/sge/repaso4/repaso4_Cursos.png)

![Repaso de UD4](/sge/repaso4/repaso4_Libros.png)

## 📤 Subir tu código a GitHub

En VSCode tienes **Control de Código Fuente** (nativo, sin necesidad de extensiones) para gestionar Git de forma gráfica:

### Paso 1: Haz cambios en tu código

Edita normalmente en VSCode mientras trabajas en el Reto 1.

### Paso 2: Haz commit

1. En la barra lateral izquierda, haz clic en **Control de Código Fuente** (icono de rama con círculos)
2. Verás los archivos modificados (en un círculo azul)
3. En el cuadro de texto superior, escribe un **mensaje descriptivo** (ej: "Repaso de la Eval 1")
4. Presiona **Ctrl+Enter** o haz clic en el icono ✓ para hacer **Confirmación** (commit local)

### Paso 3: Haz push

1. Después de la confirmación, verás un botón que dice **"Sincronizar cambios"**
2. Haz clic en él para hacer **push** (subir tu código a GitHub)
3. En la parte inferior de VSCode, verás el progreso del deploy automático

## Entregable

### Estructura esperada

```
spring/
├── pom.xml (con Spring Data JPA y H2)
├── src/main/
│   ├── java/com/iesdoctorbalmis/spring/
│   │   ├── entity/ (Alumnos, Cursos, Libros, TipoAlumno)
│   │   ├── repository/ (AlumnosRepository, CursosRepository, LibrosRepository)
│   │   └── Application.java
│   └── resources/
│       ├── application.properties (con H2)
│       └── import.sql (datos iniciales)
├── .gitignore
├── README.md
└── target/
```

### Requisitos de entrega

1. **Repositorio Git:** Crea un repositorio en tu organización con el nombre **Repaso1ev_Apellido1_Nombre** (ejemplo: **Repaso1ev_Estañ_Luis**)

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
