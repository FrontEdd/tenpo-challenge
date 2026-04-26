# Banco de Talentos Tecnología Challenge:

Desafío técnico que permite conocer habilidades y experiencia en el desarrollo de aplicaciones web.

## Challenge:

> Se requiere crear una aplicación en un repositorio personal que haga lo siguiente:

- Levante una pantalla de login (correo y pass) y haga un fake-login (código 200-OK +
  token-fake).
- Levantar una home, la cual se conecte con una API pública (a elección) y muestre
  una lista de 2000 elementos.
- Mostrar un botón de logout que te devuelva al login y limpie la sesión.

## Requisitos sobre la solución:

- Desarrollar una app en react con typescript que sea responsiva (web y mobile).
- El manejo de estilos o uso de librerías CSS es a elección.
- Readme con los pasos para correr el proyecto y documentación necesaria.
- Almacenar token en memoria, seleccionar la forma/herramienta/librería que se crea
  más conveniente para este propósito (persistencia de token).
- Definir el diseño/arquitectura que creas más conveniente para tener un contex
  público (login) y privado (home) que luego te permita crecer en el tiempo con
  nuevos módulos. Ej: módulo de cambio de contraseña (público) ó módulo de datos
  del usuario (privado).
- Usar axios para el fetching y configurarlo para enviar el token-fake en las request
  más allá de que no se use.
- Definir la mejor forma bajo su criterio para mostrar la lista de la home
  argumentando en unas pocas líneas su solución.
- Defina una estrategia de logout que haga sentido con el diseño de context
  público/privado.
- Proponer una mejora teórica sobre las llamadas usadas al backend para que
  nuestra app sea más eficiente.
