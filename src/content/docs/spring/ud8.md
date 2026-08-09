---
title: "UD8 — Despliegue, IA y Cloud"
description: Perfiles Spring Boot, base de datos cloud con Neon, asistente IA con Spring AI, containerización Docker y despliegue continuo con Hugging Face Spaces y GitHub Actions.
---

### UD8 — Despliegue, IA y Cloud
**Módulo SGE · DAM · IES Doctor Balmis**

---

> **Duración:** 12 horas (Reto 9: 4 partes × 3h)  
> **Herramientas:** Spring Profiles, Neon, Spring AI, Docker, Hugging Face Spaces, GitHub Actions  
> **Prerequisito:** [UD7 — Módulos Avanzados y Dashboard](/sge/spring/ud7)  
> **Objetivo:** Llevar el ERP Balmis a producción real: base de datos en la nube, asistente de IA integrado, contenedor Docker y pipeline CI/CD automático.

---

## Índice

1. [¿Por qué desplegar en la nube?](#1-por-qué-desplegar-en-la-nube)
2. [Perfiles Spring Boot — dev y prod](#2-perfiles-spring-boot--dev-y-prod)
3. [Variables de entorno y seguridad de credenciales](#3-variables-de-entorno-y-seguridad-de-credenciales)
4. [PostgreSQL en la nube con Neon](#4-postgresql-en-la-nube-con-neon)
5. [🎯 PAUSA: Aquí puedes completar el **Reto 9 Parte A**](#5--pausa-aquí-puedes-completar-el-reto-9-parte-a)
6. [Inteligencia Artificial en aplicaciones Java](#6-inteligencia-artificial-en-aplicaciones-java)
7. [Spring AI — ChatClient y el patrón prompt-response](#7-spring-ai--chatclient-y-el-patrón-prompt-response)
8. [Hugging Face Inference API — modelos gratuitos](#8-hugging-face-inference-api--modelos-gratuitos)
9. [🎯 PAUSA: Aquí puedes completar el **Reto 9 Parte B**](#9--pausa-aquí-puedes-completar-el-reto-9-parte-b)
10. [Docker — contenedores para Spring Boot](#10-docker--contenedores-para-spring-boot)
11. [Dockerfile — empaquetar la aplicación](#11-dockerfile--empaquetar-la-aplicación)
12. [docker-compose.yml — orquestación local](#12-docker-composeyml--orquestación-local)
13. [🎯 PAUSA: Aquí puedes completar el **Reto 9 Parte C**](#13--pausa-aquí-puedes-completar-el-reto-9-parte-c)
14. [Hugging Face Spaces — despliegue gratuito con Docker](#14-hugging-face-spaces--despliegue-gratuito-con-docker)
15. [GitHub Actions — pipeline CI/CD completo](#15-github-actions--pipeline-cicd-completo)
16. [🎯 PAUSA: Aquí puedes completar el **Reto 9 Final**](#16--pausa-aquí-puedes-completar-el-reto-9-final)

---

## 1. ¿Por qué desplegar en la nube?

Durante los Retos 0 al 8 el ERP Balmis ha vivido exclusivamente en tu máquina local. Eso es perfecto para desarrollar, pero en un entorno profesional real:

- Los clientes necesitan acceder desde cualquier lugar y dispositivo.
- El equipo de desarrollo trabaja en paralelo y necesita un entorno compartido.
- El código debe pasar pruebas automáticas antes de llegar a producción.
- La base de datos no puede estar en la memoria de un portátil.

Este es el momento de dar el salto. Al final de esta UD, el ERP Balmis estará:

| Aspecto | Situación actual | Situación tras UD8 |
|---|---|---|
| Base de datos | H2 en memoria (se borra al reiniciar) | PostgreSQL en Neon (persistente, en la nube) |
| Inteligencia | Ninguna | Asistente IA integrado (Spring AI + Hugging Face) |
| Despliegue | Solo en local | En internet, accesible con URL pública |
| CI/CD | Manual (F5 en VS Code) | Automático al hacer `git push` |

### Comparación con Axelor

En Axelor, todo esto viene configurado de fábrica: la base de datos, el servidor, la interfaz. La empresa que implanta Axelor se encarga de ese despliegue. En el ERP Balmis **tú eres quien configura cada capa**. Eso es exactamente lo que diferencia a un desarrollador de un usuario.

---

## 2. Perfiles Spring Boot — dev y prod

Spring Boot permite tener configuraciones distintas para distintos entornos usando **perfiles**. El mecanismo es sencillo: un fichero de propiedades por perfil.

### Ficheros de configuración por perfil

```
src/main/resources/
  application.properties          ← configuración base (siempre activa)
  application-dev.properties      ← se activa con perfil "dev"
  application-prod.properties     ← se activa con perfil "prod"
```

Spring combina el fichero base con el del perfil activo. Si un valor aparece en los dos, **el del perfil tiene prioridad**.

### Ejemplo: base de datos según entorno

`application.properties` (base, siempre activo):
```properties
spring.application.name=erp-balmis
erp.dashboard.umbral-stock-bajo=10
```

`application-dev.properties` (desarrollo local):
```properties
# H2 en memoria — cómodo para desarrollar sin instalar nada
spring.datasource.url=jdbc:h2:mem:erpbalmis
spring.datasource.driver-class-name=org.h2.Driver
spring.jpa.hibernate.ddl-auto=create-drop
spring.h2.console.enabled=true
```

`application-prod.properties` (producción en la nube):
```properties
# PostgreSQL en Neon — datos persistentes
spring.datasource.url=${NEON_URL}
spring.datasource.username=${NEON_USER}
spring.datasource.password=${NEON_PASSWORD}
spring.jpa.hibernate.ddl-auto=update
spring.h2.console.enabled=false
```

### Cómo activar un perfil

**En local** (variable de entorno en la terminal):
```powershell
$env:SPRING_PROFILES_ACTIVE = "prod"
.\mvnw spring-boot:run
```

**En Docker** (variable en docker-compose.yml):
```yaml
environment:
  SPRING_PROFILES_ACTIVE: prod
```

**En Hugging Face Spaces** (variable configurada en los ajustes del Space).

> **Regla práctica:** Si no indicas ningún perfil, Spring Boot arranca con el perfil por defecto, que usa `application.properties` (sin sufijo). Así el ERP sigue funcionando en local con H2 sin tocar nada.

### Comparación con Axelor

En Axelor, la configuración se hace en `axelor-config.properties`. El principio es idéntico: un fichero de propiedades que cambia según el entorno. La diferencia es que Spring Boot lo gestiona de forma estándar y declarativa.

---

## 3. Variables de entorno y seguridad de credenciales

Fíjate en `application-prod.properties`:

```properties
spring.datasource.url=${NEON_URL}
```

La sintaxis `${NOMBRE_VARIABLE}` le dice a Spring: *"busca este valor en las variables de entorno del sistema operativo"*. Esto es fundamental por seguridad.

### ¿Por qué nunca escribir credenciales en el código?

```properties
# ❌ MAL: la contraseña queda visible en GitHub para siempre
spring.datasource.password=miClaveSecreta123

# ✅ BIEN: la contraseña vive en la variable de entorno, fuera del repositorio
spring.datasource.password=${NEON_PASSWORD}
```

Un error muy común (y muy grave) es subir credenciales a GitHub. Bots automatizados escanean GitHub continuamente buscando contraseñas y claves API expuestas. Si subes una clave de base de datos, en minutos alguien puede acceder y borrar todos tus datos.

### Las tres reglas de oro

1. **Nunca escribas una credencial real en un fichero que va a GitHub.**
2. **Añade `application-prod.properties` a `.gitignore`** si va a contener valores reales (no referencias `${VAR}`).
3. **Usa secrets** (en GitHub Actions) o variables de entorno (en HF Spaces) para las credenciales en producción.

### Valor por defecto con `:`

Spring permite definir un valor por defecto si la variable no existe:

```properties
# Si SERVER_PORT no está definida como variable de entorno, usa 8080
server.port=${SERVER_PORT:8080}
```

Esto es muy útil: en local arranca en el puerto 8080, en Hugging Face Spaces arrancará en el 7860 (que es el puerto que espera HF).

---

## 4. PostgreSQL en la nube con Neon

**Neon** es un servicio de PostgreSQL serverless en la nube con capa gratuita generosa. No necesitas tarjeta de crédito para empezar.

### ¿Por qué PostgreSQL y no H2?

| Característica | H2 (desarrollo) | PostgreSQL / Neon (producción) |
|---|---|---|
| Persistencia | Los datos se borran al reiniciar | Los datos persisten siempre |
| Concurrencia | Limitada, un solo proceso | Múltiples conexiones simultáneas |
| Funciones SQL | Básicas | Completas (JSON, arrays, full-text search…) |
| Uso real en empresas | Solo para tests | NTT Data, Accenture, DXC… usan PostgreSQL |
| Conexión remota | No (solo local) | Sí, desde cualquier lugar |

H2 es perfecto para desarrollar y para los tests automatizados. Pero en producción nunca se usa H2: se usa PostgreSQL, MySQL, Oracle o SQL Server.

### Crear una cuenta en Neon

1. Ve a [neon.tech](https://neon.tech) y haz clic en **Sign Up** (puedes usar tu cuenta de GitHub).
2. Crea un nuevo proyecto: dale un nombre (p.ej. `erp-balmis`) y elige la región más cercana (Europe West).
3. Neon crea automáticamente una base de datos llamada `neondb`.
4. En el panel, haz clic en **Connect** → selecciona **Java** → copia la **Connection string**.

La cadena de conexión tiene este aspecto:

```
jdbc:postgresql://ep-mist-abc-123456.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

Guarda también el usuario y la contraseña que muestra Neon — solo los verás una vez.

### Añadir el driver PostgreSQL al pom.xml

H2 ya está en el `pom.xml` de erpbalmis_8. Añade PostgreSQL:

```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

> No elimines la dependencia H2: la necesitas para el perfil `dev` y para los tests.

### Configurar `application-prod.properties`

```properties
# Neon — PostgreSQL serverless
spring.datasource.url=${NEON_URL}
spring.datasource.username=${NEON_USER}
spring.datasource.password=${NEON_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# H2 Console desactivada en producción
spring.h2.console.enabled=false

# Puerto configurable para HF Spaces
server.port=${SERVER_PORT:8080}
```

### Diferencias de SQL entre H2 y PostgreSQL

La mayoría del código JPA funciona igual en H2 y PostgreSQL porque Hibernate genera el SQL por ti. Sin embargo, hay detalles a vigilar:

| Situación | H2 | PostgreSQL |
|---|---|---|
| Nombres de tabla con mayúsculas | Funciona | Requiere comillas dobles o nombres en minúscula |
| `ddl-auto=create-drop` | Recrea la BD cada arranque | Riesgo de borrar datos reales — usa `update` |
| `import.sql` | Se ejecuta en cada arranque | Solo con `create` o `create-drop` — peligroso en prod |

> **Importante:** En `application-prod.properties` usa siempre `spring.jpa.hibernate.ddl-auto=update`, nunca `create-drop`. Con `create-drop` borrarías todos los datos de producción cada vez que reinicies la aplicación.

---

## 5. 🎯 PAUSA: Aquí puedes completar el **Reto 9 Parte A**

> Has visto los conceptos de perfiles Spring Boot, variables de entorno y Neon. Completa la **[Parte A del Reto 9](/sge/retos/reto9-nube#parte-a--neon--postgresql-en-la-nube)** antes de continuar.

---

## 6. Inteligencia Artificial en aplicaciones Java

En 2026, la IA no es una tecnología futura: es una capa más del stack de cualquier aplicación empresarial. NTT Data, Accenture y DXC ya integran LLMs en sus productos. Las empresas esperan que los desarrolladores sepan llamar a APIs de modelos de lenguaje desde sus aplicaciones.

### ¿Qué es un LLM?

Un **Large Language Model** (modelo de lenguaje de gran tamaño) es un modelo de IA entrenado con enormes cantidades de texto que puede:
- Generar texto coherente en respuesta a una instrucción (*prompt*).
- Resumir documentos.
- Traducir, clasificar, responder preguntas.
- Escribir código.

Los más conocidos: GPT-4 (OpenAI), Gemini (Google), Llama 3 (Meta), Mistral (Mistral AI).

### ¿Cómo se integra en una aplicación Java?

Los LLMs se exponen como **APIs REST**. Tu aplicación Spring Boot envía un JSON con el texto de entrada y recibe un JSON con la respuesta del modelo. Spring AI abstrae esa llamada HTTP en una API Java limpia.

```
Usuario → Thymeleaf → AsistenteController → Spring AI ChatClient → LLM API → respuesta → Thymeleaf
```

La clave pedagógica: **el controlador es Spring Boot puro**. El alumno aplica los mismos patrones que en los Retos anteriores (`@Controller`, `Model`, Thymeleaf) — solo cambia la fuente de datos: en vez de un repositorio JPA, es una llamada a un LLM.

---

## 7. Spring AI — ChatClient y el patrón prompt-response

**Spring AI** es una librería oficial del ecosistema Spring que proporciona una abstracción unificada para trabajar con distintos proveedores de LLMs (OpenAI, Hugging Face, Ollama, Anthropic…).

### Añadir Spring AI al proyecto

En el `pom.xml`, primero añade el BOM de Spring AI en `<dependencyManagement>`:

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

Luego añade el starter (usaremos el compatible con OpenAI, que también funciona con Hugging Face):

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-openai-spring-boot-starter</artifactId>
</dependency>
```

### El ChatClient

`ChatClient` es la pieza central de Spring AI. Se construye con un `ChatClient.Builder` que Spring inyecta automáticamente:

```java
@Service
public class AsistenteService {

    private final ChatClient chatClient;

    public AsistenteService(ChatClient.Builder builder) {
        this.chatClient = builder
            .defaultSystem("Eres el asistente del ERP Balmis. Responde en español, " +
                           "de forma concisa y orientada al negocio.")
            .build();
    }

    public String preguntar(String pregunta) {
        return chatClient.prompt()
            .user(pregunta)
            .call()
            .content();
    }
}
```

### El patrón prompt-response

| Concepto | Descripción | Ejemplo |
|---|---|---|
| **System prompt** | Instrucción fija que define el rol y el tono del asistente | "Eres el asistente del ERP Balmis…" |
| **User prompt** | Texto que escribe el usuario en el formulario | "¿Cuántos clientes activos tenemos?" |
| **Response** | Texto que devuelve el LLM | "Actualmente hay 42 clientes activos." |

### Enriquecer el prompt con datos reales del ERP

El truco para que el asistente sea útil es incluir datos reales del ERP en el prompt:

```java
public String preguntarConContexto(String pregunta, DashboardDTO kpis) {
    String contexto = String.format(
        "Contexto del ERP: %d clientes activos, %d pedidos pendientes, %.2f€ facturados.",
        kpis.clientesActivos(), kpis.pedidosPorEstado().getOrDefault(EstadoPedido.CONFIRMADO, 0L),
        kpis.totalFacturado()
    );

    return chatClient.prompt()
        .user(contexto + "\n\nPregunta: " + pregunta)
        .call()
        .content();
}
```

Así el modelo tiene contexto real y puede responder preguntas como "¿hay pedidos urgentes?" con datos verdaderos.

---

## 8. Hugging Face Inference API — modelos gratuitos

**Hugging Face** es la plataforma de referencia para modelos de IA open-source. Su **Inference API** permite llamar a modelos alojados en sus servidores de forma gratuita (con límite de velocidad).

### Crear una cuenta y obtener la API key

1. Ve a [huggingface.co](https://huggingface.co) y crea una cuenta gratuita.
2. En tu perfil → **Settings** → **Access Tokens** → **New token**.
3. Dale el permiso **Read** y copia el token. Empieza por `hf_`.

### El router OpenAI-compatible de Hugging Face

Hugging Face ofrece un endpoint compatible con la API de OpenAI, lo que significa que Spring AI (que ya habla con OpenAI) puede hablar con Hugging Face sin cambios de código:

```
https://router.huggingface.co/v1
```

Se configura en `application.properties`:

```properties
# API key de Hugging Face
spring.ai.openai.api-key=${HF_API_KEY}
# Endpoint compatible con OpenAI de HF
spring.ai.openai.base-url=https://router.huggingface.co/v1
# Modelo a usar (gratuito)
spring.ai.openai.chat.options.model=mistralai/Mistral-7B-Instruct-v0.3
```

### Modelos gratuitos recomendados

| Modelo | Tamaño | Ideal para |
|---|---|---|
| `mistralai/Mistral-7B-Instruct-v0.3` | 7B parámetros | Conversación en español, instrucciones |
| `meta-llama/Llama-3.2-3B-Instruct` | 3B parámetros | Respuestas rápidas, preguntas cortas |
| `HuggingFaceH4/zephyr-7b-beta` | 7B parámetros | Texto estructurado, resúmenes |

> **Límite gratuito:** La capa gratuita de HF tiene un límite de peticiones por minuto. Es suficiente para uso educativo — en producción real se usaría una clave de pago o un modelo alojado localmente con Ollama.

---

## 9. 🎯 PAUSA: Aquí puedes completar el **Reto 9 Parte B**

> Has visto Spring AI y la Inference API de Hugging Face. Completa la **[Parte B del Reto 9](/sge/retos/reto9-nube#parte-b--asistente-ia-con-spring-ai)** antes de continuar.

---

## 10. Docker — contenedores para Spring Boot

**Docker** es la tecnología estándar de la industria para empaquetar y ejecutar aplicaciones de forma reproducible. Lo has utilizado ya para arrancar Axelor con `docker compose up` — ahora aprenderás a crear tu propia imagen.

### Contenedor vs Máquina Virtual

| Aspecto | Máquina Virtual | Contenedor Docker |
|---|---|---|
| Incluye | Sistema operativo completo | Solo la aplicación y sus dependencias |
| Tamaño | Varios GB | Decenas-cientos de MB |
| Arranque | Minutos | Segundos |
| Aislamiento | Completo | A nivel de proceso |
| Uso en empresas | Infraestructura | Microservicios y aplicaciones |

### El ciclo de vida de una imagen Docker

```
Dockerfile  →  docker build  →  Imagen  →  docker run  →  Contenedor en ejecución
                                   ↓
                             Docker Hub / HF Spaces (imagen publicada)
```

### Comandos básicos

```bash
# Construir una imagen desde el Dockerfile del directorio actual
docker build -t erpbalmis:latest .

# Ejecutar un contenedor a partir de la imagen
docker run -p 8080:8080 erpbalmis:latest

# Ver contenedores en ejecución
docker ps

# Parar un contenedor
docker stop <ID>

# Arrancar todo el entorno con docker-compose
docker compose up

# Parar y eliminar los contenedores de docker-compose
docker compose down
```

---

## 11. Dockerfile — empaquetar la aplicación

El **Dockerfile** es el recetario que le dice a Docker cómo construir la imagen de tu aplicación.

### Dockerfile para el ERP Balmis

```dockerfile
# Imagen base con Java 25 (JRE ligero para producción)
FROM eclipse-temurin:25-jre-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar el JAR generado por Maven
COPY target/*.jar app.jar

# Puerto que expone la aplicación
# HF Spaces requiere el 7860; en local usaremos 8080
EXPOSE 7860

# Comando de arranque — SERVER_PORT viene de la variable de entorno
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### ¿Por qué `-alpine`?

La imagen `eclipse-temurin:25-jre-alpine` pesa ~180 MB frente a los ~500 MB de la versión estándar. Alpine Linux es una distribución minimalista pensada exactamente para contenedores. En producción, cuanto más pequeña la imagen, más rápido el despliegue.

### Construir el JAR antes de crear la imagen

Docker copia el JAR ya compilado. Antes de `docker build`, necesitas compilarlo:

```powershell
.\mvnw clean package -DskipTests
```

Esto genera `target/spring-0.0.1-SNAPSHOT.jar`. El `COPY target/*.jar` lo coge automáticamente.

---

## 12. docker-compose.yml — orquestación local

Con un solo Dockerfile solo tienes la aplicación. Pero en producción necesitas también la base de datos. `docker-compose.yml` define y orquesta múltiples servicios.

```yaml
services:

  # Base de datos PostgreSQL local (alternativa a Neon para pruebas)
  db:
    image: postgres:17-alpine
    environment:
      POSTGRES_DB: erpbalmis
      POSTGRES_USER: erp
      POSTGRES_PASSWORD: erp_secret
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data   # datos persistentes entre reinicios

  # Aplicación Spring Boot
  app:
    build: .
    ports:
      - "8080:7860"      # puerto local:puerto del contenedor
    environment:
      SPRING_PROFILES_ACTIVE: prod
      NEON_URL: jdbc:postgresql://db:5432/erpbalmis
      NEON_USER: erp
      NEON_PASSWORD: erp_secret
      HF_API_KEY: ${HF_API_KEY}   # tomado del entorno local
      SERVER_PORT: "7860"
    depends_on:
      - db

volumes:
  pgdata:
```

> Fíjate en `depends_on: [db]` — garantiza que PostgreSQL arranque antes que la aplicación. Y en `db:5432` como host: dentro de la red Docker, los servicios se comunican por nombre de servicio.

### Probar el entorno completo en local

```powershell
# 1. Compilar el JAR
.\mvnw clean package -DskipTests

# 2. Levantar BD + app
docker compose up

# 3. Abrir el navegador en http://localhost:8080
# 4. Parar todo
docker compose down
```

---

## 13. 🎯 PAUSA: Aquí puedes completar el **Reto 9 Parte C**

> Has visto Docker, el Dockerfile y docker-compose.yml. Completa la **[Parte C del Reto 9](/sge/retos/reto9-nube#parte-c--docker--entorno-local-reproducible)** antes de continuar.

---

## 14. Hugging Face Spaces — despliegue gratuito con Docker

**Hugging Face Spaces** es una plataforma de alojamiento gratuita que, además de modelos de IA, permite desplegar aplicaciones web en contenedores Docker. Es equivalente a Render pero con integración directa con el ecosistema Hugging Face.

### ¿Cómo funciona un Space?

Un Space es un repositorio Git alojado en `huggingface.co/spaces/usuario/nombre`. Cuando haces `git push` a ese repositorio, HF detecta el `Dockerfile` y arranca un nuevo contenedor con tu aplicación. La URL pública tiene el formato:

```
https://usuario-nombre.hf.space
```

### Crear un Space

1. Ve a [huggingface.co/spaces](https://huggingface.co/spaces) → **Create new Space**.
2. Nombre: `erpbalmis` (o similar).
3. **SDK: Docker** (importante — no seleccionar Gradio ni Streamlit).
4. Visibilidad: Public (para que la URL sea accesible sin login).
5. Haz clic en **Create Space**.

### El fichero README.md del Space

HF Spaces usa el `README.md` para leer metadatos del Space. Debe tener este bloque YAML al inicio:

```markdown
---
title: ERP Balmis
emoji: 🏢
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
app_port: 7860
---

# ERP Balmis
Mini ERP/CRM desarrollado con Spring Boot — DAM IES Doctor Balmis
```

El campo `app_port: 7860` le dice a HF qué puerto escucha la aplicación. Por eso el Dockerfile expone el 7860 y `SERVER_PORT` se configura a 7860.

### Variables de entorno en HF Spaces

Las credenciales (Neon, HF API key) se configuran en los **Secrets del Space**:

1. En tu Space → **Settings** → **Repository secrets**.
2. Añade: `NEON_URL`, `NEON_USER`, `NEON_PASSWORD`, `HF_API_KEY`.
3. HF las inyecta como variables de entorno en el contenedor al arrancar.

---

## 15. GitHub Actions — pipeline CI/CD completo

**GitHub Actions** es el sistema de automatización integrado en GitHub. Permite ejecutar tareas automáticamente cuando ocurre un evento en el repositorio (p.ej. `git push`).

### Conceptos clave

| Concepto | Descripción |
|---|---|
| **Workflow** | Fichero YAML en `.github/workflows/` que define la automatización |
| **Trigger (`on`)** | Evento que dispara el workflow (push, pull_request, manual…) |
| **Job** | Unidad de trabajo que corre en una máquina virtual (runner) |
| **Step** | Comando o acción dentro de un job |
| **Secret** | Variable protegida en GitHub que el código no puede leer directamente |

### El pipeline CI/CD del ERP Balmis

El flujo completo al hacer `git push main`:

```
1. GitHub detecta el push
2. GitHub Actions arranca una VM Ubuntu
3. Descarga el código (checkout)
4. Instala Java 25
5. Ejecuta los tests (mvn test) → si fallan, para aquí
6. Compila el JAR (mvn package)
7. Hace git push al repositorio del HF Space
8. HF detecta el push y arranca el nuevo contenedor
9. El ERP está actualizado en internet
```

### El fichero `.github/workflows/deploy.yml`

```yaml
name: CI/CD — ERP Balmis

on:
  push:
    branches: [main]
  workflow_dispatch:    # permite lanzarlo manualmente desde GitHub

jobs:
  test-build-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Descargar código
        uses: actions/checkout@v4

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

      - name: Configurar git para el push a HF
        run: |
          git config user.email "github-actions@github.com"
          git config user.name "GitHub Actions"

      - name: Publicar en Hugging Face Spaces
        env:
          HF_TOKEN: ${{ secrets.HF_TOKEN }}
          HF_USER: tu-usuario-hf         # ← reemplaza con tu usuario de HF
          HF_SPACE: erpbalmis            # ← nombre del Space
        run: |
          git remote add hf https://$HF_USER:$HF_TOKEN@huggingface.co/spaces/$HF_USER/$HF_SPACE
          git push hf main --force
```

### Añadir el secret HF_TOKEN en GitHub

1. En el repositorio de GitHub → **Settings** → **Secrets and variables** → **Actions**.
2. Haz clic en **New repository secret**.
3. Nombre: `HF_TOKEN`, valor: el token de Hugging Face que obtuviste antes.
4. Guarda. GitHub lo cifra y nunca lo mostrará en los logs.

### Leer el resultado del pipeline

Tras el `git push`, ve a la pestaña **Actions** del repositorio. Verás el workflow ejecutándose:
- ⚙️ Amarillo: en progreso.
- ✅ Verde: completado con éxito — el ERP está desplegado.
- ❌ Rojo: algún paso ha fallado — haz clic para ver el log de error.

### El badge de estado en el README

Puedes mostrar el estado del último pipeline en el `README.md` del proyecto:

```markdown
![CI/CD](https://github.com/TU_USUARIO/TU_REPO/actions/workflows/deploy.yml/badge.svg)
```

En una entrevista de prácticas, un badge verde en el README demuestra que el proyecto tiene integración continua funcionando.

---

## 16. 🎯 PAUSA: Aquí puedes completar el **Reto 9 Final**

> Has completado toda la teoría de UD8. Completa la **[Parte D del Reto 9](/sge/retos/reto9-nube#parte-d--hugging-face-spaces--github-actions)** para desplegar el ERP Balmis en internet con pipeline CI/CD automático.
