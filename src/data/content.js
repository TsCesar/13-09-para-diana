// ═══════════════════════════════════════════════════════════════
// 13·09 — PARA DIANA
// ═══════════════════════════════════════════════════════════════
//
// TODO EL TEXTO DE LA WEB VIVE AQUÍ.
//
// César: puedes editar cualquier frase directamente en este archivo
// y se actualizará en la web.
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

export const PORTADA = {
  fecha: ['13', '09'],

  pie: 'Para Diana',

  // Aparece cuando la fecha termina de asentarse.
  entrada: 'Hay fechas que significan mucho más que un día.',

  ayuda: 'Desliza',
};


// ─────────────────────────────────────────────────────────────
// CAPÍTULOS
// ─────────────────────────────────────────────────────────────

export const CAPITULOS = {

  rafaga: {
    titulo: 'Veinticinco fotos. Un solo momento.',

    texto:
      'El mismo ramo. El mismo sitio. Veinticinco fotos seguidas.\n' +
      'Y aun así no hay dos iguales, porque en cada una hay una sonrisa, una mirada o una tontería distinta.\n\n' +
      'Supongo que por eso me cuesta tanto elegir una sola.',

    pista: 'Tócala',
  },


  cotidiano: {
    titulo: 'Lo que no posaste',

    texto:
      'Los momentos pequeños que terminan siendo de los que más me gusta guardar.',

    pies: {
      lavadero:
        'Once fotos tuyas con una manguera. Once.',

      gimnasio:
        'Diez intentos de que salieras seria. Ninguno salió bien.',

      conducir:
        'Tú conduciendo. Siete segundos.',
    },
  },


  coche: {
    titulo: 'El amarillo',

    texto:
      'Hay cosas que se acaban repitiendo tanto que terminan formando parte de los recuerdos sin darte cuenta.',

    pies: {
      cocheNoche:
        'Treinta y seis fotos en un aparcamiento vacío.',

      monte:
        'Y ocho más con luz de día.',

      carretera:
        'Volviendo.',
    },
  },


  taysson: {
    titulo: 'Taysson',

    texto:
      'Y claro, si esta página va sobre ti, era imposible que él no tuviera también su pequeño sitio aquí.',

    pies: {
      alza:
        'Aquí lo levantas hasta tu cara. Tiene sonido, por si quieres oírlo.',

      brazos:
        'Doce segundos en brazos y ni un intento de bajarse.',

      sofa:
        'Y aquí lleva cuarenta y nueve segundos sin moverse.',
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

    pies: {
      ascensor:
        'Cuatro fotos en un ascensor. Salimos mal en las cuatro.',

      cocheNocturno:
        'Y siete más en un coche parado.',
    },
  },


  oro: {
    titulo: 'El día de la luz buena',

    texto:
      'Treinta y ocho fotos tuyas de pie en el mismo césped.\n' +
      'Y viendo cómo quedaron, entiendo perfectamente por qué costaba parar.',

    pies: {
      enBrazos:
        'Y ocho en las que no tocas el suelo.',

      familia:
        'Esta no hizo falta repetirla.',

      acto:
        'El acto era mío. Las treinta y ocho fotos, tuyas.',
    },
  },


  // Fotos sueltas. La mayoría no lleva pie a propósito: no todo necesita
  // que yo lo explique, y algunas se ven mejor calladas.
  galeria: {
    titulo: 'Y luego está todo lo demás',

    texto:
      'Fotos sueltas. Sin ráfaga, sin sitio fijo y sin nada que explicar.\n' +
      'Están aquí simplemente porque me gustan.',
  },


  senda: {
    titulo: 'Diecinueve pasos',

    texto:
      'Pásalos rápido y empiezas a andar de verdad.\n' +
      'Diecinueve fotos que, una detrás de otra, terminan convirtiéndose en un pequeño vídeo sin serlo.',

    pie:
      'Te vas por el camino y no miras atrás hasta la última.',

    pieViva:
      'Y justo después del paso diecinueve, ya no hizo falta ninguna foto más.',

    pista:
      'Arrastra el dedo',
  },
};


// ─────────────────────────────────────────────────────────────
// JUEGOS
// ─────────────────────────────────────────────────────────────

export const JUEGOS = {
  titulo: 'Tres juegos',

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
      'La ráfaga correcta',

    intro:
      'Yo elegí una de cada ráfaga para esta web. Ahora te toca a ti.\n' +
      'La que marques se queda, y el resto de la página la usará a partir de ahora.',

    pista:
      'Toca la que te quedarías',

    hecho:
      'Cambiada. Ahora la web es un poco más tuya.',

    reset:
      'Dejar las mías',

    final:
      'Listo. Tres ráfagas, tus tres elegidas.',
  },


  cuantas: {
    titulo:
      '¿Cuántas crees que hice?',

    intro:
      'Una pregunta por sitio. Arrastra hasta tu número.',

    preguntas: [
      {
        id: 'ramo',
        pregunta: 'Tú con el ramo, en el pasillo',
        real: 25,
        max: 40,
        unidad: 'fotos',
      },

      {
        id: 'coche',
        pregunta: 'Tú y el coche amarillo, de noche',
        real: 36,
        max: 60,
        unidad: 'fotos',
      },

      {
        id: 'senda',
        pregunta: 'Tú andando por el camino verde',
        real: 51,
        max: 80,
        unidad: 'fotos',
      },

      {
        id: 'total',
        pregunta: 'Y en total, en todo esto',
        real: 399,
        max: 600,
        unidad: 'fotos',
      },
    ],

    comprobar:
      'Ver',

    siguiente:
      'Siguiente',

    exacto:
      'Exacto. {n}.',

    cerca:
      'Casi. Eran {n}.',

    lejos:
      'Eran {n}.',

    corto:
      'Más. Eran {n}.',

    cierre:
      'Trescientas noventa y nueve fotos y treinta vídeos.\n' +
      'Ahora ya entiendes por qué elegir unas pocas no era precisamente fácil.',
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

    'También está Taysson, claro. Porque cualquier cosa que hable de ti sin que aparezca él en algún momento estaría incompleta. Sé lo importante que es para ti, y por eso también tenía que tener su pequeño sitio aquí, aunque seguramente él no tenga ni idea de que forma parte de una página web de cumpleaños.',

    'El 20 de diciembre siempre va a ser nuestro día, pero hoy esa fecha se hace pequeña. Hoy manda el 13 de septiembre. Porque hoy no estoy celebrando solamente que cumplas años. Estoy celebrando que existes, que formas parte de mi vida y que, después de tantísimo tiempo conociéndonos, todavía me quedan cosas tuyas por descubrir, momentos que vivir contigo y recuerdos que guardar.',

    'No sé qué nos traerá este año ni todo lo que nos queda por delante, pero sí sé lo que quiero: seguir estando a tu lado. Seguir siendo esa persona con la que puedas reírte, hablar de cualquier cosa, hacer el idiota, apoyarte cuando lo necesites y seguir acumulando fotografías hasta que algún día hacer una web como esta sea directamente imposible porque haya demasiadas.',

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
    'Después de tantas fotos todavía quedaban algunas fuera.\n' +
    'Y como elegir nunca ha sido lo mío cuando se trata de ti, aquí van unas cuantas más.',

  // Encabeza el mosaico de descartes de ráfaga, que es otra cosa distinta
  // de la tira de fotos buenas de arriba.
  mosaico:
    'Y esto de abajo son todos los fotogramas que no llegaron a ser el elegido de su ráfaga. No se ha tirado ninguno.',

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
// Es simplemente parte de la experiencia.
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
    'Reiniciar experiencia',
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
// La web NO debe intentar reproducirla automáticamente
// antes de que Diana interactúe.
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
      'Taysson también aprueba esta página 🐾',

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
// Esta sección aparecerá porque ahora tiene contenido.
//
// Si alguna frase no suena 100 % a ti, puedes quitarla o cambiarla.
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

    'Que entre cientos de fotos siga costándome decidir cuál me gusta más.',

    'Y, simplemente, que seas tú.',
  ],
};


// ═══════════════════════════════════════════════════════════════
// QUIZ
// ═══════════════════════════════════════════════════════════════
//
// Todas estas preguntas utilizan únicamente datos reales
// que conocemos.
//
// Si luego quieres meter preguntas mucho más privadas y vuestras,
// sería todavía mejor.
//

export const QUIZ = {
  titulo:
    '¿Cuánto me conoces?',

  intro:
    'Cuatro preguntas. Sin trampas.',

  preguntas: [

    {
      pregunta:
        '¿Desde qué edad nos conocemos?',

      opciones: [
        'Desde los 3 años',
        'Desde los 6 años',
        'Desde los 10 años',
        'Desde los 15 años',
      ],

      correcta: 0,
    },

    {
      pregunta:
        '¿Qué éramos antes de ser pareja?',

      opciones: [
        'Compañeros de clase',
        'Mejores amigos',
        'Vecinos',
        'Prácticamente desconocidos',
      ],

      correcta: 1,
    },

    {
      pregunta:
        '¿Cuál es nuestro día?',

      opciones: [
        '13 de septiembre',
        '20 de diciembre',
        '14 de febrero',
        '31 de diciembre',
      ],

      correcta: 1,
    },

    {
      pregunta:
        '¿Quién tenía que aparecer sí o sí en esta web?',

      opciones: [
        'Taysson',
        'Un gato aleatorio',
        'Nadie',
        'El coche solamente',
      ],

      correcta: 0,
    },
  ],

  bien:
    'Esa te la sabías.',

  mal:
    'Era: {n}',
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
    `Ráfaga de ${n} fotos`,

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