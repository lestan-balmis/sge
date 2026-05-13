---
title: "UD4 — Introducción a Spring Boot"
description: Fundamentos de Spring Boot, Maven, persistencia y arquitectura Java. Base teórica para los Retos 0 y 1.
---

### Introducción a Spring Boot
**Módulo SGE · DAM · IES Balmis**

---

> **Duración:** 10 horas teóricas + prácticas  
> **Herramientas:** Spring Boot, Maven, Lombok, H2 Database, JPA/Hibernate  
> **Objetivo:** Comprender los fundamentos de Spring Boot y la persistencia Java antes de desarrollar los Retos 0 y 1 del ERP Balmis.

---

## Índice

1. [¿Por qué Spring Boot?](#1-por-qué-spring-boot)
2. [Conceptos clave: Spring Framework y Spring Boot](#2-conceptos-clave-spring-framework-y-spring-boot)
3. [Maven: Gestor de dependencias y compilación](#3-maven-gestor-de-dependencias-y-compilación)
4. [Estructura de un proyecto Maven](#4-estructura-de-un-proyecto-maven)
5. [Lombok: Reducción de código repetitivo](#5-lombok-reducción-de-código-repetitivo)
6. [Inyección de dependencias](#6-inyección-de-dependencias)
7. [El patrón Repositorio con ArrayList](#7-el-patrón-repositorio-con-arraylist)
8. [🎯 PAUSA: Aquí puedes hacer el **Reto 0** ](#8--pausa-aquí-puedes-hacer-el-reto-0)
9. [JPA: Java Persistence API](#9-jpa-java-persistence-api)
10. [Hibernate y el mapeo objeto-relacional](#10-hibernate-y-el-mapeo-objeto-relacional)
11. [H2 Database: Base de datos en memoria](#11-h2-database-base-de-datos-en-memoria)
12. [🎯 PAUSA: Aquí puedes hacer el **Reto 1** ](#12--pausa-aquí-puedes-hacer-el-reto-1)
13. [Testing con Spring Boot](#13-testing-con-spring-boot)

---

## 1. ¿Por qué Spring Boot?

### El problema: Configurar Spring es complejo

El framework **Spring** (desde 1.0) permite construir aplicaciones empresariales robustas en Java. Pero configurarlo requería:
- Escribir decenas de archivos XML
- Gestionar versiones de dependencias manualmente
- Confiar en que las dependencias fueran compatibles

```xml
<!-- Así se configuraba Spring hace años: enormemente verbose -->
<bean id="dataSource" class="org.springframework.jdbc.datasource.DriverManagerDataSource">
    <property name="driverClassName" value="org.postgresql.Driver" />
    <property name="url" value="jdbc:postgresql://localhost:5432/dbname" />
    <property name="username" value="user" />
    <property name="password" value="pass" />
</bean>
```

### La solución: Spring Boot

**Spring Boot** (desde 2013) es la respuesta a esa complejidad. Ofrece:
- **Configuración automática** (autoconfiguration): Spring Boot detecta las dependencias y las configura automáticamente
- **Embedded servers**: Tomcat, Jetty, Undertow incrustados (no necesitas descargar un servidor por separado)
- **Starters**: Dependencias preconfiguradas (p. ej., `spring-boot-starter-web` descarga Spring Web + Tomcat + Jackson automáticamente)
- **Actuator**: Monitoreo y métricas de la aplicación
- **DevTools**: Reinicio automático al guardar

### Comparación: Spring vs Spring Boot

| Aspecto | Spring (tradicional) | Spring Boot |
|---|---|---|
| **Configuración** | Archivos XML extensos | `application.properties` o `application.yml` |
| **Servidor** | Requiere descargar Tomcat/Jetty aparte | Incluido (embedded) |
| **Dependencias** | Especificar versiones de cada librería | Los "Starters" manejan versiones automáticamente |
| **Tiempo de setup** | 2-3 horas | 10 minutos |
| **Hello World** | ~150 líneas de código | ~20 líneas |

---

## 2. Conceptos clave: Spring Framework y Spring Boot

### Spring Framework: Los pilares

Spring se construye sobre dos conceptos fundamentales:

#### A. Inyección de Dependencias (Dependency Injection)

**Definición:** En lugar de que una clase cree sus propias dependencias, un contenedor (el *IoC Container*) se las proporciona.

**Sin DI (acoplamiento fuerte):**
```java
public class ClienteService {
    private ClienteRepository repo = new ClienteRepository(); // Acoplado
    
    public Cliente buscar(Long id) {
        return repo.buscarPorId(id);
    }
}
```

Si necesitas cambiar `ClienteRepository` por `ClienteRepositoryMock` para pruebas, debes modificar el código.

**Con DI (desacoplamiento):**
```java
@Service
public class ClienteService {
    private final ClienteRepository repo; // Inyectada
    
    public ClienteService(ClienteRepository repo) {
        this.repo = repo;
    }
    
    public Cliente buscar(Long id) {
        return repo.buscarPorId(id);
    }
}
```

Spring crea automáticamente `ClienteService` e inyecta `ClienteRepository`. En pruebas, puedes inyectar un mock sin cambiar el código.

#### B. Aspectos (AOP)

**Definición:** Permite aplicar comportamiento transversal (logging, transacciones, seguridad) sin mezclar código de negocio.

**Ejemplo:** Transacciones. En el Reto 5, verás:
```java
@Transactional
public void guardarCliente(Cliente cliente) {
    // Spring hace un BEGIN, ejecuta este método, y hace COMMIT automáticamente
}
```

No escribiste el código de transacción; es inyectado por AOP.

### Spring Boot: La capa de conveniencia

Spring Boot es Spring + autoconfiguration + convención sobre configuración:

1. **Autoconfiguration:** Si tu pom.xml incluye `spring-boot-starter-jpa` y tienes un archivo `application.properties`, Spring Boot configura automáticamente JPA.
2. **Convención sobre configuración:** Spring asume ciertos valores por defecto (p. ej., el servidor escucha en puerto 8080 a menos que indiques otro).
3. **Application class:** Una clase anotada con `@SpringBootApplication` que inicia todo.

---

## 3. Maven: Gestor de dependencias y compilación

### ¿Qué es Maven?

**Maven** es un gestor de construcción que automatiza:
- **Compilación** del código
- **Gestión de dependencias** (descargar librerías de repositorios remotos)
- **Empaquetamiento** en JAR/WAR
- **Ejecución de pruebas**
- **Publicación** de artefactos

### El archivo `pom.xml`

El archivo `pom.xml` (*Project Object Model*) es el "plano" del proyecto. Define:

```xml
<project>
    <modelVersion>4.0.0</modelVersion>
    
    <!-- Identidad del proyecto -->
    <groupId>com.iesdoctorbalmis</groupId>
    <artifactId>spring</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <name>ERP Balmis - Spring Boot</name>
    <description>Proyecto integrador del módulo SGE</description>
    
    <!-- Versión de Java -->
    <properties>
        <java.version>21</java.version>
    </properties>
    
    <!-- Dependencias (librerías que necesita el proyecto) -->
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
    </dependencies>
    
    <!-- Plugins (herramientas para compilar, empaquetar, etc.) -->
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

### Coordenadas Maven: groupId, artifactId, version

Cada dependencia en Maven se identifica por tres coordenadas:

| Coordenada | Ejemplo | Significado |
|---|---|---|
| **groupId** | `org.springframework.boot` | Organización/empresa que publica la librería |
| **artifactId** | `spring-boot-starter-web` | Nombre específico de la librería |
| **version** | `3.4.5` | Versión de la librería |

### Los "Starters" de Spring Boot

Un **Starter** es un descriptor de dependencias preconfiguradas que simplifica el pom.xml:

```xml
<!-- Sin Starter: necesitarías listar todas estas dependencias manualmente -->
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-autoconfigure</artifactId>
</dependency>
<dependency>
    <groupId>org.apache.tomcat.embed</groupId>
    <artifactId>tomcat-embed-core</artifactId>
</dependency>
<!-- ... 10 más ... -->

<!-- Con Starter: una sola línea! -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

**Starters comunes:**
- `spring-boot-starter-web`: REST APIs + Tomcat
- `spring-boot-starter-data-jpa`: JPA + Hibernate
- `spring-boot-starter-security`: Autenticación y autorización
- `spring-boot-starter-test`: JUnit 5 + Mockito para pruebas
- `spring-boot-starter-validation`: Validación de formularios

---

## 4. Estructura de un proyecto Maven

Después de crear un proyecto Spring Boot, su estructura es:

```
proyecto/
├── pom.xml                                  # Configuración Maven
├── README.md                                # Documentación
├── .gitignore                               # Archivos a ignorar en Git
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/iesdoctorbalmis/spring/
│   │   │       ├── Application.java         # Clase main (@SpringBootApplication)
│   │   │       ├── controller/              # Controladores REST (Reto 3+)
│   │   │       ├── dto/                     # Data Transfer Objects (Reto 3+)
│   │   │       ├── entity/                  # Entidades JPA (Reto 1+)
│   │   │       ├── model/                   # POJOs puros (Reto 0)
│   │   │       ├── repository/              # Repositorios (Reto 0+)
│   │   │       ├── service/                 # Servicios de negocio (Reto 3+)
│   │   │       ├── security/                # Autenticación, JWT (Reto 5+)
│   │   │       └── config/                  # Configuraciones globales (Reto 3+)
│   │   └── resources/
│   │       ├── application.properties       # Configuración de la app
│   │       ├── application-dev.properties   # Configuración de desarrollo
│   │       ├── data.sql                     # Datos iniciales (Reto 1+)
│   │       ├── templates/                   # Plantillas HTML (Reto 2+)
│   │       └── static/                      # CSS, JavaScript (Reto 2+)
│   └── test/
│       └── java/
│           └── com/iesdoctorbalmis/spring/
│               ├── ApplicationTests.java
│               └── repository/              # Pruebas de repositorios
├── target/                                  # Clases compiladas (generado automáticamente)
└── .mvn/                                    # Configuración de Maven (generado)
```

### Explicación por carpetas

| Carpeta | Contenido | Reto |
|---|---|---|
| `src/main/java` | Código fuente | Todo |
| `src/main/resources` | Archivos de configuración y datos | Todo |
| `src/test` | Pruebas unitarias | Reto 0+ |
| `target/` | Código compilado (NO editar, se regenera) | - |
| `pom.xml` | Configuración Maven | Todo |

---

## 5. Lombok: Reducción de código repetitivo

### El problema: Boilerplate en Java

Cada clase Java requiere getters, setters, constructores, `toString()`, `equals()`, `hashCode()`:

```java
public class Cliente {
    private Long id;
    private String nombre;
    private String email;
    
    // Constructor completo
    public Cliente(Long id, String nombre, String email) {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
    }
    
    // Constructor vacío
    public Cliente() {}
    
    // Getters
    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public String getEmail() { return email; }
    
    // Setters
    public void setId(Long id) { this.id = id; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public void setEmail(String email) { this.email = email; }
    
    // toString
    @Override
    public String toString() {
        return "Cliente{" + "id=" + id + ", nombre='" + nombre + "', email='" + email + "'}";
    }
    
    // equals y hashCode
    @Override
    public boolean equals(Object o) { /* ... */ }
    
    @Override
    public int hashCode() { /* ... */ }
}
```

**~60 líneas para 3 campos.** Es redundante y propenso a errores.

### La solución: Lombok

**Lombok** es una librería de procesamiento de anotaciones que **genera automáticamente** este código en tiempo de compilación. Reduces las 60 líneas anteriores a:

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cliente {
    private Long id;
    private String nombre;
    private String email;
}
```

**Anotaciones de Lombok:**

| Anotación | Genera |
|---|---|
| `@Data` | Getters, setters, `toString()`, `equals()`, `hashCode()`, `canEqual()` |
| `@NoArgsConstructor` | Constructor sin argumentos |
| `@AllArgsConstructor` | Constructor con todos los campos |
| `@RequiredArgsConstructor` | Constructor con campos `final` (usado en inyección de dependencias) |
| `@Getter` / `@Setter` | Solo getters o setters (sin `@Data`) |
| `@Builder` | Patrón Builder para construcción fluida |
| `@Slf4j` | Inyecta un logger `log` para logging |

### Ejemplo en Reto 0

En el Reto 0, todas las clases del modelo usan `@Data`:

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cliente {
    private Long id;
    private String nombre;
    private String email;
    // ... más campos
}
```

Lombok genera automáticamente los 60 líneas de boilerplate. En el IDE, al pasar el cursor sobre `getId()`, verás que viene de Lombok.

---

## 6. Inyección de dependencias

### El contenedor IoC (Inversion of Control)

Spring mantiene un **contenedor** que gestiona todas las instancias de clases anotadas con `@Component`, `@Service`, `@Repository`, `@Controller`, etc.

```java
// Spring detecta @Component y crea una única instancia en el contenedor
@Component
public class ClienteRepository {
    public Cliente buscarPorId(Long id) { /* ... */ }
}

// ClienteService solicita ClienteRepository
@Service
public class ClienteService {
    private final ClienteRepository repo;
    
    // Spring inyecta automáticamente ClienteRepository aquí
    public ClienteService(ClienteRepository repo) {
        this.repo = repo;
    }
}

// Main
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        // Spring crea el contenedor e inyecta todas las dependencias
        SpringApplication.run(Application.class, args);
    }
}
```

### Tipos de inyección

**1. Constructor (recomendado):**
```java
@Service
public class ClienteService {
    private final ClienteRepository repo;
    
    public ClienteService(ClienteRepository repo) {
        this.repo = repo;
    }
}
```

**2. Setter:**
```java
@Service
public class ClienteService {
    private ClienteRepository repo;
    
    @Autowired
    public void setRepo(ClienteRepository repo) {
        this.repo = repo;
    }
}
```

**3. Campo (menos segura, pero frecuente):**
```java
@Service
public class ClienteService {
    @Autowired
    private ClienteRepository repo;
}
```

La inyección por constructor es la más recomendada porque:
- Hace explícitas las dependencias
- Permite usar `final` (garantiza inmutabilidad)
- Facilita las pruebas (pasas mocks al constructor)

---

## 7. El patrón Repositorio con ArrayList

### ¿Qué es el patrón Repositorio?

El patrón **Repositorio** abstrae la forma en que se almacenan y recuperan datos. Actúa como un intermediario entre la lógica de negocio y la capa de persistencia.

**Interfaz (contrato):**
```java
public interface ClienteRepository {
    Cliente buscarPorId(Long id);
    List<Cliente> buscarTodos();
    void guardar(Cliente cliente);
    void actualizar(Cliente cliente);
    void eliminar(Long id);
}
```

### ArrayList en Reto 0

En el Reto 0, **implementarás el repositorio manualmente usando ArrayList**:

```java
@Component
public class ClienteRepositorio implements ClienteRepository {
    private List<Cliente> clientes = new ArrayList<>();
    
    @Override
    public Cliente buscarPorId(Long id) {
        for (Cliente cliente : clientes) {
            if (cliente.getId().equals(id)) {
                return cliente;
            }
        }
        return null;
    }
    
    @Override
    public void guardar(Cliente cliente) {
        clientes.add(cliente);
    }
    
    // ... más métodos
}
```

### ¿Por qué ArrayList en Reto 0?

Porque cuando en el **Reto 1** cambies de ArrayList a JPA, **la interfaz sigue siendo la misma**:

```java
// Reto 1: Implementación con JPA (¡solo una línea!)
@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    // Hereda: buscarPorId, guardar, actualizar, eliminar, etc.
}
```

**El patrón Repositorio te permite cambiar la implementación sin tocar el código que la usa.** Esto es el poder de la abstracción.

---

## 8. 🎯 PAUSA: Aquí puedes hacer el **Reto 0**

Ya hemos cubierto toda la teoría necesaria para desarrollar el **Reto 0 — La Semilla**:

✅ Estructura de un proyecto Maven  
✅ Inyección de dependencias  
✅ Patrón Repositorio  
✅ Lombok para reducir boilerplate  

### ¿Qué harás en Reto 0?

1. Crear un proyecto Spring Boot con Maven
2. Modelar el dominio como POJOs (Cliente, Producto, Empleado)
3. Implementar repositorios basados en ArrayList
4. Comprender cómo Spring gestiona dependencias

[📖 Ir al Reto 0: La Semilla](/retos/reto0)

---

## 9. JPA: Java Persistence API

### ¿Qué es JPA?

**JPA** (*Java Persistence API*) es una **especificación** (un estándar) que define cómo los objetos Java se mapean a tablas de base de datos.

Es decir: "Si sigues estas reglas (anotaciones), tu objeto se persistirá automáticamente en la BD".

### Mapeo objeto-relacional (ORM)

| Mundo Java | Base de datos |
|---|---|
| Clase | Tabla |
| Objeto (instancia) | Fila |
| Atributo | Columna |
| Relación (ManyToOne, OneToMany) | Clave foránea |

### Ejemplo: Cliente a tabla SQL

**Clase Java:**
```java
@Entity
@Table(name = "clientes")
public class Cliente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String nombre;
    
    @Column(unique = true, nullable = false)
    private String email;
}
```

**Tabla SQL (generada automáticamente):**
```sql
CREATE TABLE clientes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE
);
```

### Anotaciones JPA clave

| Anotación | Uso |
|---|---|
| `@Entity` | Marca una clase como entidad persistente |
| `@Table` | Especifica el nombre de la tabla |
| `@Id` | Identifica la clave primaria |
| `@GeneratedValue` | Especifica cómo se genera el ID (IDENTITY, SEQUENCE, AUTO) |
| `@Column` | Configura detalles de la columna (nullable, unique, length, etc.) |
| `@Enumerated` | Mapea un enum a una columna (STRING o ORDINAL) |
| `@Temporal` | Mapea tipos de fecha (DATE, TIME, TIMESTAMP) |
| `@OneToMany` / `@ManyToOne` | Define relaciones entre entidades |
| `@JoinColumn` | Especifica la columna de clave foránea |

---

## 10. Hibernate y el mapeo objeto-relacional

### ¿Qué es Hibernate?

**Hibernate** es la **implementación** de JPA más popular. Es el motor que:
- Lee tus anotaciones JPA
- Genera tablas SQL automáticamente
- Traduce tus consultas Java a SQL
- Maneja transacciones, sesiones, y caché

### El flujo: De anotaciones a SQL

```
Tu código Java (@Entity, @Column, etc.)
        ↓
Hibernate (interpreta anotaciones)
        ↓
SQL generado automáticamente
        ↓
Base de datos
```

### Dialecto Hibernate

Hibernate soporta múltiples bases de datos (PostgreSQL, MySQL, Oracle, H2, etc.). Para cada BD, usa un **dialecto** que traduce los comandos generales de Hibernate a SQL específico:

```properties
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect  # Para H2
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect  # Para PostgreSQL
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect  # Para MySQL
```

### Configuración de Hibernate en application.properties

```properties
# DDL (Data Definition Language): crear/actualizar/eliminar tablas
spring.jpa.hibernate.ddl-auto=create-drop  # Reto 1: crea tablas al iniciar, las borra al parar
# Opciones: none, validate, update, create, create-drop

# Mostrar SQL generado en logs
spring.jpa.show-sql=true

# Formatear SQL para que sea legible
spring.jpa.properties.hibernate.format_sql=true

# Dialect
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
```

| Valor | Comportamiento |
|---|---|
| `none` | No hacer nada (espera que la BD ya exista) |
| `validate` | Validar que el esquema coincida; error si no |
| `update` | Actualizar el esquema (crear nuevas columnas, nunca elimina) |
| `create` | Crear tablas (lanza error si ya existen) |
| `create-drop` | Crear tablas al iniciar, eliminarlas al parar (útil para tests) |

---

## 11. H2 Database: Base de datos en memoria

### ¿Qué es H2?

**H2** es una base de datos SQL relacional **escrita en Java**. Características:

- **Embebida:** Se ejecuta dentro de tu aplicación Java (no necesitas servidor externo)
- **En memoria:** Datos en RAM (ideales para pruebas; se pierden al parar la app)
- **Persistente (opcional):** Puede guardar datos en archivo
- **Rápida:** Ideal para desarrollo y testing
- **Compatibilidad:** Soporta la mayoría de SQL estándar

### Configuración en application.properties

```properties
# Tipo de driver
spring.datasource.driverClassName=org.h2.Driver

# URL: base de datos en memoria llamada "erpbalmis"
# DB_CLOSE_DELAY=-1: mantiene la BD activa entre conexiones
# DB_CLOSE_ON_EXIT=FALSE: no cierra la BD al salir
spring.datasource.url=jdbc:h2:mem:erpbalmis;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE

# Usuario y contraseña por defecto
spring.datasource.username=sa
spring.datasource.password=

# H2 Console: interfaz web para inspeccionar la BD
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
```

### H2 Console

Una vez iniciada la aplicación, accede a:
```
http://localhost:9000/h2-console
```

Aquí puedes:
- Ver todas las tablas
- Ejecutar queries SQL
- Verificar que los datos se crearon correctamente
- Hacer backups

---

## 12. 🎯 PAUSA: Aquí puedes hacer el **Reto 1**

Ya hemos cubierto toda la teoría necesaria para desarrollar el **Reto 1 — De la Semilla a la Raíz**:

✅ JPA y mapeo objeto-relacional  
✅ Hibernate y generación de tablas  
✅ H2 Database y H2 Console  
✅ Anotaciones JPA clave  
✅ Configuración de `application.properties`  

### ¿Qué harás en Reto 1?

1. Transformar los POJOs del Reto 0 en entidades JPA
2. Configurar H2 y Hibernate
3. Crear repositorios con `JpaRepository` (reemplazando ArrayList)
4. Cargar datos iniciales con `data.sql`
5. Inspeccionar la BD con H2 Console

[📖 Ir al Reto 1: De la Semilla a la Raíz](/retos/reto1)

---

## 13. Testing con Spring Boot

### Spring Boot Test

**Spring Boot Test** proporciona `@SpringBootTest`, que carga el contexto completo de Spring en pruebas:

```java
@SpringBootTest
public class ClienteRepositoryTests {
    
    @Autowired
    private ClienteRepository repo;
    
    @Test
    public void testBuscarPorId() {
        Cliente cliente = new Cliente(1L, "Juan", "juan@example.com");
        repo.save(cliente);
        
        Cliente encontrado = repo.findById(1L).orElse(null);
        
        assertNotNull(encontrado);
        assertEquals("Juan", encontrado.getNombre());
    }
}
```

### Mockeando dependencias

Para aislar la lógica, usas `@Mock` y `@InjectMocks`:

```java
public class ClienteServiceTests {
    
    @Mock
    private ClienteRepository repo;
    
    @InjectMocks
    private ClienteService service;
    
    @Test
    public void testCrearCliente() {
        Cliente cliente = new Cliente(1L, "Juan", "juan@example.com");
        when(repo.save(cliente)).thenReturn(cliente);
        
        Cliente resultado = service.crear(cliente);
        
        assertEquals("Juan", resultado.getNombre());
        verify(repo).save(cliente);
    }
}
```

### Convención: Nombres de test

- Clase de test: `NombreClaseTests.java` o `NombreClasseTest.java`
- Método de test: `testNombreDelEscenario()` o `nombreDelEscenario_debería_hacer_esto()`

Ejemplo: `ClienteRepositoryTests.java` → `testBuscarPorId()`, `testGuardarCliente()`, etc.

---

## Resumen: Roadmap UD4 → Retos

```
UD4 Teoría (Este documento)
├── Conceptos: Spring Boot, Maven, Lombok, DI
├── Patrón Repositorio
│
├─→ [Reto 0: ArrayList + POJO]
│   └─→ Vuelves aquí para más teoría
│
├── Teoría: JPA, Hibernate, H2
│
├─→ [Reto 1: JPA + Persistencia]
│   └─→ Pruebas con H2 Console
│
└─→ Siguiente: UD5 (API REST)
```

---

## Próximos pasos

Tras completar los Retos 0 y 1, estarás listo para:
- **Reto 2:** Vistas con Thymeleaf
- **Reto 3:** API REST con Controllers y DTOs
- **Reto 4:** Arquitectura en capas (Service, DTO)
- **Reto 5:** Spring Security y JWT
- **Reto 6:** Módulos avanzados (Compras, RRHH)
