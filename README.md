# Android Remote Play

Una aplicación PWA y nativa de Android para controlar dispositivos Android TV de forma remota a través de la red local.

## Características
- **Conexión Directa:** Usa el protocolo nativo ADB sobre TCP/IP para controlar la TV sin depender de una PC.
- **Auto-Discovery:** Escaneo automático de la red Wi-Fi (mDNS/ZeroConf) para encontrar televisores compatibles sin ingresar IPs manualmente.
- **Baja Latencia:** Controles ultrarrápidos utilizando el protocolo ADB y eventos táctiles (`onPointerDown`).
- **Teclado Completo:** Permite escribir texto en el celular y enviarlo a la TV.
- **Controles Multimedia:** Botones dedicados para Netflix, Prime Video, YouTube y HBO Max.
- **Controles de TV:** Volumen, silencio, canal arriba/abajo y micrófono (Asistente de Google).

## Tecnologías
- **Frontend:** React, Vite, TailwindCSS.
- **App Móvil:** CapacitorJS con un plugin nativo en Java (`AdbPlugin`).
- **Backend (Legacy/Web):** Node.js (Express) para uso en navegadores web que no soportan sockets nativos.

## Estructura del Proyecto
- `/frontend`: La aplicación web React y el proyecto Android de Capacitor.
- `/backend`: El servidor Node.js alternativo (por si se desea usar desde una PC).

## Uso
### Versión Nativa (Recomendada)
1. Instalar la aplicación en un teléfono Android (`app-debug.apk`).
2. Abrir la app, tocar el ícono de Ajustes ⚙️.
3. Presionar "Buscar TVs en Wi-Fi".
4. Seleccionar el televisor y aceptar la depuración en la pantalla del TV.

### Compilar el APK
1. Abrir `frontend/android` en Android Studio.
2. Ejecutar `Build > Build Bundle(s) / APK(s) > Build APK(s)`.

### Link Apk (Descraga directa en Android)
 https://drive.google.com/file/d/1u1Ndcyx6JjYcM-lcld1sb-3yk3xmC5QW/view?usp=sharing
