# 🎒 MyItemVault — Inventario Personal

¡Bienvenido a **MyItemVault**! Este es un proyecto frontend completo diseñado como una aplicación web interactiva y modular para la gestión, orden y categorización de inventarios personales u objetos coleccionables. La aplicación combina una estética limpia y oscura inspirada en interfaces de videojuegos y aplicaciones modernas, incorporando mecánicas visuales avanzadas y efectos de sonido dinámicos en tiempo real.

---

## 🚀 Características Principales

* **Gestión Completa de Inventario (CRUD):** * Creación, edición y eliminación de categorías personalizadas con íconos.
    * Creación, edición, duplicación rápida y eliminación de ítems detallados dentro de cada categoría.
* **Sistema de Rarezas Dinámico:** Clasificación de ítems por niveles de rareza (`Común`, `Poco Común`, `Raro`, `Épico`, `Legendario`) con estilos de color específicos y efectos visuales de pulsación reflectiva (*glow pulse*) para las rarezas más altas.
* **Efectos de Sonido Interactivos (Web Audio API):** Módulo de audio nativo sintetizado mediante osciladores puramente web (sin archivos externos de audio) que genera respuestas sonoras adaptativas al hacer clic, soltar un ítem, borrar elementos o gatillar errores.
* **Organización Avanzada por Drag & Drop:** Reordenamiento interactivo y fluido de tarjetas de ítems mediante arrastrar y soltar directamente en la cuadrícula principal, con cálculo dinámico de posición (*drop placeholder*).
* **Persistencia de Datos Local:** Implementación del patrón de almacenamiento local (`localStorage`), garantizando que el inventario se mantenga intacto entre recargas del navegador.
* **Panel de Estadísticas Analítico:** Dashboard integrado que calcula en tiempo real el total de ítems, barras porcentuales por tipo de rareza y destaca la categoría más relevante (*Top Category*).
* **Herramientas de Configuración:** Funcionalidades avanzadas para cargar un set de datos de demostración (*Demo prellenado*), reiniciar por completo la bóveda o exportar todo el inventario estructurado a un archivo de hoja de cálculo compatible con Microsoft Excel (CSV con codificación UTF-8 y BOM).
* **Diseño 100% Responsivo:** Interfaz adaptada meticulosamente a pantallas de escritorio, tablets y dispositivos móviles a través de Media Queries nativas y CSS Grid.

---

## 🛠️ Tecnologías Utilizadas

El proyecto fue desarrollado utilizando estándares modernos de desarrollo web del lado del cliente, priorizando el rendimiento y evitando dependencias pesadas o frameworks de terceros:

* **HTML5 Semántico:** Estructura limpia utilizando etiquetas accesibles como `<aside>`, `<main>`, `<header>`, `<nav>`, `<form>`, etc.
* **CSS3 Avanzado:** Uso extensivo de Custom Properties (Variables CSS) para la gestión unificada de paletas de colores y espaciados, animaciones personalizadas (`@keyframes`), selectores de estado modernos y layouts híbridos con Flexbox y CSS Grid.
* **Vanilla JavaScript (ES5/ES6):** Implementado bajo un patrón modular autoejecutable (IIFE) para proteger el alcance global, manipulación directa del DOM, manejo robusto de eventos complejos (Drag & Drop, ciclos de vida de formularios) y abstracción analítica de datos.
* **Web Storage API:** Manejo directo de `localStorage` mediante un módulo aislado de almacenamiento de datos (`Store`).
* **Web Audio API:** Síntesis y manipulación de ondas sonoras nativas (`sine`, `square`, `sawtooth`, `triangle`) y envolventes exponenciales de ganancia y frecuencia para diseño de sonido procedural.
