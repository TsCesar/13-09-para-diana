// ═══════════════════════════════════════════════════════════════
// 13·09 — PARA DIANA
// ═══════════════════════════════════════════════════════════════
//
// TODO EL TEXTO QUE LEE DIANA VIVE AQUÍ.
//
// César: puedes editar cualquier frase directamente en este archivo.
//
// Dos reglas de tono, y son las que mandan sobre todo lo demás:
//
//   1. Cada frase le habla a ella. Ninguna explica cómo está hecho esto.
//      Nada de «web», «página», «archivo», «galería», «ráfaga»,
//      «fotogramas» ni «capítulo» en lo que se ve.
//
//   2. No se cuentan cosas. Ni cuántas fotos hay, ni cuánto dura un vídeo,
//      ni cuántas veces se repitió una escena. Una foto bonita respira
//      sola; explicarla la empeora.
//
// Un texto vacío ('') NO SE DIBUJA: ni la frase, ni el hueco, ni el margen.
// Así que borrar es una opción de verdad, y en muchos sitios es la buena.
//
// Datos reales utilizados:
//
// - Diana es tu novia.
// - Su cumpleaños es el 13 de septiembre.
// - Vuestro aniversario es el 20 de diciembre.
// - Os conocéis desde los 3 años.
// - Antes de ser pareja erais mejores amigos.
// - Su perro se llama Taysson.
//
// No se inventan fechas, lugares, viajes o anécdotas concretas
// que no hayan sido proporcionadas.
//
// ═══════════════════════════════════════════════════════════════


export const ELLA = 'Diana';


// ─────────────────────────────────────────────────────────────
// PORTADA
// ─────────────────────────────────────────────────────────────
//
// Se lee de arriba abajo: la frase, «Para Diana», y debajo el 13·09
// enorme. En tres segundos tiene que quedar claro de quién es el día.

export const PORTADA = {
  fecha: ['13', '09'],

  pie: 'Para Diana',

  // Aparece cuando la fecha termina de asentarse.
  entrada: 'Hoy cumples años, y llevo conociéndote casi toda la vida.',

  ayuda: 'Desliza',
};


// ─────────────────────────────────────────────────────────────
// CAPÍTULOS
// ─────────────────────────────────────────────────────────────
//
// `titulo`, `texto` y cada `pie` son opcionales. Lo que esté vacío
// no se dibuja: el capítulo se queda en imagen limpia.

export const CAPITULOS = {

  rafaga: {
    titulo: 'Un solo momento',

    texto:
      'El mismo ramo. El mismo sitio.\n' +
      'Y aun así, en cada foto hay una sonrisa, una mirada o una tontería distinta.\n\n' +
      'Por eso me cuesta tanto quedarme con una sola.',

    pista: 'Tócala',
  },


  cotidiano: {
    titulo: 'Lo que no posaste',

    texto:
      'Los momentos pequeños que terminan siendo los que más me gusta guardar.',

    // Sin pies a propósito: la manguera, el gimnasio y tú conduciendo
    // se cuentan solos.
    pies: {},
  },


  coche: {
    titulo: 'El amarillo',

    texto:
      'Hay cosas que se repiten tanto que acaban formando parte de los recuerdos sin que te des cuenta.',

    pies: {},
  },


  taysson: {
    titulo: 'Taysson',

    texto:
      'Si hoy va todo de ti, era imposible que él no tuviera también su sitio.',

    pies: {
      alza:
        'Aquí lo levantas hasta tu cara.',
    },

    sonido: 'Activar sonido',
    sonidoOff: 'Silenciar',
  },


  aniversario: {
    marca: ['20', '12'],

    titulo: 'La otra fecha',

    texto:
      'Nos conocemos desde que teníamos 3 años.\n' +
      'Antes de ser pareja fuimos mejores amigos.\n' +
      'Y después llegó un 20 de diciembre que cambió la forma de llamarnos, pero no todo lo que ya éramos.\n\n' +
      'Hoy manda el 13·09.\n' +
      'Pero el 20·12 siempre va a ser nuestro.',

    pies: {},
  },


  // EL ACTO DE DIANA — su graduación. El vídeo del pabellón, ella con
  // vestido cruzando el escenario. Es un momento suyo y tiene capítulo
  // propio para que no se confunda con el otro día (ver `oro`).
  //
  // Mudo por elección, no por prudencia: es un momento de ella y no
  // necesita que yo lo etiquete. Y sobre todo, aquí NO se inventa nada —
  // ni fecha, ni sitio, ni carrera, ni título.
  acto: {
    titulo: '',
    texto: '',
    pie: '',
  },


  // LA GRADUACIÓN DE CESAR — el jardín, el ladrillo, la banda naranja y
  // Diana con el mono. Otro día distinto del de `acto`: no mezclarlos.
  //
  // También mudo, y por lo mismo: las fotos de ese día están porque son
  // recuerdos suyos también, no porque haya que explicar de quién era la
  // ceremonia. Poner «esta era la mía / esta era la tuya» no embellece
  // nada. Si algún día se te ocurre una frase que sí lo haga, se escribe
  // en `titulo`/`texto` y aparece sola.
  oro: {
    titulo: '',
    texto: '',
    pies: {},
  },


  galeria: {
    titulo: 'Y luego está todo lo demás',

    texto:
      'Sin orden y sin motivo.\n' +
      'Están aquí simplemente porque me gustan.',
  },


  // El camino. Sin una sola palabra: se arrastra el dedo y ella anda.
  // La pista se queda porque enseña el gesto, no porque explique nada.
  senda: {
    titulo: '',
    texto: '',
    pie: '',
    pieViva: '',

    pista:
      'Arrastra el dedo',
  },
};


// ─────────────────────────────────────────────────────────────
// JUEGOS
// ─────────────────────────────────────────────────────────────

export const JUEGOS = {
  titulo: 'Dos juegos',

  texto: 'Cortos. Prometido.',


  memoria: {
    titulo: 'Seis caras',

    intro:
      'Cada una está dos veces. Encuéntralas.',

    intentos: (n) =>
      n === 1
        ? '1 intento'
        : `${n} intentos`,

    hecho:
      'Las seis. Y las seis son tuyas.',

    saltar:
      'Saltar este',

    otra:
      'Otra vez',
  },


  eleccion: {
    titulo:
      'Tú eliges',

    intro:
      'De cada momento yo me quedé con una foto.\n' +
      'Marca la tuya y será esa la que mande a partir de aquí.',

    pista:
      'Toca la que te quedarías',

    hecho:
      'Hecho. A partir de ahora es la tuya.',

    reset:
      'Dejar las mías',
  },
};


// ═══════════════════════════════════════════════════════════════
// LA CARTA
// ═══════════════════════════════════════════════════════════════

export const CARTA = {
  esBorrador: false,

  aviso: '',

  encabezado:
    'Diana,',

  parrafos: [

    'Hoy es 13 de septiembre, y aunque podría limitarme a decirte feliz cumpleaños como cualquier otro año, quería hacer algo que se quedara contigo un poco más. Algo que pudieras recorrer, mirar, volver a abrir y que, entre tantas fotos, vídeos y tonterías nuestras, te recordara lo importante que eres para mí.',

    'Nos conocemos desde que teníamos 3 años. Y cuando pienso en eso, me parece una locura. Hemos tenido prácticamente toda una vida para conocernos, crecer, cambiar y vernos en etapas completamente distintas. Y de todas las cosas que podían haber pasado entre nosotros, acabaste siendo primero una de las personas más importantes de mi vida, mi mejor amiga, y después mi novia.',

    'Creo que eso es una de las cosas que más valoro de nosotros. Antes de quererte como te quiero ahora, ya sabía cómo eras. Ya sabía cómo reías, cómo te enfadabas, cómo eras en tus días buenos y en los que no lo eran tanto. No me enamoré de una versión perfecta de ti. Me enamoré de Diana, de la persona que llevaba tantos años formando parte de mi vida.',

    'Y ahora puedo decir que mi mejor amiga también es la persona a la que quiero. A veces me paro a pensarlo y me sigue pareciendo increíble. Hay gente que pasa años buscando a alguien con quien sentirse completamente ellos mismos, y yo tuve la suerte de encontrarlo en alguien que llevaba conmigo desde que éramos prácticamente unos niños.',

    'El 20 de diciembre siempre va a ser nuestro día, pero hoy esa fecha se hace pequeña. Hoy manda el 13 de septiembre. Porque hoy no estoy celebrando solamente que cumplas años. Estoy celebrando que existes, que formas parte de mi vida y que, después de tantísimo tiempo conociéndonos, todavía me quedan cosas tuyas por descubrir, momentos que vivir contigo y recuerdos que guardar.',

    'No sé qué nos traerá este año ni todo lo que nos queda por delante, pero sí sé lo que quiero: seguir estando a tu lado. Seguir siendo esa persona con la que puedas reírte, hablar de cualquier cosa, hacer el idiota, apoyarte cuando lo necesites y seguir sumando momentos contigo, de esos que algún día miraremos atrás y nos harán sonreír.',

    'Espero que hoy seas muy feliz, Diana. Espero que este nuevo año te traiga cosas bonitas, que cumplas todo aquello que quieres y que, cuando las cosas no salgan exactamente como esperabas, recuerdes que no tienes que recorrerlas sola. Yo quiero seguir estando ahí, como amigo, como pareja y como la persona que te quiere muchísimo.',

    'Feliz cumpleaños, mi amor. Gracias por todos estos años, por haber sido mi mejor amiga antes de convertirte en mi novia y por seguir siendo las dos cosas a la vez. De todas las casualidades que podían haber ocurrido desde que nos conocimos con 3 años, acabar aquí contigo es, sin duda, mi favorita.',
  ],

  firma:
    'Cesar',

  pie:
    '13 de septiembre',
};


// ═══════════════════════════════════════════════════════════════
// FINAL
// ═══════════════════════════════════════════════════════════════

export const FINAL = {
  frase:
    'Feliz cumpleaños, Diana.',

  sub:
    'Te quiero muchísimo.',

  cierre:
    'Desde los 3 años hasta aquí.\n' +
    'Y todavía nos queda muchísimo por vivir.',

  volver:
    'Volver al principio',

  seguir:
    'Todavía queda algo',
};


// ═══════════════════════════════════════════════════════════════
// POST-CRÉDITOS
// ═══════════════════════════════════════════════════════════════

export const POSTCREDITOS = {
  titulo:
    'Una cosa más',

  texto:
    'Elegir nunca ha sido lo mío cuando se trata de ti,\n' +
    'así que aquí van unas cuantas más.',

  // Vacío: el mosaico entra sin que nadie lo presente.
  mosaico: '',

  pie:
    'Ahora sí. Fin.',

  huevo:
    'Sabía que ibas a seguir bajando.',
};


// ═══════════════════════════════════════════════════════════════
// LA PUERTA
// ═══════════════════════════════════════════════════════════════
//
// Esto NO es seguridad real.
// Es simplemente la forma de que lo primero que pase sea suyo.
//
// Yo la dejaría ACTIVADA.
//

export const ACCESO = {
  activo: true,

  intro: [
    'Esto no es para cualquiera.',
    'De hecho…',
    'sólo hay una persona para la que hice todo esto.',
  ],

  boton:
    'Soy yo',

  preguntas: [
    {
      pregunta:
        '¿Cómo se llama cierto protagonista de cuatro patas?',

      respuestas: [
        'taysson',
        'tayson',
        'taison',
      ],
    },

    {
      pregunta:
        '¿Qué día es el nuestro?',

      respuestas: [
        '20 de diciembre',
        '20 diciembre',
        '20/12',
        '20-12',
        '20.12',
        '2012',
        '20 12',
      ],
    },
  ],

  fallos: [
    'Mmm… sospechoso 👀',
    'Eso no me lo esperaba.',
    'Voy a fingir que no he visto eso 😂',
  ],

  pista:
    'Da igual cómo lo escribas.',

  bien:
    'Vale. Eres tú.',

  saludo:
    'Hola, Diana. ❤️',

  reiniciar:
    'Volver a empezar',
};


// ═══════════════════════════════════════════════════════════════
// MÚSICA
// ═══════════════════════════════════════════════════════════════
//
// CANCIÓN ELEGIDA:
//
// "Te Quiero Tanto"
//
// Debes tener el archivo local en:
//
// public/audio/te-quiero-tanto.mp3
//
// No suena nada hasta que ella dice que sí.
//

export const MUSICA = {
  archivo:
    'audio/te-quiero-tanto.mp3',

  pregunta:
    'Una cosa antes de empezar.',

  si:
    'Con música ❤️',

  no:
    'Sin música',

  poner:
    'Poner música',

  quitar:
    'Quitar música',
};


// ═══════════════════════════════════════════════════════════════
// SECRETOS
// ═══════════════════════════════════════════════════════════════

export const SECRETOS = {
  cuenta: (n, total) =>
    `${n}/${total} secretos`,

  hallazgos: {

    huella:
      'Taysson también da el visto bueno 🐾',

    aniv:
      '20·12. Como para olvidarme.',

    punto:
      'Este puntito amarillo es el del coche.',

    fin:
      'No hay más. Ya está. De verdad.',
  },

  todos:
    'Vale… oficialmente has cotilleado absolutamente todo 😂❤️',
};


// ═══════════════════════════════════════════════════════════════
// PEDIR UN DESEO
// ═══════════════════════════════════════════════════════════════

export const DESEO = {
  boton:
    'Pedir un deseo 🎂',

  pasos: [
    'Pide uno.',
    'Cuando estés lista…',
    'Sopla.',
  ],

  ayuda:
    'Toca la llama',

  cumplido:
    'Espero que se cumpla ❤️',

  cerrar:
    'Seguir',
};


// ═══════════════════════════════════════════════════════════════
// COSAS QUE ADORO DE TI
// ═══════════════════════════════════════════════════════════════
//
// Si alguna frase no suena 100 % a ti, puedes quitarla o cambiarla.
// Si se vacía la lista entera, la sección desaparece sola.
//

export const RAZONES = {
  titulo:
    'Unas cuantas razones',

  lista: [
    'Que antes de ser mi novia ya fueras mi mejor amiga.',

    'Que nos conozcamos desde que teníamos 3 años y todavía sigamos escribiendo nuestra historia.',

    'Que contigo pueda ser yo sin tener que pensar demasiado en cómo hacerlo.',

    'Todas las veces que terminamos riéndonos cuando en teoría intentábamos hacer una foto seria.',

    'Que hasta los momentos más normales terminen convirtiéndose en recuerdos que quiero guardar.',

    'Que después de conocerte durante tantos años todavía me queden cosas por descubrir de ti.',

    'Que el 20·12 tenga un significado que es solamente nuestro.',

    'Que Taysson también tenga que aparecer inevitablemente en cualquier cosa que trate sobre ti.',

    'Poder decir que mi novia sigue siendo también mi mejor amiga.',

    'Todo lo que ya hemos vivido y todo lo que todavía nos queda por vivir.',

    'Que mirándote siga sin saber decidir cuál de todas me gusta más.',

    'Y, simplemente, que seas tú.',
  ],
};


// ═══════════════════════════════════════════════════════════════
// ACCESIBILIDAD / UI
// ═══════════════════════════════════════════════════════════════
//
// Este texto prácticamente no se ve.
// Lo utilizan lectores de pantalla y componentes de navegación.
//

export const UI = {
  rafagaEtiqueta: (n) =>
    `Serie de ${n} fotos`,

  ampliar:
    'Ver más grande',

  cerrar:
    'Cerrar',

  anterior:
    'Anterior',

  siguiente:
    'Siguiente',

  deN: (i, n) =>
    `Foto ${i} de ${n}`,
};
