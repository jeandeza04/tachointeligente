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

function iniciarSesion() {
    if (usuario.value === "admin" && password.value === "123456") {
        login.classList.add("oculto");
        panel.classList.remove("oculto");
        mensajeError.textContent = "";
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

function ponerVerde(luz) {
    luz.classList.remove("roja");
    luz.classList.add("verde");
}

function ponerRojo(luz) {
    luz.classList.remove("verde");
    luz.classList.add("roja");
}

function alternarLuz(luz) {
    if (luz.classList.contains("roja")) {
        ponerVerde(luz);
    } else {
        ponerRojo(luz);
    }
}

/* Encender / Apagar */
btnPower.addEventListener("change", function () {
    if (btnPower.checked) {
        ponerVerde(luzPower);
    } else {
        ponerRojo(luzPower);
    }
});

/* Abrir tapa: cada 3 clics alterna rojo/verde */
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
        alternarLuz(luzAbrir);
    }
});

/* Reiniciar: 3 clics -> verde por 2 segundos -> rojo automáticamente */

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

        ponerVerde(luzReiniciar);

        setTimeout(function () {
            ponerRojo(luzReiniciar);
        }, 2000);

    }

});