---
title: "Reto 9: La Nube y la IA"
description: UD8 — ERP Balmis desplegado en la nube con PostgreSQL Neon, asistente IA con Spring AI, contenedor Docker y pipeline CI/CD con GitHub Actions y Hugging Face Spaces.
---

> **Conceptos teóricos:** Perfiles Spring Boot, variables de entorno, PostgreSQL con Neon, Spring AI `ChatClient`, Dockerfile, docker-compose, Hugging Face Spaces, GitHub Actions.  
> Consulta [UD8 — Despliegue, IA y Cloud](/sge/spring/ud8) para los fundamentos teóricos completos.

## Duración

12 horas (4 partes × 3h)

## Objetivo

Partiendo de `erpbalmis_8`, completar el ERP Balmis con:

- **Parte A (3h):** Base de datos PostgreSQL en la nube con Neon — adiós a H2 en producción.
- **Parte B (3h):** Asistente de IA integrado en el ERP usando Spring AI y Hugging Face.
- **Parte C (3h):** Contenedor Docker — el ERP Balmis en una imagen reproducible.
- **Parte D (3h):** Despliegue automático en Hugging Face Spaces con pipeline CI/CD via GitHub Actions.

## Descripción del reto

El ERP Balmis tiene ya todos los módulos de negocio completos. En este reto final le dotamos de las tres capas que lo convierten en un proyecto de portfolio profesional:

1. **Base de datos real** — PostgreSQL en Neon, accesible desde cualquier lugar, datos persistentes.
2. **Asistente IA** — un chat en el propio ERP que responde preguntas de negocio con contexto real.
3. **Despliegue en la nube** — URL pública, pipeline CI/CD: cada `git push` actualiza el ERP automáticamente.

Al terminar el reto, el ERP Balmis estará accesible en internet con una URL real que puedes incluir en tu CV.

---

## Parte A — Neon: PostgreSQL en la nube

### Paso A1 — Crear la cuenta y el proyecto en Neon

1. Ve a [neon.tech](https://neon.tech) → **Sign Up** (usa tu cuenta de GitHub para simplificar).
2. Crea un nuevo proyecto: nombre `erp-balmis`, región **Europe West** o la más cercana.
3. Neon crea la base de datos `neondb` automáticamente.
4. En el panel: **Connect** → **Java** → copia la cadena de conexión JDBC completa.

Guarda en un lugar seguro (no en el código) estos tres valores:
- **URL JDBC**: `jdbc:postgresql://ep-xxx.eu-west-2.aws.neon.tech/neondb?sslmode=require`
- **Usuario**: el que muestra Neon (normalmente `neondb_owner` o similar)
- **Contraseña**: solo visible una vez — guárdala ahora

### Paso A2 — Añadir la dependencia PostgreSQL al pom.xml

Abre `erpbalmis_9/pom.xml` (copia de erpbalmis_8) y añade el driver PostgreSQL junto a H2:

```xml
<!-- H2 — sigue siendo necesario para el perfil dev y los tests -->
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>

<!-- PostgreSQL — para el perfil prod (Neon) -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

### Paso A3 — Crear los ficheros de perfil

Crea `src/main/resources/application-dev.properties`:

```properties
# Perfil dev: H2 en memoria (sin cambios respecto al comportamiento actual)
spring.datasource.url=jdbc:h2:mem:erpbalmis
spring.datasource.driver-class-name=org.h2.Driver
spring.jpa.hibernate.ddl-auto=create-drop
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
```

Crea `src/main/resources/application-prod.properties`:

```properties
# Perfil prod: PostgreSQL en Neon
spring.datasource.url=${NEON_URL}
spring.datasource.username=${NEON_USER}
spring.datasource.password=${NEON_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.h2.console.enabled=false
server.port=${SERVER_PORT:8080}
```

Actualiza `application.properties` para que el perfil por defecto sea `dev`:

```properties
spring.application.name=erp-balmis
spring.profiles.active=dev
erp.dashboard.umbral-stock-bajo=10
```

### Paso A4 — Añadir `application-prod.properties` al `.gitignore`

Para no subir las variables de entorno al repositorio aunque alguien las escriba directamente:

Abre (o crea) `.gitignore` en la raíz del proyecto y añade:

```
application-prod.properties
```

### Paso A5 — Probar la conexión con Neon en local

Ejecuta la aplicación con el perfil `prod` usando las variables de entorno reales:

```powershell
$env:NEON_URL      = "jdbc:postgresql://ep-xxx.eu-west-2.aws.neon.tech/neondb?sslmode=require"
$env:NEON_USER     = "tu-usuario-neon"
$env:NEON_PASSWORD = "tu-contraseña-neon"
$env:SPRING_PROFILES_ACTIVE = "prod"
.\mvnw spring-boot:run
```

Abre el navegador en `http://localhost:8080`. Si la aplicación arranca y puedes crear un cliente, la conexión con Neon funciona. Los datos ahora persisten en la nube.

**Verificación:** Crea un cliente, para la aplicación, vuelve a arrancarla con perfil `prod` y comprueba que el cliente sigue ahí.

---

## Parte B — Asistente IA con Spring AI

### Paso B1 — Crear la cuenta en Hugging Face y obtener la API key

1. Ve a [huggingface.co](https://huggingface.co) → **Sign Up** (cuenta gratuita).
2. En tu perfil → **Settings** → **Access Tokens** → **New token**.
3. Permisos: **Read** es suficiente.
4. Copia el token — empieza por `hf_`. Guárdalo en lugar seguro.

### Paso B2 — Añadir Spring AI al pom.xml

Añade el BOM de Spring AI en la sección `<dependencyManagement>`:

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.ai</groupId>
            <artifactId>spring-ai-bom</artifactId>
            <version>2.0.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

Añade la dependencia del starter en `<dependencies>`:

```xml
<!-- Spring AI con endpoint compatible OpenAI (funciona con HF router) -->
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-openai-spring-boot-starter</artifactId>
</dependency>
```

### Paso B3 — Configurar Spring AI en `application.properties`

Añade al final de `application.properties`:

```properties
# Spring AI — Hugging Face vía router compatible con OpenAI
spring.ai.openai.api-key=${HF_API_KEY}
spring.ai.openai.base-url=https://router.huggingface.co/v1
spring.ai.openai.chat.options.model=mistralai/Mistral-7B-Instruct-v0.3
```

### Paso B4 — Crear `AsistenteService`

Crea `src/main/java/.../service/AsistenteService.java`:

```java
@Service
public class AsistenteService {

    private final ChatClient chatClient;
    private final DashboardService dashboardService;

    public AsistenteService(ChatClient.Builder builder, DashboardService dashboardService) {
        this.chatClient = builder
            .defaultSystem("""
                Eres el asistente del ERP Balmis de IES Doctor Balmis.
                Responde siempre en español, de forma concisa y orientada al negocio.
                Si no tienes suficiente información, dilo claramente.
                """)
            .build();
        this.dashboardService = dashboardService;
    }

    public String preguntar(String pregunta) {
        DashboardDTO kpis = dashboardService.obtenerKpis();
        String contexto = String.format(
            "Estado actual del ERP: %d clientes activos, %d prospectos, " +
            "%d pedidos confirmados, %.2f€ facturados, %d productos con stock bajo.",
            kpis.clientesActivos(),
            kpis.clientesProspectos(),
            kpis.pedidosPorEstado().getOrDefault(EstadoPedido.CONFIRMADO, 0L),
            kpis.totalFacturado(),
            kpis.productosStockBajo().size()
        );

        return chatClient.prompt()
            .user(contexto + "\n\nPregunta del usuario: " + pregunta)
            .call()
            .content();
    }
}
```

### Paso B5 — Crear `AsistenteController`

Crea `src/main/java/.../controller/AsistenteController.java`:

```java
@Controller
@RequestMapping("/asistente")
public class AsistenteController {

    private final AsistenteService asistenteService;

    @GetMapping
    public String mostrarChat(Model model) {
        model.addAttribute("respuesta", null);
        return "asistente/chat";
    }

    @PostMapping
    public String preguntar(@RequestParam String pregunta, Model model) {
        String respuesta = asistenteService.preguntar(pregunta);
        model.addAttribute("pregunta", pregunta);
        model.addAttribute("respuesta", respuesta);
        return "asistente/chat";
    }
}
```

### Paso B6 — Crear la plantilla `asistente/chat.html`

Crea `src/main/resources/templates/asistente/chat.html` siguiendo el mismo layout del resto del proyecto:

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org"
      xmlns:sec="http://www.thymeleaf.org/extras/spring-security">
<head>
    <title>Asistente IA — ERP Balmis</title>
    <!-- Incluir los mismos CSS del proyecto -->
</head>
<body>
    <!-- Incluir navbar y layout habitual -->

    <div class="container mt-4">
        <h2>🤖 Asistente ERP Balmis</h2>
        <p class="text-muted">Pregunta sobre clientes, pedidos o el estado del negocio.</p>

        <form th:action="@{/asistente}" method="post" class="mb-4">
            <div class="input-group">
                <input type="text" name="pregunta" class="form-control form-control-lg"
                       placeholder="Ej: ¿Cuántos pedidos hay pendientes de envío?"
                       th:value="${pregunta}" required autofocus />
                <button type="submit" class="btn btn-primary btn-lg">Preguntar</button>
            </div>
        </form>

        <!-- Respuesta del asistente -->
        <div th:if="${respuesta}" class="card border-primary">
            <div class="card-header bg-primary text-white">
                <strong>🤖 Asistente</strong>
            </div>
            <div class="card-body">
                <p th:text="${respuesta}" class="mb-0"></p>
            </div>
        </div>

        <!-- Preguntas de ejemplo -->
        <div class="mt-4">
            <h6 class="text-muted">Ejemplos de preguntas:</h6>
            <ul class="list-unstyled">
                <li>• ¿Cuántos clientes activos tenemos?</li>
                <li>• ¿Hay productos con stock bajo?</li>
                <li>• ¿Cuál es el total facturado?</li>
                <li>• Resumen del estado del negocio.</li>
            </ul>
        </div>
    </div>
</body>
</html>
```

### Paso B7 — Añadir el enlace en la navbar

En `layout/navbar.html` (o el fragmento de navegación que uses), añade un enlace al asistente:

```html
<a th:href="@{/asistente}" class="nav-link">🤖 Asistente IA</a>
```

Y protégelo en `SecurityConfig` — solo usuarios autenticados deben acceder:

```java
// La ruta /asistente ya queda protegida por la regla general de autenticación
// Si tienes rutas públicas explícitas, asegúrate de que /asistente no esté en ellas
```

### Paso B8 — Probar el asistente en local

```powershell
$env:HF_API_KEY = "hf_tuTokenDeHuggingFace"
.\mvnw spring-boot:run
```

Abre `http://localhost:8080/asistente`, escribe "¿Cuántos clientes activos tenemos?" y verifica que el asistente responde con datos reales del ERP.

---

## Parte C — Docker: entorno local reproducible

### Paso C1 — Crear el `Dockerfile`

En la raíz del proyecto `erpbalmis_9/`, crea el fichero `Dockerfile`:

```dockerfile
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 7860
ENTRYPOINT ["java", "-jar", "app.jar"]
```

El puerto 7860 es el que espera Hugging Face Spaces. En local lo mapearemos al 8080.

### Paso C2 — Crear `docker-compose.yml`

En la raíz del proyecto, crea `docker-compose.yml`:

```yaml
services:

  db:
    image: postgres:17-alpine
    environment:
      POSTGRES_DB: erpbalmis
      POSTGRES_USER: erp
      POSTGRES_PASSWORD: erp_secret
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  app:
    build: .
    ports:
      - "8080:7860"
    environment:
      SPRING_PROFILES_ACTIVE: prod
      NEON_URL: jdbc:postgresql://db:5432/erpbalmis
      NEON_USER: erp
      NEON_PASSWORD: erp_secret
      HF_API_KEY: ${HF_API_KEY}
      SERVER_PORT: "7860"
    depends_on:
      - db

volumes:
  pgdata:
```

### Paso C3 — Compilar el JAR y construir la imagen

```powershell
# Compilar el JAR (necesario antes del docker build)
.\mvnw clean package -DskipTests

# Construir la imagen Docker
docker build -t erpbalmis:latest .

# Verificar que la imagen se ha creado
docker images
```

### Paso C4 — Arrancar el entorno completo

```powershell
# Arrancar BD + aplicación (pasa la API key de HF desde tu entorno local)
$env:HF_API_KEY = "hf_tuToken"
docker compose up
```

Abre `http://localhost:8080`. El ERP está corriendo en Docker con PostgreSQL local.

Para parar:

```powershell
docker compose down        # para y elimina contenedores (los datos del volumen persisten)
docker compose down -v     # para y elimina también los volúmenes (borra datos)
```

**Verificación:** Crea un cliente vía navegador. Para y vuelve a arrancar con `docker compose up`. El cliente debe seguir ahí (gracias al volumen `pgdata`).

### Paso C5 — Añadir `.dockerignore`

Crea `.dockerignore` en la raíz del proyecto para evitar que Docker copie ficheros innecesarios:

```
.git
.gitignore
target/
*.md
src/
```

> Con `.dockerignore`, la imagen solo incluye lo mínimo necesario — el JAR ya compilado. Esto reduce el tamaño y acelera el `docker build`.

---

## Parte D — Hugging Face Spaces + GitHub Actions

### Paso D1 — Crear el Space en Hugging Face

1. Ve a [huggingface.co/spaces](https://huggingface.co/spaces) → **Create new Space**.
2. Configura:
   - **Owner**: tu usuario de HF
   - **Name**: `erpbalmis`
   - **SDK**: **Docker** (obligatorio)
   - **Visibility**: Public
3. Haz clic en **Create Space**. HF crea un repositorio Git vacío.

### Paso D2 — Crear el `README.md` del Space

En la raíz de `erpbalmis_9/`, crea o actualiza el `README.md` con los metadatos que requiere HF:

```markdown
---
title: ERP Balmis
emoji: 🏢
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# ERP Balmis — IES Doctor Balmis

Mini ERP/CRM desarrollado con Spring Boot · DAM · Curso 2026-2027

**Stack:** Java 25 · Spring Boot 4 · Thymeleaf · Spring Security · Spring AI · PostgreSQL (Neon)
```

### Paso D3 — Configurar los Secrets del Space

Las credenciales de Neon y Hugging Face se configuran como variables de entorno en HF Spaces, no en el código:

1. En tu Space → **Settings** → **Repository secrets** → **New secret**.
2. Añade uno a uno:
   - `NEON_URL` → la URL JDBC de Neon completa
   - `NEON_USER` → tu usuario de Neon
   - `NEON_PASSWORD` → tu contraseña de Neon
   - `HF_API_KEY` → tu token de Hugging Face
   - `SPRING_PROFILES_ACTIVE` → `prod`
   - `SERVER_PORT` → `7860`

### Paso D4 — Crear el workflow de GitHub Actions

En el repositorio de GitHub del proyecto, crea `.github/workflows/deploy.yml`:

```yaml
name: CI/CD — ERP Balmis

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  test-build-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Descargar código
        uses: actions/checkout@v4
        with:
          fetch-depth: 0    # necesario para el push posterior

      - name: Configurar Java 25
        uses: actions/setup-java@v4
        with:
          java-version: '25'
          distribution: 'temurin'
          cache: maven

      - name: Ejecutar tests
        run: ./mvnw clean test

      - name: Compilar JAR
        run: ./mvnw package -DskipTests

      - name: Publicar en Hugging Face Spaces
        env:
          HF_TOKEN: ${{ secrets.HF_TOKEN }}
          HF_USER: ${{ secrets.HF_USER }}
        run: |
          git config user.email "github-actions@github.com"
          git config user.name "GitHub Actions"
          git remote add hf https://$HF_USER:$HF_TOKEN@huggingface.co/spaces/$HF_USER/erpbalmis
          git push hf main --force
```

### Paso D5 — Añadir los Secrets en GitHub

1. En el repositorio de GitHub → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.
2. Añade:
   - `HF_TOKEN` → tu token de Hugging Face (el mismo que usas localmente)
   - `HF_USER` → tu nombre de usuario de Hugging Face

### Paso D6 — Primer despliegue

```powershell
cd "ruta/a/erpbalmis_9"

git add .
git commit -m "feat: Reto 9 completo — Neon, Spring AI, Docker, HF Spaces, GitHub Actions"
git push
```

Ve a la pestaña **Actions** del repositorio en GitHub. Verás el workflow ejecutándose. Si todo va bien (verde), en 2-3 minutos el ERP estará disponible en:

```
https://TU_USUARIO_HF-erpbalmis.hf.space
```

**Verificación final:**
1. Abre la URL pública del Space.
2. Inicia sesión con un usuario del `import.sql`.
3. Navega por Clientes, Pedidos, Dashboard.
4. Abre el Asistente IA y escribe una pregunta.
5. Verifica que los datos persisten (son de Neon, no de H2 en memoria).

---

## Entregable

**ERP Balmis completo y desplegado en la nube** con:

- ✅ Base de datos PostgreSQL en Neon (datos persistentes en la nube)
- ✅ Asistente IA accesible desde el menú de navegación
- ✅ Imagen Docker que arranca el ERP en cualquier máquina con `docker compose up`
- ✅ URL pública en Hugging Face Spaces (incluir en el CV)
- ✅ Badge CI/CD verde en el README del repositorio de GitHub
- ✅ Pipeline automático: cada `git push` a `main` despliega la nueva versión
