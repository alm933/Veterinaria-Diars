# Huellitas — prototipo de recepción DIARS

Primera interfaz navegable inspirada en el wireframe de Figma. Esta versión cubre el menú principal, **Ingreso por Emergencia** y **Registrar Cita Médica**.

## Funciones disponibles

- Navegación entre las tres vistas y menú adaptable a pantallas pequeñas.
- Búsqueda de un cliente ficticio y selección de sus mascotas.
- Formulario de emergencia con fecha y hora automáticas.
- Consulta de horarios de demostración por veterinario y fecha.
- Validaciones visuales y mensajes de resultado.
- Comentarios explicativos en HTML, CSS y TypeScript para facilitar el trabajo del equipo.

## Datos de demostración

Para encontrar al cliente de ejemplo, ingresa el documento **72104568**. El formulario muestra dos mascotas ficticias. Los horarios, códigos y confirmaciones son locales: **no se guardan en una base de datos y no llaman a una API**. No ingreses información real de clientes o pacientes.

## Ejecutar localmente

Se puede abrir `index.html` directamente o servir la carpeta con un servidor estático.

Para compilar la fuente TypeScript a JavaScript:

```sh
npm install
npm run build
```

El proyecto publica `app.js`, que es el archivo cargado por la página. La fuente editable y comentada está en `app.ts`.

## Estructura

- `index.html`: estructura y formularios.
- `styles.css`: presentación adaptable.
- `app.ts`: lógica comentada de navegación y formularios.
- `app.js`: versión ejecutable en el navegador, generada desde TypeScript.
- `tsconfig.json`, `package.json`: configuración de compilación.

## Colaboración

El trabajo está en la rama `feature/prototipo-huellitas`, creada desde `main`. Cada compañero puede crear una rama propia desde esta base y proponer sus cambios mediante pull request.
