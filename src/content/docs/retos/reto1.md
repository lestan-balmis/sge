---
title: "Reto 1: De la Semilla a la Raíz"
description: Transformar Reto 0 (ArrayList) en Entidades JPA persistentes con H2 Database.
---

> **Teoría requerida:** [UD4 — JPA, Hibernate, H2](/docs/spring/ud4#9-jpa-java-persistence-api)  
> **Reto anterior:** [Reto 0 — La Semilla](/docs/retos/reto0)

---

## 📌 Resumen del Reto

Transformarás el Reto 0 añadiendo:
- **Anotaciones JPA:** `@Entity`, `@Id`, `@Column`, etc.
- **Repositorios JPA:** `JpaRepository` en lugar de ArrayList
- **Base de datos H2:** Persistencia real
- **H2 Console:** Inspeccionar datos en la BD
- **import.sql:** Datos iniciales

---

## Guía de Implementación

### 1. Prepara el Reto 0 para evolucionar

Desde tu carpeta de trabajo **workspace-spring** copia tu carpeta **spring** con el nombre **reto0** y modificamos el proyecto original **spring** desde el IDE de VSCode. Mueve las entidades de `model/` a `entity/` y actualiza los `package`:

```java
// Cambiar de:
package com.iesdoctorbalmis.spring.model;

// A:
package com.iesdoctorbalmis.spring.entity;
```

Verifica que `pom.xml` contenga:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>
```

### 2. Anotaciones JPA

Transforma tus POJOs añadiendo `@Entity` y anotaciones de columnas.

Abre o crea: `src/main/java/com/iesdoctorbalmis/spring/entity/Cliente.java`

```java
package com.iesdoctorbalmis.spring.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "clientes", uniqueConstraints = {
    @UniqueConstraint(columnNames = "codigo_cliente"),
    @UniqueConstraint(columnNames = "email")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cliente {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "codigo_cliente", nullable = false, length = 50)
    private String codigoCliente;
    
    @Column(nullable = false, length = 100)
    private String nombre;
    
    @Column(unique = true, nullable = false, length = 100)
    private String email;
    
    @Column(length = 20)
    private String telefono;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_cliente", nullable = false)
    private TipoCliente tipoCliente;
    
    @Column(name = "fecha_alta", nullable = false)
    private LocalDate fechaAlta;
    
    @Column(name = "fecha_modificacion")
    private LocalDate fechaModificacion;
}
```

**Producto.java**

```java
package com.iesdoctorbalmis.spring.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "productos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Producto {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "referencia", nullable = false, unique = true, length = 50)
    private String referencia;
    
    @Column(nullable = false, length = 200)
    private String descripcion;
    
    @Column(name = "precio_venta", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioVenta;
    
    @Column(name = "precio_coste", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioCoste;
    
    @Column(name = "stock", nullable = false)
    private Integer stock;
    
    @Column(name = "fecha_alta", nullable = false)
    private LocalDate fechaAlta;
    
    @Column(name = "activo", nullable = false)
    private Boolean activo = true;
}
```

**Empleado.java**

```java
package com.iesdoctorbalmis.spring.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "empleados")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Empleado {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "numero_empleado", nullable = false, unique = true, length = 20)
    private String numeroEmpleado;
    
    @Column(nullable = false, length = 100)
    private String nombre;
    
    @Column(nullable = false, length = 100)
    private String apellidos;
    
    @Column(nullable = false, length = 100)
    private String cargo;
    
    @Column(nullable = false, length = 100)
    private String departamento;
    
    @Column(nullable = false, unique = true, length = 100)
    private String email;
    
    @Column(name = "fecha_incorporacion", nullable = false)
    private LocalDate fechaIncorporacion;
    
    @Column(name = "activo", nullable = false)
    private Boolean activo = true;
}
```

**TipoCliente.java**

```java
package com.iesdoctorbalmis.spring.entity;

public enum TipoCliente {
    PROSPECTO("Cliente Potencial"),
    ACTIVO("Cliente Activo"),
    INACTIVO("Cliente Inactivo");
    
    private final String descripcion;
    
    TipoCliente(String descripcion) {
        this.descripcion = descripcion;
    }
    
    public String getDescripcion() {
        return descripcion;
    }
}
```

### 3. Configurar H2 Database

Actualiza `src/main/resources/application.properties`:

```properties
spring.application.name=spring
server.port=9000

spring.datasource.url=jdbc:h2:mem:erpbalmis
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

spring.sql.init.mode=always

logging.level.root=INFO
logging.level.com.iesdoctorbalmis.spring=DEBUG
```

### 4. Repositorios JPA

Borra los repositorios ArrayList del Reto 0 y crea los nuevos:

**ClienteRepository.java**

```java
package com.iesdoctorbalmis.spring.repository;

import com.iesdoctorbalmis.spring.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    Optional<Cliente> findByEmail(String email);
    Optional<Cliente> findByCodigoCliente(String codigoCliente);
    boolean existsByEmail(String email);
    boolean existsByCodigoCliente(String codigoCliente);
}
```
Usaremos el tipo del método `Optional<Cliente>` cuando se busca por un identificador único (como el email, dni, username) y es completamente normal o posible que el registro no exista (por ejemplo, durante el inicio de sesión o un registro de usuario).

**ProductoRepository.java**

```java
package com.iesdoctorbalmis.spring.repository;

import com.iesdoctorbalmis.spring.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    Optional<Producto> findByReferencia(String referencia);
    boolean existsByReferencia(String referencia);
}
```

**EmpleadoRepository.java**

```java
package com.iesdoctorbalmis.spring.repository;

import com.iesdoctorbalmis.spring.entity.Empleado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface EmpleadoRepository extends JpaRepository<Empleado, Long> {
    Optional<Empleado> findByEmail(String email);
    Optional<Empleado> findByNumeroEmpleado(String numeroEmpleado);
    boolean existsByEmail(String email);
    boolean existsByNumeroEmpleado(String numeroEmpleado);
}
```

### 5. Datos Iniciales

Crea `src/main/resources/import.sql`:

```sql
-- Clientes
INSERT INTO clientes (codigo_cliente, nombre, email, telefono, tipo_cliente, fecha_alta, fecha_modificacion) VALUES ('CLI001', 'Acme Corporation', 'contact@acmecorp.com', '+34-91-555-0001', 'ACTIVO', '2025-01-15', '2025-01-15');
INSERT INTO clientes (codigo_cliente, nombre, email, telefono, tipo_cliente, fecha_alta, fecha_modificacion) VALUES ('CLI002', 'Juan García López', 'juan@example.com', '+34-91-555-0002', 'PROSPECTO', '2025-01-20', '2025-02-01');
INSERT INTO clientes (codigo_cliente, nombre, email, telefono, tipo_cliente, fecha_alta, fecha_modificacion) VALUES ('CLI003', 'Ayuntamiento de Madrid', 'info@madrid.es', '+34-91-555-0003', 'ACTIVO', '2025-02-01', '2025-02-01');

-- Productos
INSERT INTO productos (referencia, descripcion, precio_venta, precio_coste, stock, fecha_alta, activo) VALUES ('PROD001', 'Juego de Mesa Premium', 29.99, 15.50, 100, '2025-01-10', true);
INSERT INTO productos (referencia, descripcion, precio_venta, precio_coste, stock, fecha_alta, activo) VALUES ('PROD002', 'Expansion Avanzada', 14.99, 7.00, 50, '2025-01-15', true);
INSERT INTO productos (referencia, descripcion, precio_venta, precio_coste, stock, fecha_alta, activo) VALUES ('PROD003', 'Pack Accesorios', 9.99, 4.50, 200, '2025-01-20', true);

-- Empleados
INSERT INTO empleados (numero_empleado, nombre, apellidos, cargo, departamento, email, fecha_incorporacion, activo) VALUES ('EMP001', 'Maria', 'Rodriguez Garcia', 'Jefe de Ventas', 'Ventas', 'maria@iesdoctorbalmis.edu', '2024-06-01', true);
INSERT INTO empleados (numero_empleado, nombre, apellidos, cargo, departamento, email, fecha_incorporacion, activo) VALUES ('EMP002', 'Carlos', 'Martinez Lopez', 'Jefe de Almacen', 'Almacén', 'carlos@iesdoctorbalmis.edu', '2024-07-15', true);
INSERT INTO empleados (numero_empleado, nombre, apellidos, cargo, departamento, email, fecha_incorporacion, activo) VALUES ('EMP003', 'Sofia', 'Lopez Martinez', 'Administrativo', 'Administración', 'sofia@iesdoctorbalmis.edu', '2024-08-01', true);
```

### 6. Limpia Application.java

Elimina el `CommandLineRunner` del Reto 0:

```java
package com.iesdoctorbalmis.spring;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

### 7. Verificación

```bash
mvn spring-boot:run
```

Abre `http://localhost:9000/h2-console` para inspeccionar la BD.

---

## 🔧 Instalación de Extensiones para Gestión de Git

A partir de este reto, utilizarás **GitLens** y **Git Graph** para facilitar la gestión de tus cambios en Git desde VSCode sin necesidad de usar la terminal.

### Instalación de GitLens

1. Abre VSCode
2. Ve a **Extensions** (Ctrl+Shift+X en Windows/Linux, Cmd+Shift+X en Mac)
3. Busca **"GitLens"** (autor: Eric Amodio)
4. Haz clic en **Install**
5. Una vez instalado, verás un icono de Git en la barra lateral izquierda

**GitLens te permite:**
- Ver quién cambió cada línea de código (Blame annotations)
- Acceder al historial completo de cambios
- Ver detalles de commits (mensaje, autor, fecha)
- Navegar por el historial de archivos

### Instalación de Git Graph

1. En **Extensions** (Ctrl+Shift+X), busca **"Git Graph"** (autor: mhutchie)
2. Haz clic en **Install**
3. Una vez instalado, tendrás acceso a una visualización gráfica de tu historial de commits

**Git Graph te permite:**
- Ver el árbol de commits de forma visual
- Entender el flujo de desarrollo
- Ver ramas y fusiones claramente
- Realizar operaciones de Git (commit, push, pull) desde la interfaz gráfica

---

## 📝 Flujo de Trabajo con GitLens y Git Graph

### Paso 1: Clonar o abrir tu repositorio

```bash
git clone https://github.com/tu-usuario/Reto1_Apellido1_Nombre.git
```

Luego abre la carpeta en VSCode.

### Paso 2: Visualizar el historial con Git Graph

1. Haz clic en el icono de **Git Graph** en la barra lateral (parece un árbol)
2. Verás una visualización gráfica de tu repositorio
3. Desde aquí puedes ver todos los commits realizados

### Paso 3: Hacer cambios y commitear

1. Modifica tu código en VSCode
2. En la barra lateral izquierda, haz clic en **Source Control** (icono de rama)
3. Verás los archivos modificados en rojo
4. Escribe un mensaje descriptivo en el campo de commit
5. Presiona **Ctrl+Enter** o haz clic en el icono de ✓ para hacer commit
6. Haz clic en el icono de flecha hacia arriba para hacer **Push** al repositorio remoto

### Paso 4: Revisar cambios con GitLens

1. Abre cualquier archivo que hayas modificado
2. Haz clic sobre una línea de código
3. GitLens mostrará información sobre quién cambió esa línea y cuándo
4. Si necesitas ver el commit completo, haz clic en el mensaje que aparece

### Paso 5: Sincronizar cambios

Regularmente, asegúrate de que tu repositorio esté actualizado:
- Haz clic en **Source Control** → **Pull** para traer cambios del servidor
- Haz clic en **Push** para enviar tus cambios

---

## 💡 Consejos prácticos

- **Commits frecuentes:** Haz commit cada vez que termines una funcionalidad pequeña
- **Mensajes claros:** Escribe mensajes descriptivos (ej: "Añadir anotaciones JPA a Cliente" en lugar de "cambios")
- **Push diario:** Envía tus cambios al repositorio al final de cada sesión de trabajo
- **Revisa el historial:** Usa Git Graph para entender cómo ha evolucionado tu proyecto

---

## Actividades a realizar

1. **Instala las extensiones:** GitLens y Git Graph en VSCode (sigue la sección anterior)
2. Transforma POJOs en Entidades JPA (@Entity, @Column, @Enumerated)
3. Configura H2 en application.properties
4. Crea los 3 repositorios JpaRepository
5. Crea import.sql con datos iniciales
6. Limpia Application.java (elimina CommandLineRunner)
7. Ejecuta la aplicación sin errores
8. Accede a H2 Console y consulta las tablas
9. Realiza commits regulares con mensajes descriptivos usando Git Graph o Source Control
10. Haz push de tus cambios al repositorio remoto de tu organización

---

## Entregable

### Estructura esperada

```
spring/
├── pom.xml (con Spring Data JPA y H2)
├── src/main/
│   ├── java/com/iesdoctorbalmis/spring/
│   │   ├── entity/ (Cliente, Producto, Empleado, TipoCliente)
│   │   ├── repository/ (ClienteRepository, ProductoRepository, EmpleadoRepository - JpaRepository)
│   │   └── Application.java
│   └── resources/
│       ├── application.properties (con H2)
│       └── import.sql (datos iniciales)
├── .gitignore
├── README.md
└── target/
```

### Requisitos de entrega

1. **Repositorio Git:** Crea un repositorio en tu organización con el nombre **Reto1_Apellido1_Nombre** (ejemplo: **Reto1_Estañ_Luis**)

2. **Commits en Git:** 
   - Realiza commits regulares conforme avanzas en el reto (mínimo 5 commits)
   - Usa mensajes descriptivos (ej: "Añadir anotaciones JPA", "Configurar H2 database", etc.)
   - Usa Git Graph para visualizar tu historial

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

**Próximo:** [Reto 2](/docs/retos/reto2) → REST Controllers, DTO, Validaciones
