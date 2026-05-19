# ESTUDIO COMPARATIVO DE AGENTES DE IA - DIRECTRICES DE EJECUCIÓN

Para iniciar e interactuar con las aplicaciones desarrolladas en el entorno local, asegúrese de contar con los requisitos previos del sistema (Node.js v20+ para ambas aplicaciones y PostgreSQL activo para la versión de Windsurf). Los archivos de esta carpeta contienen las plantillas de configuración ambiental necesarias para el despliegue.

## PASOS PARA EL LANZAMIENTO:

### A) APLICACIÓN ANTIGRAVITY (Local con SQLite):
1. Abra la terminal en la carpeta `app_antigravity`.
2. Instale los módulos del sistema ejecutando: `npm install`
3. Duplique el archivo `.env.example` en la raíz de dicha carpeta y renómbrelo exactamente como `.env` (este archivo ya contiene la cadena de conexión automatizada para la base de datos embebida).
4. Sincronice la base de datos embebida y genere el cliente del ORM: `npx prisma db push`
5. Genere el cliente personalizado del ORM para evitar errores de compilación: `npx prisma generate`
6. Inyecte los datos de prueba iniciales (seed): `npm run db:seed`
7. Lance el servidor de desarrollo: `npm run dev`
8. Acceda desde el navegador en: http://localhost:3000

### B) APLICACIÓN WINDSURF (Local con PostgreSQL):
1. Cree una base de datos vacía en pgAdmin llamada `optica_db`.
2. Abra la terminal en la carpeta `app_windsurf`.
3. Instale los módulos del sistema ejecutando: `npm install`
4. Duplique el archivo `.env.example` en la raíz de la carpeta y renómbrelo como `.env`. Abra el archivo con un editor de texto y configure la variable `DATABASE_URL` sustituyendo `TU_CONTRASEÑA` por la clave de su servidor local de PostgreSQL.
5. Sincronice el esquema relacional y genere el cliente del ORM: `npx prisma db push`
6. Genere el cliente personalizado del ORM para evitar errores de compilación: `npx prisma generate`
7. Inyecte los datos de prueba iniciales (seed): `npm run db:seed`
8. Lance el servidor de desarrollo: `npm run dev`
9. Acceda desde el navegador en: http://localhost:3000

### C) SOLUCIÓN DE REFERENCIA (Oracle APEX en la Nube):
Al ejecutarse sobre la infraestructura OCI de Oracle Cloud, no requiere de ninguna acción local de lanzamiento. El tribunal puede tanto probar el sistema en ejecución dinámica como realizar una auditoría profunda de su esquema relacional (Object Browser) y lógica de páginas a través de los siguientes enlaces:
* **URL de Acceso (Ejecución):** https://g4063b35e9d87c8-opticastockia.adb.eu-madrid-1.oraclecloudapps.com/ords/r/optica_ws/gestor-%C3%B3ptica-ia/login
* **URL de Auditoría Interna (App Builder):** https://g4063b35e9d87c8-opticastockia.adb.eu-madrid-1.oraclecloudapps.com/ords/r/apex/app-builder/apps

---

## CREDENCIALES DE ACCESO:

### • Para las aplicaciones web locales (Antigravity y Windsurf):
* **Usuario:** admin
* **Contraseña:** admin123

### • Para la solución de referencia en la nube (Oracle APEX / Rol Desarrollador):
* **Usuario:** admin_tfg
* **Contraseña:** 12341234TFg#