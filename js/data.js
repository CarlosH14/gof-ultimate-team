// ============================================================
// Los 23 patrones del Gang of Four como plantilla FUT.
// categoria: creacional | estructural | comportamiento
// posicion FUT: POR/DFC/LI/LD (defensa), MC/MCO (medio), DEL/EI/ED (ataque)
// coords: posición en el campo en % (x, y) — solo titulares
// ============================================================

const CAT_META = {
  creacional:     { icono: "🏗️", escudo: "🛡️", etiqueta: "Creacional" },
  estructural:    { icono: "🧩", escudo: "⚙️", etiqueta: "Estructural" },
  comportamiento: { icono: "⚡", escudo: "🎯", etiqueta: "Comportamiento" },
};

const PATRONES = [
  // ================= TITULARES =================
  {
    id: "singleton",
    nombre: "Singleton",
    categoria: "creacional",
    posicion: "POR",
    rating: 88,
    titular: true,
    inform: true,
    coords: { x: 50, y: 90 },
    quimica: ["abstract-factory", "builder", "facade"],
    intencion: "Garantiza que una clase tenga una única instancia y da un punto de acceso global a ella.",
    problema: "Algunas cosas solo deben existir una vez: la conexión a la base de datos, la configuración global, el registro de logs. Si cada parte del programa crea la suya, acabas con estados inconsistentes y recursos desperdiciados.",
    solucion: "La propia clase controla su creación: oculta el constructor y expone un método que crea la instancia la primera vez y devuelve siempre esa misma en llamadas posteriores. Úsalo con moderación — abusar de él introduce estado global difícil de testear.",
    analogia: "Es el portero del equipo: solo puede haber UNO bajo palos. Da igual cuántas veces pidas 'el portero', siempre te responde el mismo. Por eso juega de POR en esta plantilla.",
    stats: { Frecuencia: 90, Simplicidad: 92, Flexibilidad: 45, Testabilidad: 38, Reusabilidad: 70, Desacoplo: 30 },
    codigo: `class Conexion:
    _instancia = None

    def __new__(cls):
        if cls._instancia is None:
            cls._instancia = super().__new__(cls)
            cls._instancia.url = "db://localhost"
            print("Creando la única conexión…")
        return cls._instancia


a = Conexion()   # Creando la única conexión…
b = Conexion()   # (no crea nada nuevo)
print(a is b)    # True — ¡misma instancia!`,
  },
  {
    id: "factory-method",
    nombre: "Factory Method",
    categoria: "creacional",
    posicion: "DFC",
    rating: 93,
    titular: true,
    coords: { x: 32, y: 72 },
    quimica: ["abstract-factory", "template-method", "prototype"],
    intencion: "Define una interfaz para crear objetos, pero deja que las subclases decidan qué clase concreta instanciar.",
    problema: "Tu código crea objetos con la clase concreta escrita a fuego (new CamionDiesel() por todas partes). Cuando llega un tipo nuevo — barcos, drones — tienes que tocar todo el código que instancia.",
    solucion: "Mueve la creación a un método 'fábrica' que las subclases sobrescriben. El código cliente trabaja contra la interfaz del producto y nunca sabe (ni le importa) qué clase concreta recibió.",
    analogia: "La cantera del club: el primer equipo pide 'un delantero' y la academia decide si sube a un canterano zurdo o diestro. El entrenador no elige la fábrica, solo usa al jugador que le entregan.",
    stats: { Frecuencia: 95, Simplicidad: 75, Flexibilidad: 90, Testabilidad: 85, Reusabilidad: 88, Desacoplo: 90 },
    codigo: `from abc import ABC, abstractmethod

class Transporte(ABC):
    @abstractmethod
    def entregar(self): ...

class Camion(Transporte):
    def entregar(self): return "Entrega por carretera 🚚"

class Barco(Transporte):
    def entregar(self): return "Entrega por mar 🚢"

class Logistica(ABC):
    @abstractmethod
    def crear_transporte(self) -> Transporte: ...   # factory method

    def planificar(self):
        t = self.crear_transporte()
        return t.entregar()

class LogisticaTerrestre(Logistica):
    def crear_transporte(self): return Camion()

class LogisticaMaritima(Logistica):
    def crear_transporte(self): return Barco()

print(LogisticaMaritima().planificar())  # Entrega por mar 🚢`,
  },
  {
    id: "abstract-factory",
    nombre: "Abstract Factory",
    categoria: "creacional",
    posicion: "DFC",
    rating: 87,
    titular: true,
    coords: { x: 68, y: 72 },
    quimica: ["factory-method", "singleton", "bridge"],
    intencion: "Crea familias completas de objetos relacionados sin especificar sus clases concretas.",
    problema: "Necesitas que los objetos que creas sean compatibles entre sí: una UI de Windows no debe mezclar botones de Mac. Con fábricas sueltas es fácil acabar con combinaciones incoherentes.",
    solucion: "Define una interfaz de fábrica con un método por cada producto de la familia (crear_boton, crear_menu…). Cada fábrica concreta produce una familia coherente. Cambias de familia cambiando UNA fábrica.",
    analogia: "El proveedor de equipación: si fichas con una marca, te da camiseta, pantalón y botas a juego. No mezclas la camiseta de una marca con las botas de otra — la fábrica garantiza que todo el kit combine.",
    stats: { Frecuencia: 78, Simplicidad: 60, Flexibilidad: 92, Testabilidad: 84, Reusabilidad: 86, Desacoplo: 92 },
    codigo: `from abc import ABC, abstractmethod

class Boton(ABC):
    @abstractmethod
    def pintar(self): ...

class BotonWin(Boton):
    def pintar(self): return "[ Botón Windows ]"

class BotonMac(Boton):
    def pintar(self): return "( Botón macOS )"

class FabricaUI(ABC):
    @abstractmethod
    def crear_boton(self) -> Boton: ...

class FabricaWin(FabricaUI):
    def crear_boton(self): return BotonWin()

class FabricaMac(FabricaUI):
    def crear_boton(self): return BotonMac()

def montar_app(fabrica: FabricaUI):
    return fabrica.crear_boton().pintar()

print(montar_app(FabricaMac()))  # ( Botón macOS )`,
  },
  {
    id: "builder",
    nombre: "Builder",
    categoria: "creacional",
    posicion: "LI",
    rating: 85,
    titular: true,
    coords: { x: 12, y: 68 },
    quimica: ["abstract-factory", "composite"],
    intencion: "Construye objetos complejos paso a paso, separando la construcción de la representación final.",
    problema: "Un constructor con 10 parámetros opcionales es ilegible: Casa(4, True, None, None, 2, False, ...). Las alternativas — decenas de subclases o parámetros nulos — son peores.",
    solucion: "Extrae la construcción a un objeto 'builder' con métodos encadenables para cada paso (con_piscina(), con_garaje()…). Solo llamas a los pasos que necesitas y al final pides el resultado.",
    analogia: "El míster montando la alineación: primero elige portero, luego defensa, luego el ataque… paso a paso hasta que hace clic en 'confirmar once'. Nadie monta un equipo pasándole 11 nombres a un constructor gigante.",
    stats: { Frecuencia: 82, Simplicidad: 70, Flexibilidad: 85, Testabilidad: 80, Reusabilidad: 75, Desacoplo: 78 },
    codigo: `class Pizza:
    def __init__(self):
        self.ingredientes = []
    def __str__(self):
        return "Pizza con " + ", ".join(self.ingredientes)

class PizzaBuilder:
    def __init__(self):
        self._pizza = Pizza()

    def queso(self):
        self._pizza.ingredientes.append("queso"); return self

    def pepperoni(self):
        self._pizza.ingredientes.append("pepperoni"); return self

    def build(self) -> Pizza:
        return self._pizza


pizza = PizzaBuilder().queso().pepperoni().build()
print(pizza)  # Pizza con queso, pepperoni`,
  },
  {
    id: "prototype",
    nombre: "Prototype",
    categoria: "creacional",
    posicion: "LD",
    rating: 80,
    titular: true,
    coords: { x: 88, y: 68 },
    quimica: ["factory-method", "memento"],
    intencion: "Crea objetos nuevos copiando una instancia existente (el prototipo), sin depender de sus clases.",
    problema: "Copiar un objeto 'a mano' desde fuera es frágil: puede tener campos privados o no conocer su clase concreta. Y a veces construirlo desde cero es caro (configuración, datos cargados…).",
    solucion: "El propio objeto sabe clonarse: expone un método clone() que devuelve una copia con su mismo estado. En Python, el módulo copy hace el trabajo pesado.",
    analogia: "El jugador clónico de la cantera: en vez de formar un lateral desde los 8 años, clonas al titular con todos sus atributos ya entrenados y le cambias el dorsal.",
    stats: { Frecuencia: 60, Simplicidad: 78, Flexibilidad: 80, Testabilidad: 75, Reusabilidad: 72, Desacoplo: 74 },
    codigo: `import copy

class Personaje:
    def __init__(self, nombre, nivel, inventario):
        self.nombre = nombre
        self.nivel = nivel
        self.inventario = inventario

    def clone(self):
        return copy.deepcopy(self)


base = Personaje("Guerrero", 50, ["espada", "escudo"])
gemelo = base.clone()
gemelo.nombre = "Guerrero II"
gemelo.inventario.append("poción")

print(base.inventario)    # ['espada', 'escudo']
print(gemelo.inventario)  # ['espada', 'escudo', 'poción']`,
  },
  {
    id: "adapter",
    nombre: "Adapter",
    categoria: "estructural",
    posicion: "MC",
    rating: 92,
    titular: true,
    coords: { x: 24, y: 45 },
    quimica: ["facade", "bridge", "decorator"],
    intencion: "Permite que dos interfaces incompatibles trabajen juntas envolviendo una de ellas.",
    problema: "Tu app trabaja con JSON, pero la librería de gráficas que quieres usar solo acepta XML. No puedes tocar la librería y no quieres reescribir tu app.",
    solucion: "Creas una clase intermedia que implementa la interfaz que tu código espera y por dentro traduce las llamadas al formato que la librería entiende. Ninguna de las dos partes se entera.",
    analogia: "El traductor del fichaje extranjero: el míster da instrucciones en español, el traductor las convierte, y el delantero las ejecuta. Ni el míster aprende otro idioma ni el jugador español.",
    stats: { Frecuencia: 94, Simplicidad: 80, Flexibilidad: 85, Testabilidad: 88, Reusabilidad: 82, Desacoplo: 88 },
    codigo: `class EnchufeEuropeo:
    def voltaje_220(self):
        return "⚡ 220V con clavija redonda"

class DispositivoUSA:
    """Solo entiende la interfaz americana."""
    def conectar(self, toma):
        return toma.voltaje_110()

class Adaptador:
    def __init__(self, enchufe: EnchufeEuropeo):
        self._enchufe = enchufe

    def voltaje_110(self):  # la interfaz que espera el cliente
        original = self._enchufe.voltaje_220()
        return f"{original} → convertido a 110V"


dispositivo = DispositivoUSA()
print(dispositivo.conectar(Adaptador(EnchufeEuropeo())))`,
  },
  {
    id: "decorator",
    nombre: "Decorator",
    categoria: "estructural",
    posicion: "MCO",
    rating: 93,
    titular: true,
    coords: { x: 50, y: 40 },
    quimica: ["adapter", "composite", "strategy"],
    intencion: "Añade responsabilidades a un objeto dinámicamente, envolviéndolo, sin tocar su clase ni crear subclases.",
    problema: "Quieres combinar extras — notificar por email, por SMS, por Slack, con cifrado, con log… Con herencia necesitarías una subclase por cada combinación: explosión combinatoria.",
    solucion: "Cada extra es un 'envoltorio' que implementa la misma interfaz que el objeto base y delega en él añadiendo su granito. Puedes apilar envoltorios en cualquier orden y cantidad, en tiempo de ejecución.",
    analogia: "Es el 10 del equipo, el que viste la jugada: la misma pelota pasa por él y sale con efecto añadido. Y como las capas de ropa en un partido con frío: camiseta + sudadera + chubasquero, cada capa suma sin cambiar a la persona.",
    stats: { Frecuencia: 92, Simplicidad: 65, Flexibilidad: 95, Testabilidad: 82, Reusabilidad: 90, Desacoplo: 86 },
    codigo: `class Cafe:
    def coste(self): return 2.0
    def descripcion(self): return "Café"

class ConLeche:
    def __init__(self, bebida): self._b = bebida
    def coste(self): return self._b.coste() + 0.5
    def descripcion(self): return self._b.descripcion() + " + leche"

class ConCaramelo:
    def __init__(self, bebida): self._b = bebida
    def coste(self): return self._b.coste() + 0.7
    def descripcion(self): return self._b.descripcion() + " + caramelo"


pedido = ConCaramelo(ConLeche(Cafe()))   # capas apilables
print(pedido.descripcion())  # Café + leche + caramelo
print(pedido.coste())        # 3.2`,
  },
  {
    id: "facade",
    nombre: "Facade",
    categoria: "estructural",
    posicion: "MC",
    rating: 84,
    titular: true,
    coords: { x: 76, y: 45 },
    quimica: ["adapter", "singleton", "mediator"],
    intencion: "Ofrece una interfaz simple y unificada a un subsistema complejo.",
    problema: "Para reproducir un vídeo hay que inicializar el códec, leer el buffer, sincronizar audio, gestionar hilos… Si el código cliente hace todo eso, queda acoplado a veinte clases internas.",
    solucion: "Creas una clase 'fachada' con los pocos métodos que el cliente realmente necesita (reproducir(archivo)) y que orquesta el subsistema por dentro. La complejidad sigue ahí, pero escondida tras una puerta bonita.",
    analogia: "El delegado del equipo: tú le dices 'organiza el viaje al partido' y él habla con hotel, autobús, federación y utilleros. El jugador solo ve una llamada: '¿a qué hora salimos?'.",
    stats: { Frecuencia: 88, Simplicidad: 90, Flexibilidad: 60, Testabilidad: 78, Reusabilidad: 70, Desacoplo: 82 },
    codigo: `# Subsistema complejo
class Codec:
    def cargar(self, f): return f"códec para {f}"

class Audio:
    def sincronizar(self): return "audio sincronizado"

class Pantalla:
    def dibujar(self): return "▶ reproduciendo"

# La fachada esconde la orquesta
class ReproductorFacade:
    def __init__(self):
        self._codec, self._audio, self._pantalla = Codec(), Audio(), Pantalla()

    def reproducir(self, archivo):
        pasos = [self._codec.cargar(archivo),
                 self._audio.sincronizar(),
                 self._pantalla.dibujar()]
        return " → ".join(pasos)


print(ReproductorFacade().reproducir("final.mp4"))`,
  },
  {
    id: "observer",
    nombre: "Observer",
    categoria: "comportamiento",
    posicion: "EI",
    rating: 96,
    titular: true,
    coords: { x: 20, y: 16 },
    quimica: ["mediator", "command", "state"],
    intencion: "Define una relación uno-a-muchos: cuando un objeto cambia, todos sus suscriptores son notificados automáticamente.",
    problema: "Varias partes de tu app necesitan reaccionar cuando algo pasa (llega stock, cambia el precio…). Que cada una pregunte en bucle es un desperdicio; que el objeto conozca a todos sus interesados lo acopla a ellos.",
    solucion: "El objeto 'publicador' mantiene una lista de suscriptores con una interfaz común (actualizar()). Cualquiera puede suscribirse o borrarse en caliente, y el publicador les avisa sin saber quiénes son.",
    analogia: "El capitán y estrella del equipo: cuando marca gol, la grada entera, los comentaristas y las apps de resultados se enteran al instante. Él no llama a nadie — están suscritos a lo que hace. El 96 de rating no es casualidad: es el patrón más determinante del juego moderno (interfaces reactivas, eventos).",
    stats: { Frecuencia: 96, Simplicidad: 72, Flexibilidad: 90, Testabilidad: 80, Reusabilidad: 88, Desacoplo: 94 },
    codigo: `class Publicador:
    def __init__(self):
        self._subs = []

    def suscribir(self, fn):
        self._subs.append(fn)

    def notificar(self, evento):
        for fn in self._subs:
            fn(evento)


tienda = Publicador()
tienda.suscribir(lambda e: print(f"📧 Email: {e}"))
tienda.suscribir(lambda e: print(f"📱 Push: {e}"))

tienda.notificar("¡PS6 disponible!")
# 📧 Email: ¡PS6 disponible!
# 📱 Push: ¡PS6 disponible!`,
  },
  {
    id: "strategy",
    nombre: "Strategy",
    categoria: "comportamiento",
    posicion: "DC",
    rating: 94,
    titular: true,
    coords: { x: 50, y: 12 },
    quimica: ["state", "template-method", "decorator"],
    intencion: "Define una familia de algoritmos intercambiables y los hace independientes del cliente que los usa.",
    problema: "Tu clase de rutas calcula el camino en coche, a pie y en bici… todo en un método gigante lleno de if. Cada algoritmo nuevo lo engorda más y cualquier cambio arriesga romper el resto.",
    solucion: "Extrae cada algoritmo a su propia clase con una interfaz común (calcular(origen, destino)). El contexto recibe una estrategia y delega en ella; cambiarla es asignar otro objeto, incluso en tiempo de ejecución.",
    analogia: "El plan de partido: mismo equipo, distinta estrategia según el rival — presión alta, contraataque o toque. El míster (contexto) no juega: elige la estrategia y los jugadores la ejecutan. Por eso lleva el 9: define cómo ataca el equipo.",
    stats: { Frecuencia: 95, Simplicidad: 80, Flexibilidad: 94, Testabilidad: 92, Reusabilidad: 90, Desacoplo: 92 },
    codigo: `class PrecioNormal:
    def total(self, base): return base

class PrecioBlackFriday:
    def total(self, base): return base * 0.5

class PrecioSocio:
    def total(self, base): return base * 0.8

class Carrito:
    def __init__(self, estrategia):
        self.estrategia = estrategia   # intercambiable

    def pagar(self, base):
        return f"Total: {self.estrategia.total(base):.2f}€"


carrito = Carrito(PrecioNormal())
print(carrito.pagar(100))            # Total: 100.00€
carrito.estrategia = PrecioBlackFriday()
print(carrito.pagar(100))            # Total: 50.00€`,
  },
  {
    id: "command",
    nombre: "Command",
    categoria: "comportamiento",
    posicion: "ED",
    rating: 87,
    titular: true,
    coords: { x: 80, y: 16 },
    quimica: ["memento", "observer", "chain-of-responsibility"],
    intencion: "Convierte una petición en un objeto independiente, permitiendo encolarla, deshacerla o registrarla.",
    problema: "El botón 'Copiar' de la barra, el del menú y el atajo Ctrl+C hacen lo mismo… ¿duplicas el código en tres sitios? ¿Y cómo implementas deshacer si la acción se ejecutó y desapareció?",
    solucion: "Encapsulas cada acción en un objeto con ejecutar() (y opcionalmente deshacer()). Botones, menús y atajos solo disparan el comando que tengan asignado. Al ser objetos, puedes guardarlos en un historial, encolarlos o enviarlos por red.",
    analogia: "La jugada de pizarra a balón parado: el míster la diseña, la 'guarda' con un nombre, y cualquier jugador puede pedirla en el córner. Y si sale mal, queda grabada en vídeo para analizarla (historial).",
    stats: { Frecuencia: 80, Simplicidad: 68, Flexibilidad: 88, Testabilidad: 85, Reusabilidad: 84, Desacoplo: 88 },
    codigo: `class Editor:
    def __init__(self): self.texto = ""

class Escribir:
    def __init__(self, editor, letras):
        self.editor, self.letras = editor, letras

    def ejecutar(self):
        self.editor.texto += self.letras

    def deshacer(self):
        self.editor.texto = self.editor.texto[:-len(self.letras)]


editor, historial = Editor(), []
for cmd in [Escribir(editor, "Hola "), Escribir(editor, "mundo")]:
    cmd.ejecutar()
    historial.append(cmd)

print(editor.texto)        # Hola mundo
historial.pop().deshacer()
print(editor.texto)        # Hola`,
  },

  // ================= BANQUILLO =================
  {
    id: "composite",
    nombre: "Composite",
    categoria: "estructural",
    posicion: "MC",
    rating: 83,
    titular: false,
    quimica: ["decorator", "iterator", "visitor"],
    intencion: "Compón objetos en estructuras de árbol y trata igual a objetos individuales y a grupos completos.",
    problema: "Un pedido contiene productos y cajas; las cajas contienen más productos y más cajas. Calcular el precio total obligaría a conocer los tipos y recorrer la estructura a mano.",
    solucion: "Productos (hojas) y cajas (compuestos) comparten interfaz (precio()). La caja suma recursivamente el precio de sus hijos sin importar si son hojas u otras cajas.",
    analogia: "La estructura del club: un jugador tiene ficha; un equipo agrupa jugadores; la federación agrupa equipos. Pides 'coste total' a cualquier nivel y la cuenta baja sola por el árbol.",
    stats: { Frecuencia: 75, Simplicidad: 62, Flexibilidad: 86, Testabilidad: 76, Reusabilidad: 82, Desacoplo: 80 },
    codigo: `class Producto:
    def __init__(self, nombre, precio):
        self.nombre, self._precio = nombre, precio
    def precio(self): return self._precio

class Caja:
    def __init__(self):
        self.contenido = []
    def agregar(self, item):
        self.contenido.append(item); return self
    def precio(self):   # misma interfaz que Producto
        return sum(item.precio() for item in self.contenido)


envio = Caja().agregar(Producto("libro", 15)).agregar(
    Caja().agregar(Producto("cable", 5)).agregar(Producto("ratón", 25))
)
print(envio.precio())  # 45`,
  },
  {
    id: "bridge",
    nombre: "Bridge",
    categoria: "estructural",
    posicion: "MC",
    rating: 76,
    titular: false,
    quimica: ["abstract-factory", "adapter", "strategy"],
    intencion: "Separa una abstracción de su implementación para que ambas evolucionen por separado.",
    problema: "Tienes Formas (círculo, cuadrado) y Colores (rojo, azul). Con herencia necesitas CirculoRojo, CirculoAzul, CuadradoRojo… cada dimensión nueva multiplica las clases.",
    solucion: "Divide en dos jerarquías: la abstracción (Forma) contiene una referencia a la implementación (Color) y le delega el trabajo. 2+2 clases en lugar de 2×2.",
    analogia: "Jugador y bota: cualquier jugador puede calzarse cualquier bota. No fabricas un 'Messi-con-botas-rojas' — combinas dos piezas independientes en el vestuario.",
    stats: { Frecuencia: 55, Simplicidad: 55, Flexibilidad: 90, Testabilidad: 80, Reusabilidad: 85, Desacoplo: 90 },
    codigo: `class Motor:                 # jerarquía de implementación
    def encender(self): ...

class MotorGasolina(Motor):
    def encender(self): return "brumm ⛽"

class MotorElectrico(Motor):
    def encender(self): return "zzzz 🔋"

class Vehiculo:              # jerarquía de abstracción
    def __init__(self, motor: Motor):
        self.motor = motor   # el "puente"

    def arrancar(self):
        return f"{type(self).__name__}: {self.motor.encender()}"

class Coche(Vehiculo): pass
class Moto(Vehiculo): pass


print(Coche(MotorElectrico()).arrancar())  # Coche: zzzz 🔋
print(Moto(MotorGasolina()).arrancar())    # Moto: brumm ⛽`,
  },
  {
    id: "flyweight",
    nombre: "Flyweight",
    categoria: "estructural",
    posicion: "MC",
    rating: 70,
    titular: false,
    quimica: ["composite", "singleton"],
    intencion: "Comparte el estado común entre miles de objetos para ahorrar memoria.",
    problema: "Un juego con un millón de balas se queda sin RAM: cada bala guarda su sprite, color y textura… que son idénticos en todas.",
    solucion: "Divide el estado: lo compartido e inmutable (sprite, color) vive en un objeto 'flyweight' único reutilizado; lo único de cada instancia (posición, velocidad) se pasa desde fuera.",
    analogia: "La grada del estadio: 80.000 aficionados no llevan cada uno su propia réplica del escudo gigante — comparten UN tifo. Lo único individual es su asiento (posición).",
    stats: { Frecuencia: 40, Simplicidad: 50, Flexibilidad: 60, Testabilidad: 65, Reusabilidad: 70, Desacoplo: 60 },
    codigo: `class TipoArbol:            # estado compartido (pesado)
    _cache = {}

    def __new__(cls, especie, textura):
        clave = (especie, textura)
        if clave not in cls._cache:
            obj = super().__new__(cls)
            obj.especie, obj.textura = especie, textura
            cls._cache[clave] = obj
        return cls._cache[clave]

class Arbol:                 # estado único (ligero)
    def __init__(self, x, y, tipo):
        self.x, self.y, self.tipo = x, y, tipo


bosque = [Arbol(i, i * 2, TipoArbol("pino", "verde.png"))
          for i in range(10_000)]
print(len(TipoArbol._cache))  # 1 — ¡un solo tipo para 10.000 árboles!`,
  },
  {
    id: "proxy",
    nombre: "Proxy",
    categoria: "estructural",
    posicion: "MC",
    rating: 81,
    titular: false,
    quimica: ["adapter", "decorator", "facade"],
    intencion: "Proporciona un sustituto de otro objeto para controlar el acceso a él (caché, permisos, carga perezosa…).",
    problema: "Un objeto es caro de crear (vídeo enorme) o delicado de exponer (API de pagos). No quieres que los clientes lo toquen directamente ni pagar su coste hasta que haga falta.",
    solucion: "Un objeto intermedio con la MISMA interfaz que el real intercepta las llamadas: puede crear el objeto solo cuando se usa, cachear resultados, comprobar permisos o registrar accesos.",
    analogia: "El agente del jugador: quien quiera fichar a la estrella habla primero con su representante, que filtra ofertas, negocia y solo molesta al jugador cuando la propuesta es seria.",
    stats: { Frecuencia: 72, Simplicidad: 66, Flexibilidad: 82, Testabilidad: 78, Reusabilidad: 76, Desacoplo: 84 },
    codigo: `class VideoReal:
    def __init__(self, archivo):
        print(f"⏳ Cargando {archivo} (3 GB)…")   # operación cara
        self.archivo = archivo

    def reproducir(self):
        return f"▶ {self.archivo}"

class VideoProxy:
    def __init__(self, archivo):
        self.archivo, self._real = archivo, None

    def reproducir(self):        # carga perezosa
        if self._real is None:
            self._real = VideoReal(self.archivo)
        return self._real.reproducir()


video = VideoProxy("final.mp4")   # aún no carga nada
print("Proxy listo, sin coste")
print(video.reproducir())         # ahora sí: ⏳ Cargando…`,
  },
  {
    id: "iterator",
    nombre: "Iterator",
    categoria: "comportamiento",
    posicion: "MC",
    rating: 86,
    titular: false,
    quimica: ["composite", "visitor", "memento"],
    intencion: "Recorre los elementos de una colección sin exponer su estructura interna.",
    problema: "Tus colecciones son listas, árboles y grafos. Si el cliente recorre cada una 'a mano', queda acoplado a la estructura y duplica lógica de recorrido por todas partes.",
    solucion: "Extrae el recorrido a un objeto iterador con interfaz común (siguiente(), hay_mas()). Python lo integra en el lenguaje: __iter__ y __next__, y los generadores lo hacen trivial.",
    analogia: "El ojeador repasando la plantilla: va jugador por jugador con su libreta sin importarle si el club los guarda por dorsal, por posición o por orden alfabético.",
    stats: { Frecuencia: 88, Simplicidad: 82, Flexibilidad: 78, Testabilidad: 84, Reusabilidad: 80, Desacoplo: 82 },
    codigo: `class Plantilla:
    def __init__(self):
        self._jugadores = {}          # estructura interna oculta

    def fichar(self, dorsal, nombre):
        self._jugadores[dorsal] = nombre

    def __iter__(self):               # el iterador
        for dorsal in sorted(self._jugadores):
            yield f"#{dorsal} {self._jugadores[dorsal]}"


equipo = Plantilla()
equipo.fichar(10, "Messi")
equipo.fichar(1, "Casillas")

for jugador in equipo:    # el cliente no sabe que hay un dict
    print(jugador)        # #1 Casillas / #10 Messi`,
  },
  {
    id: "template-method",
    nombre: "Template Method",
    categoria: "comportamiento",
    posicion: "MC",
    rating: 82,
    titular: false,
    quimica: ["factory-method", "strategy"],
    intencion: "Define el esqueleto de un algoritmo en la superclase y deja que las subclases redefinan pasos concretos sin cambiar la estructura.",
    problema: "Tres procesadores de documentos (PDF, CSV, Word) repiten el mismo flujo — abrir, extraer, analizar, cerrar — y solo cambia un paso. El copy-paste se te está yendo de las manos.",
    solucion: "La clase base implementa el flujo completo en un método 'plantilla' y declara abstractos los pasos variables. Cada subclase rellena solo su parte.",
    analogia: "La rutina de partido es fija: calentamiento → charla → partido → estiramientos. Lo único que cambia cada semana es el contenido de la charla táctica (el paso que redefine cada 'subclase' de rival).",
    stats: { Frecuencia: 78, Simplicidad: 76, Flexibilidad: 70, Testabilidad: 75, Reusabilidad: 84, Desacoplo: 72 },
    codigo: `from abc import ABC, abstractmethod

class Informe(ABC):
    def generar(self):               # método plantilla
        return "\\n".join([
            "=== INFORME ===",
            self.cuerpo(),           # paso variable
            "=== FIN ===",
        ])

    @abstractmethod
    def cuerpo(self): ...

class InformeVentas(Informe):
    def cuerpo(self): return "Ventas: 1.204 unidades 📈"

class InformeErrores(Informe):
    def cuerpo(self): return "Errores críticos: 0 ✅"


print(InformeVentas().generar())
print(InformeErrores().generar())`,
  },
  {
    id: "state",
    nombre: "State",
    categoria: "comportamiento",
    posicion: "MCO",
    rating: 79,
    titular: false,
    quimica: ["strategy", "observer"],
    intencion: "Permite que un objeto cambie su comportamiento cuando cambia su estado interno, como si cambiara de clase.",
    problema: "Un documento se comporta distinto según esté en Borrador, Revisión o Publicado. Modelarlo con if/elif por todo el código lo vuelve inmantenible cuando aparecen estados nuevos.",
    solucion: "Cada estado es una clase con el mismo conjunto de métodos. El objeto contexto delega en su estado actual, y los propios estados deciden a cuál se transiciona.",
    analogia: "El mismo jugador con tarjeta amarilla juega distinto que sin ella: mismas piernas, otro comportamiento (entra menos fuerte). Y con la roja, su método jugar() lanza excepción: está expulsado.",
    stats: { Frecuencia: 70, Simplicidad: 60, Flexibilidad: 86, Testabilidad: 80, Reusabilidad: 74, Desacoplo: 82 },
    codigo: `class Verde:
    def avanzar(self, s): return "🚗 pasa"
    def siguiente(self, s): s.estado = Amarillo()

class Amarillo:
    def avanzar(self, s): return "🚗 acelera (mal hecho)"
    def siguiente(self, s): s.estado = Rojo()

class Rojo:
    def avanzar(self, s): return "🛑 ¡multa!"
    def siguiente(self, s): s.estado = Verde()

class Semaforo:
    def __init__(self): self.estado = Verde()
    def avanzar(self): return self.estado.avanzar(self)
    def cambiar(self): self.estado.siguiente(self)


s = Semaforo()
print(s.avanzar())   # 🚗 pasa
s.cambiar(); s.cambiar()
print(s.avanzar())   # 🛑 ¡multa!`,
  },
  {
    id: "chain-of-responsibility",
    nombre: "Chain of Resp.",
    categoria: "comportamiento",
    posicion: "MC",
    rating: 74,
    titular: false,
    quimica: ["command", "composite"],
    intencion: "Pasa una petición por una cadena de manejadores; cada uno decide si la procesa o la pasa al siguiente.",
    problema: "Una petición de soporte puede resolverla el bot, el técnico de nivel 1 o el ingeniero senior. Que el cliente conozca esa jerarquía y decida a quién llamar lo acopla a toda la organización.",
    solucion: "Encadenas manejadores; cada uno tiene una referencia al siguiente. La petición entra por el primero y viaja hasta que alguien la atiende (o se agota la cadena).",
    analogia: "La salida de balón: el portero se la da al central, si está presionado la pasa al lateral, si no al pivote… el balón sube por la cadena hasta que alguien puede girarse y jugar.",
    stats: { Frecuencia: 62, Simplicidad: 64, Flexibilidad: 84, Testabilidad: 78, Reusabilidad: 76, Desacoplo: 86 },
    codigo: `class Soporte:
    def __init__(self, nombre, nivel, siguiente=None):
        self.nombre, self.nivel, self.siguiente = nombre, nivel, siguiente

    def atender(self, dificultad):
        if dificultad <= self.nivel:
            return f"{self.nombre} resuelve el ticket ✅"
        if self.siguiente:
            return self.siguiente.atender(dificultad)
        return "Nadie pudo resolverlo 😱"


cadena = Soporte("Bot", 1,
         Soporte("Técnico N1", 5,
         Soporte("Ingeniera senior", 9)))

print(cadena.atender(3))   # Técnico N1 resuelve el ticket ✅
print(cadena.atender(8))   # Ingeniera senior resuelve el ticket ✅`,
  },
  {
    id: "mediator",
    nombre: "Mediator",
    categoria: "comportamiento",
    posicion: "MCO",
    rating: 72,
    titular: false,
    quimica: ["observer", "facade"],
    intencion: "Centraliza la comunicación entre objetos para que no se refieran unos a otros directamente.",
    problema: "En un formulario, el checkbox activa el campo de texto, que valida el botón, que resetea el checkbox… cada componente conoce a los demás y moverlos a otro formulario es imposible.",
    solucion: "Los componentes solo hablan con un mediador ('algo cambió en mí'), y este decide a quién avisar y qué hacer. Los componentes quedan reutilizables y la lógica de coordinación vive en un solo sitio.",
    analogia: "El árbitro del partido: los 22 jugadores no negocian entre sí cada falta — todos se dirigen al árbitro y él coordina qué pasa después. (Torre de control y aviones, si prefieres la clásica.)",
    stats: { Frecuencia: 58, Simplicidad: 58, Flexibilidad: 80, Testabilidad: 74, Reusabilidad: 78, Desacoplo: 90 },
    codigo: `class TorreControl:               # el mediador
    def __init__(self): self.aviones = []

    def registrar(self, avion):
        self.aviones.append(avion); avion.torre = self

    def solicitar_pista(self, quien):
        otros = [a.nombre for a in self.aviones if a is not quien]
        return f"🗼 a {quien.nombre}: pista libre (esperan {otros})"

class Avion:
    def __init__(self, nombre): self.nombre, self.torre = nombre, None
    def aterrizar(self): return self.torre.solicitar_pista(self)


torre = TorreControl()
iberia, vueling = Avion("IB123"), Avion("VY456")
torre.registrar(iberia); torre.registrar(vueling)
print(iberia.aterrizar())  # 🗼 a IB123: pista libre (esperan ['VY456'])`,
  },
  {
    id: "memento",
    nombre: "Memento",
    categoria: "comportamiento",
    posicion: "MC",
    rating: 68,
    titular: false,
    quimica: ["command", "iterator", "prototype"],
    intencion: "Guarda y restaura el estado interno de un objeto sin violar su encapsulación.",
    problema: "Quieres implementar 'deshacer', pero para guardar el estado tendrías que exponer todos los campos privados del objeto — adiós encapsulación.",
    solucion: "El propio objeto crea 'instantáneas' (mementos) opacas de su estado y sabe restaurarse desde ellas. Un 'cuidador' externo guarda los mementos sin poder mirar dentro.",
    analogia: "El punto de guardado del videojuego (o la repetición del VAR): capturas el momento exacto y puedes volver a él, sin que nadie más pueda editar la jugada.",
    stats: { Frecuencia: 50, Simplicidad: 62, Flexibilidad: 70, Testabilidad: 72, Reusabilidad: 66, Desacoplo: 76 },
    codigo: `class Editor:
    def __init__(self): self._texto = ""

    def escribir(self, t): self._texto += t

    def guardar(self):                 # crea el memento
        return {"texto": self._texto}

    def restaurar(self, memento):
        self._texto = memento["texto"]

    def __str__(self): return self._texto


editor, historial = Editor(), []
editor.escribir("Hola ")
historial.append(editor.guardar())     # checkpoint
editor.escribir("¿mundo cruel?")
print(editor)                          # Hola ¿mundo cruel?

editor.restaurar(historial.pop())      # deshacer
print(editor)                          # Hola`,
  },
  {
    id: "visitor",
    nombre: "Visitor",
    categoria: "comportamiento",
    posicion: "MC",
    rating: 66,
    titular: false,
    quimica: ["composite", "iterator"],
    intencion: "Añade operaciones nuevas a una jerarquía de clases sin modificarlas, separando el algoritmo de la estructura.",
    problema: "Tienes un árbol de nodos estables (formas, elementos XML…) y cada mes llega una operación nueva: exportar, validar, medir… Meterlas todas en las clases las contamina y las infla.",
    solucion: "Creas un 'visitante' con un método por cada tipo de nodo. Cada nodo solo implementa aceptar(visitante) y le pasa self. Las operaciones nuevas son visitantes nuevos; las clases originales no se tocan.",
    analogia: "El médico del club en su ronda: visita al portero, al defensa y al delantero, y a cada uno le aplica una revisión distinta según su posición. Mañana viene el fisio (otro visitante) y nadie cambia de vestuario.",
    stats: { Frecuencia: 45, Simplicidad: 42, Flexibilidad: 82, Testabilidad: 74, Reusabilidad: 78, Desacoplo: 72 },
    codigo: `class Circulo:
    radio = 5
    def aceptar(self, v): return v.visitar_circulo(self)

class Cuadrado:
    lado = 4
    def aceptar(self, v): return v.visitar_cuadrado(self)

class CalculadoraArea:            # un visitante
    def visitar_circulo(self, c): return 3.1416 * c.radio ** 2
    def visitar_cuadrado(self, c): return c.lado ** 2

class ExportadorSVG:              # otro visitante, cero cambios en las formas
    def visitar_circulo(self, c): return f'<circle r="{c.radio}"/>'
    def visitar_cuadrado(self, c): return f'<rect width="{c.lado}"/>'


formas = [Circulo(), Cuadrado()]
print([f.aceptar(CalculadoraArea()) for f in formas])  # [78.54, 16]
print([f.aceptar(ExportadorSVG()) for f in formas])`,
  },
  {
    id: "interpreter",
    nombre: "Interpreter",
    categoria: "comportamiento",
    posicion: "MC",
    rating: 60,
    titular: false,
    quimica: ["composite", "visitor"],
    intencion: "Define una gramática para un lenguaje sencillo y un intérprete que evalúa sus expresiones.",
    problema: "Tus usuarios necesitan escribir reglas ('precio > 100 Y stock < 5') sin programar. Parsear eso con ifs y splits ad hoc se convierte en un monstruo inmantenible.",
    solucion: "Modelas cada regla gramatical como una clase con interpretar(contexto). Las expresiones se componen en árbol (¡hola, Composite!) y evaluar es recorrerlo. Solo compensa para lenguajes pequeños.",
    analogia: "El lenguaje de señas del banquillo: 'dos dedos + puño' significa presión alta tras pérdida. El equipo tiene una mini-gramática que todos saben interpretar en tiempo real.",
    stats: { Frecuencia: 30, Simplicidad: 40, Flexibilidad: 75, Testabilidad: 70, Reusabilidad: 65, Desacoplo: 68 },
    codigo: `class Numero:
    def __init__(self, valor): self.valor = valor
    def interpretar(self): return self.valor

class Suma:
    def __init__(self, izq, der): self.izq, self.der = izq, der
    def interpretar(self):
        return self.izq.interpretar() + self.der.interpretar()

class Resta:
    def __init__(self, izq, der): self.izq, self.der = izq, der
    def interpretar(self):
        return self.izq.interpretar() - self.der.interpretar()


# El árbol representa: (10 + 5) - 3
expresion = Resta(Suma(Numero(10), Numero(5)), Numero(3))
print(expresion.interpretar())  # 12`,
  },
];
