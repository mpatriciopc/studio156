# ADR-001: Política de Guest Checkout (Sin Login Obligatorio)

* **Decisión:** Compra 100% como invitado. No se implementa área de clientes ni contraseñas.
* **Motivo:** Evita hasta un 28% de abandono de carritos y reduce el tiempo de compra a menos de 90 segundos.
* **Seguridad:** Airtable no es un gestor de identidad seguro para passwords.
* **Persistencia:** Datos de facturación guardados localmente en `localStorage` a petición del usuario.
* **Seguimiento:** Acceso mediante token criptoseguro en la URL.
