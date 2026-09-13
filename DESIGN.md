# DESIGN — 13·09 · Para Diana

Dirección artística. Todo el frontend responde a este documento.
Si una decisión artística importante cambia, se actualiza aquí.

---

## Concept

**Ningún momento se quedó quieto.**

El archivo real no son 399 fotos: son unos 40 *segundos* fotografiados muchísimas veces.
29 disparos de ella con un ramo. 27 del coche amarillo de noche. 70 del paseo con el perro.
Nadie hizo 29 fotos porque hiciera falta una. Las hizo porque ella se reía distinto en cada una.

La web no esconde esa repetición: **la convierte en su lenguaje**. Cada fotografía importante
no es una imagen, es su ráfaga real — y late.

Es una identidad que sólo puede existir con este material. Ninguna plantilla la tiene.

---

## Emotional arc

| Momento | Qué debe sentir Diana |
|---|---|
| **Entrada** | Desconcierto bonito. Algo late antes de entender qué es. Luego: *es mi cara, es mi cumpleaños.* |
| **Descubrimiento** | "Esto está hecho con NUESTRAS fotos, no con fotos." Reconoce el pasillo, el ramo, la ráfaga. |
| **Recuerdos** | Ternura por lo ordinario: el lavadero, el gimnasio, conducir de noche. No los momentos grandes — los martes. |
| **Cantidad** | Después de la luz buena, la galería: «hay muchísimo aquí». No una galería infinita — 39 fotos distintas a tamaño real, elegidas a mano, la mayoría sin una sola palabra encima. |
| **Diversión** | Risa de complicidad. Los juegos se ríen *con* ella y con la cantidad absurda de fotos que le hacen. |
| **Intimidad** | Bajada de volumen. Menos imagen, más tipografía. El ascensor. La carta. |
| **Final** | Nudo en la garganta. Todo lo anterior vuelve a la vez y se detiene en una sola cara. |
| **Post-créditos** | Sonrisa privada. Un guiño que sólo tiene sentido si ha llegado hasta el final. |

Jerarquía innegociable: **13·09 > 20·12 > todo lo demás.**
El aniversario es un capítulo corto y cálido, nunca un segundo clímax.

---

## Typography

Dos familias. Ninguna es la que saldría por defecto.

| Rol | Familia | Por qué |
|---|---|---|
| **Display** | **Gambarino** (Fontshare, OFL) | Serif de contraste alto con terminaciones de bola y un desequilibrio deliberado. Romántica sin ser de boda, editorial sin ser periódico. No pertenece al repertorio por defecto. |
| **Texto / UI** | **Supreme** (Fontshare, OFL) | Grotesca templada, 'a' de un piso, ligeramente idiosincrásica. Sostiene pies de foto y cifras sin pedir turno. |

**La carta** se compone en Gambarino a tamaño de lectura sobre papel claro — cambia de voz sin
añadir una tercera familia.

### Escala
Escala modular 1.25 anclada en 17px móvil / 18px desktop.

```
display-xl   clamp(4.5rem, 22vw, 13rem)   Gambarino   line-height .82  tracking -.03em
display-l    clamp(2.6rem, 9vw, 5rem)     Gambarino   line-height .95  tracking -.02em
display-m    clamp(1.9rem, 6vw, 3rem)     Gambarino   line-height 1.05
lead         clamp(1.18rem, 3.6vw, 1.5rem) Gambarino  line-height 1.5
body         1.0625rem / 1.65             Supreme
caption      .8125rem / 1.4               Supreme     tracking .01em
tick         .6875rem                     Supreme     cifras tabulares
```

### Criterios
- **13·09 se compone como imagen, no como texto.** Es el elemento tipográfico activo de la web:
  cifras enormes, el punto medio del tamaño de un ojo, y la ráfaga latiendo *detrás* del recorte.
- Sin versalitas de etiqueta. Sin eyebrow tracking-out. Sin `WORD — fragmento`.
- Sin resaltar una sola palabra del titular en otro color o cursiva.
- Cursiva sólo para la voz de él (las notas al pie de foto).
- Medida de línea ≤ 66 caracteres. La carta ≤ 58.

---

## Color

**No inventada: muestreada de las fotografías reales** (`scripts/scene-colors.mjs`).

### Base
```
--noche      #171412   Fondo. Es literalmente el color del cielo en las fotos del coche de noche.
--noche-hondo #120E0C  El negro real del archivo: sombras del coche nocturno.
--eleva      #221B15   Superficies levantadas.
--tinta      #EFE7DA   Texto sobre oscuro.
--tinta-baja #9C8F7F   Secundario.
--papel      #F2EDE3   Fondo de la carta. Inversión tonal completa.
--grafito    #221E19   Texto sobre papel.
```

### Acento
```
--ibiza      #FFC400   El amarillo del SEAT Ibiza.
```
No es un acento de diseño: es el color de un coche que atraviesa toda su historia.
Por eso se usa **poco y siempre con motivo** — la fecha, el estado activo, la aguja de la ráfaga.
Nunca como relleno ni como degradado.

### Grado por capítulo
Cada capítulo hereda la temperatura de sus propias fotos. El fondo se desplaza al scrollear.
Valores reales muestreados:

```
flores        #473722   cálido, madera del pasillo
lavadero      #211D1E   neutro frío, hormigón
gimnasio      #1B1B1B   neutro
taysson       #3B402D   verde — la senda
graduación    #23231F   ámbar apagado   (el jardín: la de Cesar)
acto          #160B22   morado hondo    (el pabellón: la de Diana)
coche noche   #171412   umbra
coche monte   #13141B   azul — el único capítulo frío
ascensor      #21201C   acero templado
```

La web está **etalonada como una película**: el suelo cambia de temperatura bajo los pies.
Eso es un sistema, no un acento sobre negro.

### Contraste
`--tinta` sobre `--noche` = 13.4:1. `--ibiza` sobre `--noche` = 11.1:1.
Todo texto ≥ 4.5:1. El amarillo nunca porta texto largo.

---

## Photography

381 de 399 son verticales. La web **es vertical**. Eso no es una limitación: es el formato.

| Tipo | Tratamiento |
|---|---|
| **Verticales** | Protagonistas. A sangre completa o en marco 3:4 con aire generoso. Nunca recortadas a horizontal. |
| **Horizontales (18)** | Sólo como respiro entre capítulos, a sangre y con poca altura. Nunca forzadas a vertical. |
| **Hero** | Una sola imagen, a sangre, con la ráfaga activa y el recorte de 13·09 encima. |
| **Ráfagas** | El núcleo. 5–12 fotogramas reales del mismo segundo, precargados, a 8–11 fps. |
| **Galería** | No es una cuadrícula de miniaturas. Es un **ritmo**: ninguna pieza tiene el mismo ancho que la anterior y ninguna está centrada. En móvil van alternando de lado (88 % izq → 70 % der) y el capítulo se va **estrechando** hasta cerrar en un 64 % a la izquierda. Ver § Ritmo de la galería. |
| **Secuencia** | Dos o tres fotos del mismo momento, pegadas (hueco de 4-6px). El hueco mínimo es lo que las hace leerse como secuencia —posan, se ríen, se acercan— y no como tarjetas. Sólo cuando la diferencia aporta movimiento o expresión; nunca como excusa para meter casi-duplicados. |
| **Collage** | Sólo donde hay verdadera variedad de expresión (ramo, gimnasio). Rejilla irregular, nunca bento. |
| **Sin pie** | La mayoría de las fotos sueltas **no llevan texto**. Un pie por foto convierte el capítulo en un catálogo comentado; el silencio es parte del tono. |
| **Vídeo** | `muted` `playsinline` `loop` por defecto, sin controles visibles salvo los que importan. Los dos clips de 1,5 s sin audio (Live Photos del paseo) se tratan **como fotos que respiran**, no como vídeo. |
| **Rostros** | Punto focal siempre por encima del centro. Ningún texto sobre una cara. Verificado en QA. |

Reglas duras:
- Nunca se afirma una fecha, un lugar ni una anécdota que no conste. El EXIF está borrado: **no hay cronología real**. El orden es narrativo, no documental.
- El material íntimo/privado del archivo queda fuera. No es material de regalo.
- Los originales de `./Fotos_y_Videos/` no se tocan jamás.

---

## Motion language

Tres gestos. Nada más.

1. **El latido (ráfaga).** El único movimiento no solicitado que se permite, porque *es* el concepto.
   La imagen recorre sus fotogramas reales y se asienta en el elegido. Entra al 55 % de visibilidad,
   se detiene sola tras un ciclo. Al tocarla, vuelve a correr.
2. **El grado.** El fondo interpola de un color de capítulo al siguiente con el scroll. Lento,
   imperceptible, continuo. Es el suelo, no un efecto.
3. **El asentamiento.** Sólo la portada y el final: la tipografía llega a su sitio una vez,
   con peso. Nunca se repite en cada sección.

Prohibido: fade-and-slide-up en cada bloque, parallax decorativo, hover que levanta tarjetas,
contadores animados, partículas, confeti.

`prefers-reduced-motion`: la ráfaga se congela en su fotograma elegido y el grado pasa a ser
un cambio discreto por capítulo. La web sigue contando lo mismo.

---

## Layout language

**Mobile first de verdad**: se diseña a 390×844 y se ensancha. Es el teléfono de Diana.

```
MÓVIL  ≤ 599                    TABLET 600–1023            DESKTOP ≥ 1024
┌──────────────┐                ┌────────────────────┐     ┌──────────────────────────────┐
│▐            │                │▐                   │     │▐   │                          │
│▐  imagen a  │                │▐   imagen    texto │     │▐ 13│    imagen a sangre       │
│▐  sangre    │                │▐   3:4       al    │     │▐ ·  │    con aire lateral      │
│▐            │                │▐             lado  │     │▐ 09│                          │
│▐            │                │▐                   │     │▐   │    texto en columna       │
│▐  titular   │                │▐                   │     │▐   │    estrecha, izquierda    │
│▐  pie       │                └────────────────────┘     └──────────────────────────────┘
└──────────────┘                 2 col · 72ch max          rail fijo + 2 col asimétricas
 1 col · raíl de                                           (7fr / 5fr), nunca centrado
 ráfaga a la izq.
```

- **Alineación: izquierda.** Siempre. Nada centrado salvo la portada y el final —
  y ahí lo centrado *es* el gesto.
- Un capítulo = una idea = un scroll de pulgar. Sin secciones que se pisen.
- Aire: `--aire` de 16px lateral en móvil, y respiración vertical generosa entre capítulos
  (mínimo 18vh). El vacío es parte del tono.
- Desktop **no** es móvil estirado: aparece el raíl fijo de capítulos y la asimetría 7/5.

### Ritmo de la galería

«Y luego está todo lo demás» es el capítulo que enseña muchas fotos sin volverse
una cuadrícula. Lo consigue no repitiendo nunca la misma medida:

```
[███████████████████]  100 %   a sangre — abre fuerte
[████████████]  88 % izq
              [█████████]  70 % der
[████][████][████]  tríptico pegado — una secuencia, no tres piezas
              [█████████]  70 % der
[████████████]  88 % izq
              [██████████]  78 % der — respiro, un sitio, sin cara
[████████]  64 % izq — cierre
```

Se abre a sangre y se va cerrando. Ese estrechamiento es el que deja la galería
en voz baja justo antes de los juegos, sin necesitar una frase que lo diga.
El post-créditos hace lo contrario: doce fotos a medida uniforme con las pares
desfasadas —es una tira de extras, y ahí la regularidad *es* el gesto— y debajo
el mosaico de descartes, que es otra cosa y se dice aparte.

---

## Signature detail

### **La ráfaga**

Toda imagen importante de la web es su ráfaga real: los fotogramas verdaderos que se
dispararon de ese mismo segundo. Al entrar en pantalla —o al tocarla— la imagen recorre
sus propios descartes y se asienta en el elegido. A la izquierda, un raíl de marcas finas
cuenta cuántos había. Uno se enciende en amarillo Ibiza: el que se quedó.

Aparece en tres estados:
- **latido** (automático, un ciclo, al entrar)
- **recorrido** (al arrastrar el dedo sobre la foto, ella misma pasa los fotogramas)
- **elegido** (en reposo)

Y se convierte en juego: en *La ráfaga correcta*, Diana elige qué fotograma se queda —
y la web **guarda su elección y la usa a partir de ahí**. El regalo termina de hacerlo ella.

Esto es irrepetible: nace de que alguien le hizo 29 fotos seguidas porque no quería perderse
ninguna de sus caras.

---

## Anti-patterns

Explícitamente descartado:

**Tipografía** — Inter, Roboto, Arial, Space Grotesk por defecto. Versalitas de etiqueta.
Eyebrows con tracking. Una palabra del titular en otro color. `PALABRA — fragmento`.
Monoespaciada para datos pequeños. `→` pegado al texto de los botones.

**Color** — Crema #F4F1EA con serif de contraste y terracota #D97757. Negro teñido
(#0B0B0B, #111) haciendo de negro. Degradado violeta. Neón. Un acento ácido sobre negro.

**Layout** — Hero + tres tarjetas + CTA. Bento grid sin motivo. Tarjetas idénticas con el
mismo radio y la misma sombra `rgba(0,0,0,.1)`. Glassmorphism. Píldoras. Iconos decorativos.
Radios excesivos. Estética SaaS / startup / portfolio.

**Movimiento** — Fade-up en cada sección. Parallax porque sí. Hover que levanta. Confeti.

**Contenido** — Inventar fechas, lugares o anécdotas. Texto decorativo de relleno.
Frases de galleta de la suerte. Cualquier sección que funcione pero no aporte emoción.

**Privacidad** — Ninguna foto sale del dispositivo. Sin analítica, sin fuentes por CDN,
sin peticiones externas. Todo se sirve desde el propio sitio.

---

## Quality gate

Una sección no está terminada hasta que:

1. Podría reconocerse como suya con las fotos tapadas — por el ritmo, el grado o el texto.
2. La foto elegida es la mejor de su ráfaga, no la primera.
3. Funciona a 390×844 sin scroll horizontal y sin cara recortada.
4. Tiene aire suficiente para respirar.
5. Su movimiento aporta significado, no decoración.
6. **No podría pertenecer a ninguna otra web.**
