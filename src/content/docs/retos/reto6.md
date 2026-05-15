---
title: Reto 6 — La Seguridad
description: UD6 — Spring Security con login visual, control de acceso por roles con sec:authorize, y JWT para la API REST
---

> **Conceptos teóricos:** Spring Security 7, sesión HTTP vs. JWT, `SecurityFilterChain`, `@Order`, formularios de login, `sec:authorize`.  
> Consulta [UD6 — Seguridad con Spring Security](/sge/spring/ud6) para los fundamentos de autenticación y autorización.

## Duración

12 horas

## Objetivo

Proteger el ERP Balmis con **dos mecanismos de seguridad complementarios**:

- **Parte A (5 h):** Formulario de login visual con sesión HTTP para las vistas Thymeleaf. El alumno experimenta la seguridad directamente en el navegador: redirige a `/login` sin autenticar, introduce credenciales y ve cómo cambian los botones según su rol.
- **Parte B (3 h):** Control de acceso por roles en los templates con `sec:authorize`. Los botones Eliminar, Editar y Nuevo aparecen o desaparecen según el rol del usuario autenticado.
- **Parte C (4 h):** JWT para la API REST. La misma aplicación gestiona dos cadenas de seguridad paralelas: sesión para MVC, token para `/api/**`.

## Descripción del reto

Partiendo de `erpbalmis_5`, se añade Spring Security con una **arquitectura dual de `SecurityFilterChain`**:

- **Cadena 1** (`@Order(1)`, matcher `/api/**`): stateless, sin sesión, JWT en cabecera `Authorization: Bearer`.
- **Cadena 2** (`@Order(2)`, matcher `/**`): stateful, sesión HTTP, formulario de login en `/login`.

La clave está en que las **dos cadenas comparten** el mismo `UserDetailsServiceImpl` y el mismo `PasswordEncoder`, pero aplican estrategias de autenticación completamente diferentes.

---

## Parte A — Login Visual para las Vistas Thymeleaf

### Paso A1 — `auth/login.html`: el formulario de login

Es una página **standalone** (sin usar el layout fragmentado) porque se muestra antes de autenticarse. Spring Security la gestiona automáticamente:

```html
<!DOCTYPE html>
<html lang="es" xmlns:th="http://www.thymeleaf.org">
<head>
    <title>Iniciar sesión — ERP Balmis</title>
    <link rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"/>
</head>
<body class="d-flex align-items-center justify-content-center min-vh-100">

    <div style="max-width:420px" class="w-100 px-3">
        <h1 class="h3 text-center mb-4">ERP Balmis</h1>

        <div class="card shadow-sm">
            <div class="card-body p-4">
                <h2 class="h5 text-center mb-4">Iniciar sesión</h2>

                <!-- Error de credenciales -->
                <div th:if="${param.error}" class="alert alert-danger py-2">
                    Usuario o contraseña incorrectos.
                </div>

                <!-- Cierre de sesión -->
                <div th:if="${param.logout}" class="alert alert-success py-2">
                    Has cerrado sesión correctamente.
                </div>

                <form th:action="@{/login}" method="post">
                    <div class="mb-3">
                        <label for="username" class="form-label fw-semibold">Usuario</label>
                        <input id="username" type="text" name="username"
                               class="form-control" autofocus required/>
                    </div>
                    <div class="mb-4">
                        <label for="password" class="form-label fw-semibold">Contraseña</label>
                        <input id="password" type="password" name="password"
                               class="form-control" required/>
                    </div>
                    <div class="d-grid">
                        <button type="submit" class="btn btn-dark">Entrar</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</body>
</html>
```

> **Puntos clave:**
> - `th:action="@{/login}"` añade automáticamente el token CSRF gracias a Thymeleaf + Spring Security.
> - Los campos **deben** llamarse `username` y `password` (nombres esperados por Spring Security por defecto).
> - `th:if="${param.error}"` detecta el parámetro `?error` que añade Spring Security al redirigir tras un fallo.
> - `th:if="${param.logout}"` detecta `?logout` tras un cierre de sesión correcto.

### Paso A2 — `SecurityConfig`: arquitectura dual de cadenas

La pieza central del Reto 6 son **dos `SecurityFilterChain` con `@Order`**:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsServiceImpl userDetailsService;

    // ── Cadena 1: API REST (/api/**) — stateless + JWT ─────────────────────
    @Bean
    @Order(1)
    public SecurityFilterChain apiFilterChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher("/api/**")
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s ->
                    s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .headers(h -> h.frameOptions(fo -> fo.sameOrigin()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.DELETE, "/api/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST,   "/api/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.PUT,    "/api/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.PATCH,  "/api/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.GET,    "/api/**").hasAnyRole("ADMIN", "MANAGER", "EMPLEADO")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    // ── Cadena 2: Vistas MVC (/**) — stateful + formulario de login ─────────
    @Bean
    @Order(2)
    public SecurityFilterChain mvcFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/", "/login",
                    "/h2-console/**",
                    "/swagger-ui/**", "/swagger-ui.html",
                    "/v3/api-docs/**"
                ).permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                    .loginPage("/login")
                    .defaultSuccessUrl("/", true)
                    .permitAll()
            )
            .logout(logout -> logout
                    .logoutSuccessUrl("/login?logout")
                    .permitAll()
            )
            .csrf(csrf -> csrf.ignoringRequestMatchers("/h2-console/**"))
            .headers(h -> h.frameOptions(fo -> fo.sameOrigin()));
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }
}
```

> **¿Por qué `@Order`?** Spring Security necesita saber qué cadena evaluar primero. La cadena con menor número se evalúa antes. La Cadena 1 solo actúa para `/api/**` (`securityMatcher`); si la petición no coincide, pasa a la Cadena 2.

> **¿Por qué CSRF desactivado solo en la Cadena 1?** Las peticiones JWT desde Postman/Swagger no gestionan cookies de sesión, por lo que el token CSRF no aplica. Las vistas MVC sí usan sesión, así que CSRF permanece activo en la Cadena 2.

### Paso A3 — `layout.html`: usuario autenticado y logout

Se añade `xmlns:sec` al fragmento de layout compartido, el enlace a Pedidos, el nombre del usuario autenticado y el botón de cierre de sesión:

```html
<html lang="es"
      xmlns:th="http://www.thymeleaf.org"
      xmlns:sec="http://www.thymeleaf.org/extras/spring-security"
      th:fragment="layout(title, content)">
...
<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
        <a class="navbar-brand" th:href="@{/}">ERP Balmis</a>
        ...
        <ul class="navbar-nav me-auto">
            <li class="nav-item"><a class="nav-link" th:href="@{/clientes}">Clientes</a></li>
            <li class="nav-item"><a class="nav-link" th:href="@{/productos}">Productos</a></li>
            <li class="nav-item"><a class="nav-link" th:href="@{/pedidos}">Pedidos</a></li>
        </ul>

        <!-- Usuario autenticado + logout -->
        <div class="d-flex align-items-center gap-2" sec:authorize="isAuthenticated()">
            <span class="navbar-text text-light me-1">
                Hola, <strong sec:authentication="name"></strong>
            </span>
            <form th:action="@{/logout}" method="post" class="d-inline">
                <button type="submit" class="btn btn-outline-light btn-sm">
                    Cerrar sesión
                </button>
            </form>
        </div>
    </div>
</nav>
```

> El atributo `sec:authentication="name"` renderiza el nombre del usuario de la sesión actual. El formulario de logout es un `POST` (Spring Security así lo exige por defecto para evitar ataques CSRF).

---

## Parte B — Control de Acceso por Roles en los Templates

### Paso B1 — Dependencia `thymeleaf-extras-springsecurity6`

Esta dependencia (ya incluida en el `pom.xml` de Reto 6) activa los atributos `sec:authorize` y `sec:authentication` en los templates.

```xml
<dependency>
    <groupId>org.thymeleaf.extras</groupId>
    <artifactId>thymeleaf-extras-springsecurity6</artifactId>
</dependency>
```

Para usarla, el template debe declarar el namespace:

```html
<html xmlns:sec="http://www.thymeleaf.org/extras/spring-security">
```

### Paso B2 — `sec:authorize` en los listados

**`clientes/lista.html`** — los botones de acción se condicionan por rol:

```html
<!-- Solo ADMIN y MANAGER pueden crear clientes -->
<a th:href="@{/clientes/nuevo}" class="btn btn-primary btn-sm"
   sec:authorize="hasAnyRole('ADMIN','MANAGER')">+ Nuevo cliente</a>

<!-- En cada fila de la tabla -->
<a th:href="@{/clientes/{id}/editar(id=${cliente.id})}"
   class="btn btn-outline-primary btn-sm"
   sec:authorize="hasAnyRole('ADMIN','MANAGER')">Editar</a>

<a th:href="@{/clientes/{id}/eliminar(id=${cliente.id})}"
   class="btn btn-outline-danger btn-sm"
   sec:authorize="hasRole('ADMIN')">Eliminar</a>
```

El mismo patrón se aplica en `productos/lista.html` y en el botón "Confirmar pedido" de `pedidos/detalle.html`:

```html
<!-- En pedidos/detalle.html — solo si BORRADOR y es ADMIN/MANAGER -->
<form th:if="${pedido.estado.name() == 'BORRADOR'}"
      sec:authorize="hasAnyRole('ADMIN','MANAGER')"
      th:action="@{/pedidos/{id}/confirmar(id=${pedido.id})}" method="post">
    <button type="submit" class="btn btn-success">✓ Confirmar pedido</button>
</form>
```

> **Política de roles en las vistas:**
>
> | Acción | Rol requerido |
> |--------|--------------|
> | Ver listas y detalles | Cualquier usuario autenticado |
> | Crear / Editar | ADMIN o MANAGER |
> | Eliminar | Solo ADMIN |
> | Confirmar pedido | ADMIN o MANAGER |

> **Importante:** `sec:authorize` **oculta el elemento HTML** en el navegador, pero **no protege el endpoint**. La protección real del endpoint la hace `SecurityConfig`. Ambas capas son necesarias: la vista para la UX, el controlador para la seguridad real.

---

## Parte C — JWT para la API REST

### Componentes JWT (propagados de la arquitectura del Reto 6)

| Clase | Responsabilidad |
|-------|----------------|
| `Usuario` | Entidad JPA con `username`, `password` (BCrypt), `RolUsuario` |
| `RolUsuario` | Enum: `ADMIN`, `MANAGER`, `EMPLEADO` |
| `UserDetailsServiceImpl` | Implementa `UserDetailsService`; carga usuario por `username` |
| `JwtUtil` | Genera y valida tokens JWT (jjwt 0.12.x) |
| `JwtAuthFilter` | `OncePerRequestFilter`: extrae el token, valida y establece el `SecurityContext` |
| `AuthController` | `POST /api/auth/login` → devuelve `{"token": "..."}` |

### `JwtUtil` — generación y validación

```java
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration-ms}")
    private long expirationMs;

    public String generarToken(UserDetails userDetails) {
        return Jwts.builder()
                .subject(userDetails.getUsername())
                .claim("roles", userDetails.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority).toList())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    public boolean validarToken(String token, UserDetails userDetails) {
        final String username = extraerUsername(token);
        return username.equals(userDetails.getUsername()) && !estaExpirado(token);
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }
    // ... extraerUsername(), estaExpirado()
}
```

### `JwtAuthFilter` — filtro de interceptación

```java
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ... {
        final String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        final String token = authHeader.substring(7);
        final String username = jwtUtil.extraerUsername(token);

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            if (jwtUtil.validarToken(token, userDetails)) {
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        filterChain.doFilter(request, response);
    }
}
```

### `AuthController` — endpoint de login JWT

```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(
            @RequestBody @Valid LoginRequestDTO request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.username(), request.password()));

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.username());
        String token = jwtUtil.generarToken(userDetails);

        return ResponseEntity.ok(Map.of("token", token));
    }
}
```

**Ejemplo de uso con Postman:**

```
POST http://localhost:9000/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

Respuesta `200 OK`:

```json
{ "token": "eyJhbGciOiJIUzI1NiJ9..." }
```

Usar el token en peticiones protegidas:

```
GET http://localhost:9000/api/clientes
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

### `application.properties` — configuración JWT

```properties
jwt.secret=TuClaveSecretaMuyLargaDeAlMenos32CaracteresParaHmacSha256
jwt.expiration-ms=86400000
```

> La clave debe tener al menos 32 bytes (256 bits) para HMAC-SHA256. En producción se gestiona como variable de entorno, nunca en el repositorio.

---

## Usuarios de prueba (`import.sql`)

```sql
INSERT INTO usuarios (username, password, rol) VALUES
    ('admin',    '$2a$10$...hash...', 'ADMIN'),
    ('manager',  '$2a$10$...hash...', 'MANAGER'),
    ('empleado', '$2a$10$...hash...', 'EMPLEADO');
```

Las contraseñas se generan con BCrypt (`BCryptPasswordEncoder.encode("admin123")`).

| Usuario | Contraseña | Rol | Permisos en vistas |
|---------|-----------|-----|--------------------|
| `admin` | `admin123` | ADMIN | Todo: ver, crear, editar, eliminar, confirmar |
| `manager` | `manager123` | MANAGER | Ver, crear, editar, confirmar (sin eliminar) |
| `empleado` | `empleado123` | EMPLEADO | Solo lectura (sin botones de acción) |

---

## Política de acceso completa

| Recurso | Sin autenticar | EMPLEADO | MANAGER | ADMIN |
|---------|---------------|---------|---------|-------|
| `/login` | ✅ | ✅ | ✅ | ✅ |
| `/` (home) | ✅ | ✅ | ✅ | ✅ |
| `GET /clientes` | ❌ → login | ✅ | ✅ | ✅ |
| `POST /clientes/nuevo` | ❌ → login | ❌ (botón oculto) | ✅ | ✅ |
| `POST /clientes/{id}/eliminar` | ❌ → login | ❌ (botón oculto) | ❌ (botón oculto) | ✅ |
| `GET /api/clientes` | ❌ 401 | ✅ (JWT) | ✅ (JWT) | ✅ (JWT) |
| `DELETE /api/clientes/{id}` | ❌ 401 | ❌ 403 | ❌ 403 | ✅ (JWT) |

---

## Estructura de templates nueva (Reto 6)

```
templates/
  auth/
    login.html        ← NUEVA: formulario standalone de login
  clientes/
    lista.html        ← ACTUALIZADA: xmlns:sec + sec:authorize en botones
  productos/
    lista.html        ← ACTUALIZADA: xmlns:sec + sec:authorize en botones
  pedidos/
    detalle.html      ← ACTUALIZADA: sec:authorize en "Confirmar pedido"
  fragments/
    layout.html       ← ACTUALIZADO: xmlns:sec + enlace Pedidos + user + logout
```

---

## Estructura del proyecto

```
erpbalmis_6/
├── src/main/java/com/iesdoctorbalmis/spring/
│   ├── controller/
│   │   ├── rest/
│   │   │   ├── AuthController.java              ← NUEVO: POST /api/auth/login
│   │   │   ├── ClienteRestController.java
│   │   │   ├── ProductoRestController.java
│   │   │   └── PedidoRestController.java
│   │   ├── ClienteController.java               ← propagado (CRUD MVC)
│   │   ├── ProductoController.java              ← propagado (CRUD MVC)
│   │   └── PedidoController.java                ← propagado (MVC)
│   ├── dto/
│   │   └── LoginRequestDTO.java                 ← NUEVO: record {username, password}
│   ├── entity/
│   │   ├── Usuario.java                         ← NUEVA: entidad JPA
│   │   └── RolUsuario.java                      ← NUEVO: enum ADMIN/MANAGER/EMPLEADO
│   ├── repository/
│   │   └── UsuarioRepository.java               ← NUEVO
│   ├── security/
│   │   ├── JwtUtil.java                         ← NUEVO: genera y valida JWT
│   │   ├── JwtAuthFilter.java                   ← NUEVO: filtro OncePerRequestFilter
│   │   ├── UserDetailsServiceImpl.java          ← NUEVO: carga usuario de BD
│   │   └── SecurityConfig.java                  ← NUEVO: dual SecurityFilterChain
│   └── service/
│       └── (servicios propagados de Reto 5)
└── src/main/resources/
    ├── application.properties    ← actualizado: jwt.secret, jwt.expiration-ms
    ├── import.sql                ← actualizado: 3 usuarios con BCrypt
    └── templates/
        ├── auth/
        │   └── login.html        ← NUEVA
        ├── clientes/
        │   └── lista.html        ← actualizada con sec:authorize
        ├── productos/
        │   └── lista.html        ← actualizada con sec:authorize
        ├── pedidos/
        │   └── detalle.html      ← actualizada con sec:authorize
        └── fragments/
            └── layout.html       ← actualizado: user + logout + Pedidos
```

---

## Comparativa con Axelor

| Spring Boot (Reto 6) | Axelor ERP |
|----------------------|------------|
| `auth/login.html` con `th:action="@{/login}"` | Pantalla de login de Axelor |
| `sec:authorize="hasRole('ADMIN')"` oculta botones | Grupos y permisos en Axelor → botones desaparecen según grupo |
| `SecurityConfig.mvcFilterChain` → sesión HTTP | Axelor usa sesión de servidor para la interfaz web |
| `SecurityConfig.apiFilterChain` → JWT stateless | API de Axelor usa OAuth2 / tokens de sesión |
| `UserDetailsServiceImpl` carga usuario de BD | Axelor: tabla de usuarios en su propia BD |
| `RolUsuario` enum: ADMIN, MANAGER, EMPLEADO | Axelor: Administrador, Usuario, Solo lectura |

---

## Verificación

### Flujo de login (navegador)

1. Abre `http://localhost:9000/clientes` → redirige a `/login`.
2. Introduce `admin` / `admin123` → accede a la lista de clientes con todos los botones visibles.
3. Cierra sesión → redirige a `/login?logout` con mensaje de confirmación.
4. Entra con `empleado` / `empleado123` → la lista se muestra pero **sin** botones Nuevo/Editar/Eliminar.

### Flujo JWT (Postman)

```
POST localhost:9000/api/auth/login
Body: {"username":"admin","password":"admin123"}
→ {"token":"eyJ..."}

GET localhost:9000/api/clientes
Authorization: Bearer eyJ...
→ 200 OK con lista de clientes

DELETE localhost:9000/api/clientes/1
Authorization: Bearer eyJ...  (token de 'empleado')
→ 403 Forbidden
```

### Swagger UI

```
http://localhost:9000/swagger-ui.html
```

El endpoint `POST /api/auth/login` es público. Usa el token obtenido en el botón **Authorize** de Swagger para probar los demás endpoints.

