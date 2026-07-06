const login = document.getElementById("login");
const panel = document.getElementById("panel");

const usuario = document.getElementById("usuario");
const password = document.getElementById("password");
const mensajeError = document.getElementById("mensajeError");

const btnPower = document.getElementById("btnPower");
const luzPower = document.getElementById("luzPower");

const btnAbrir = document.getElementById("btnAbrir");
const luzAbrir = document.getElementById("luzAbrir");

const btnReiniciar = document.getElementById("btnReiniciar");
const luzReiniciar = document.getElementById("luzReiniciar");

const barraCapacidad = document.getElementById("barraCapacidad");
const alerta = document.getElementById("alerta");

const luzMQTT = document.getElementById("luzMQTT");
const textoMQTT = document.getElementById("textoMQTT");

// CONFIGURACION HIVEMQ

const MQTT_HOST = "d9c74a204f0c4e0db7ac3f4fb75f26aa.s1.eu.hivemq.cloud";
const MQTT_PORT = 8884;
const MQTT_PATH = "/mqtt";

const MQTT_USER = "Rossebel";
const MQTT_PASSWORD = "Arbolpt2003@";

const TOPIC_COMANDO = "tacho/comando";
const TOPIC_DATOS = "tacho/telemetria";
const TOPIC_NIVEL = "tacho/nivel";

let mqttClient = null;
let tapaAbierta = false;

// LOGIN

function iniciarSesion() {
    if (usuario.value === "admin" && password.value === "123456") {
        login.classList.add("oculto");
        panel.classList.remove("oculto");
        mensajeError.textContent = "";

        conectarMQTT();
    } else {
        mensajeError.textContent = "Usuario o contraseña incorrectos";
    }
}

function cerrarSesion() {
    panel.classList.add("oculto");
    login.classList.remove("oculto");

    usuario.value = "";
    password.value = "";
    mensajeError.textContent = "";
}

// LUCES

function ponerVerde(luz) {
    luz.classList.remove("roja");
    luz.classList.add("verde");
}

function ponerRojo(luz) {
    luz.classList.remove("verde");
    luz.classList.add("roja");
}


// MQTT

function conectarMQTT() {
    if (mqttClient) return;

    const url = `wss://${MQTT_HOST}:${MQTT_PORT}${MQTT_PATH}`;

    mqttClient = mqtt.connect(url, {
        username: MQTT_USER,
        password: MQTT_PASSWORD,
        clientId: "web-tacho-" + Math.random().toString(16).substring(2, 10),
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 3000
    });

    mqttClient.on("connect", function () {
        ponerVerde(luzMQTT);
        textoMQTT.textContent = "Conectado a HiveMQ";

        mqttClient.subscribe(TOPIC_DATOS);
    });

    mqttClient.on("reconnect", function () {
        textoMQTT.textContent = "Reconectando a HiveMQ...";
    });

    mqttClient.on("error", function (error) {
        ponerRojo(luzMQTT);
        textoMQTT.textContent = "Error de conexión MQTT";
        console.error(error);
    });

    mqttClient.on("offline", function () {
        ponerRojo(luzMQTT);
        textoMQTT.textContent = "Desconectado de HiveMQ";
    });

    mqttClient.on("message", function (topic, message) {
        if (topic === TOPIC_DATOS) {
            const datos = JSON.parse(message.toString());
            actualizarPanel(datos);
        }
    });
}

function enviarComando(comando) {
    if (mqttClient && mqttClient.connected) {
        mqttClient.publish(TOPIC_COMANDO, comando);
        console.log("Comando enviado:", comando);
    } else {
        alert("No hay conexión con HiveMQ");
    }
}


// ACTUALIZAR PANEL

function actualizarPanel(datos) {
    const capacidad = datos.llenado;
    const encendido = datos.automatico;
    tapaAbierta = datos.tapa_abierta === true;

    barraCapacidad.style.width = capacidad + "%";
    barraCapacidad.textContent = capacidad + "%";

    // ALERTAS DE CAPACIDAD

    if (capacidad >= 85) {

        alerta.classList.remove("oculto");
        alerta.innerHTML =
        "🚫 <strong>Basurero lleno</strong><br>Por favor utilice otro basurero.";
        alerta.style.background = "rgba(220,38,38,0.25)";
        alerta.style.borderColor = "#ef4444";
        alerta.style.color = "#fecaca";
    }
    else if (capacidad >= 80) {

        alerta.classList.remove("oculto");

        alerta.innerHTML =
        "⚠️ <strong>Advertencia</strong><br>El basurero está por llenarse.";

        alerta.style.background = "rgba(234,179,8,0.25)";
        alerta.style.borderColor = "#eab308";
        alerta.style.color = "#fde68a";
    }
    else {

        alerta.classList.add("oculto");
    }

    if (encendido) {
        ponerVerde(luzPower);
        btnPower.checked = true;
    } else {
        ponerRojo(luzPower);
        btnPower.checked = false;
    }

    if (tapaAbierta) {
        ponerVerde(luzAbrir);
    } else {
        ponerRojo(luzAbrir);
    }
}


// BOTON ENCENDER / APAGAR

btnPower.addEventListener("change", function () {
    if (btnPower.checked) {
        enviarComando("auto_on");
    } else {
        enviarComando("auto_off");
    }
});

// ABRIR / CERRAR

let contadorAbrir = 0;
let tiempoAbrir = null;

btnAbrir.addEventListener("click", function () {
    contadorAbrir++;

    clearTimeout(tiempoAbrir);

    tiempoAbrir = setTimeout(function () {
        contadorAbrir = 0;
    }, 2000);

    if (contadorAbrir >= 3) {
        contadorAbrir = 0;

        if (tapaAbierta) {
            enviarComando("CERRAR");
        } else {
            enviarComando("ABRIR");
        }
    }
});

// REINICIAR

let contadorReiniciar = 0;
let tiempoReiniciar = null;

btnReiniciar.addEventListener("click", function () {
    contadorReiniciar++;

    clearTimeout(tiempoReiniciar);

    tiempoReiniciar = setTimeout(function () {
        contadorReiniciar = 0;
    }, 2000);

    if (contadorReiniciar >= 3) {
        contadorReiniciar = 0;

        enviarComando("RESET");

        ponerVerde(luzReiniciar);

        setTimeout(function () {
            ponerRojo(luzReiniciar);
        }, 2000);
    }
});