const vscode = require('vscode');
const { getPomodoroSettings } = require('./editPomodoroTimer');

let pomodoroTimer = null; // Timer específico para o Pomodoro
let currentSession = 0; // Contador de sessões de trabalho completadas
let isBreak = false; // Flag para saber se está em pausa ou trabalho
let totalWorkTime = 0; // Tempo total de trabalho em segundos
let totalBreakTime = 0; // Tempo total de pausas em segundos
let completedCycles = 0; // Total de ciclos completados
let statusBarItem = null; // Item da barra de status

function loadSettings() {
    const settings = getPomodoroSettings();
    return {
        workDuration: settings.workDuration,
        shortBreak: settings.shortBreak,
        longBreak: settings.longBreak,
        pomodoroCycles: settings.pomodoroCycles,
    };
}

function startPomodoro() {
    if (pomodoroTimer) return; // Evita múltiplos timers

    if (!statusBarItem) {
        statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        statusBarItem.show();
    }

    const { workDuration } = loadSettings(); // Carrega as configurações

    currentSession = 0; // Reseta o contador
    vscode.window.showInformationMessage(`Pomodoro iniciado! Tempo de foco: ${workDuration / 60} minutos.`);
    startWorkSession();
}

function startWorkSession() {
    const { workDuration, pomodoroCycles } = loadSettings();
    let remainingTime = workDuration;
    isBreak = false;

    vscode.window.showInformationMessage("Sessão de trabalho iniciada. Concentre-se!");

    pomodoroTimer = setInterval(() => {
        remainingTime--;
        updateStatusBar(remainingTime, "Trabalhando");

        totalWorkTime++; // Incrementa o tempo total de trabalho

        if (remainingTime <= 0) {
            clearInterval(pomodoroTimer);
            pomodoroTimer = null;

            currentSession++;
            completedCycles++; // Incrementa os ciclos completados
            vscode.window.showInformationMessage("Sessão de trabalho concluída! Hora de uma pausa.");

            // Decide se vai para pausa curta ou longa
            if (currentSession % pomodoroCycles === 0) {
                startLongBreak();
            } else {
                startShortBreak();
            }
        }
    }, 1000);
}

function startShortBreak() {
    const { shortBreak } = loadSettings();
    let remainingTime = shortBreak;
    isBreak = true;

    vscode.window.showInformationMessage(`Pausa curta: ${shortBreak / 60} minutos. Relaxe!`);

    pomodoroTimer = setInterval(() => {
        remainingTime--;
        updateStatusBar(remainingTime, "Pausa curta");

        totalBreakTime++; // Incrementa o tempo total de pausas

        if (remainingTime <= 0) {
            clearInterval(pomodoroTimer);
            pomodoroTimer = null;

            vscode.window.showInformationMessage("Pausa curta finalizada! Vamos voltar ao trabalho.");
            startWorkSession();
        }
    }, 1000);
}

function startLongBreak() {
    const { longBreak } = loadSettings();
    let remainingTime = longBreak;
    isBreak = true;

    vscode.window.showInformationMessage(`Pausa longa: ${longBreak / 60} minutos. Aproveite para descansar!`);

    pomodoroTimer = setInterval(() => {
        remainingTime--;
        updateStatusBar(remainingTime, "Pausa longa");

        totalBreakTime++; // Incrementa o tempo total de pausas

        if (remainingTime <= 0) {
            clearInterval(pomodoroTimer);
            pomodoroTimer = null;

            vscode.window.showInformationMessage("Pausa longa finalizada! Recomeçando o ciclo Pomodoro.");
            currentSession = 0; // Reseta o ciclo
            startWorkSession();
        }
    }, 1000);
}

function stopPomodoro() {
    if (pomodoroTimer) {
        clearInterval(pomodoroTimer);
        pomodoroTimer = null;

        if (statusBarItem) {
            statusBarItem.dispose();
            statusBarItem = null;
        }

        vscode.window.showInformationMessage("Pomodoro parado. Até a próxima sessão!");
    }
}

function updateStatusBar(remainingTime, status) {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    statusBarItem.text = `🍅 ${status}: ${minutes}m ${seconds}s`;
}

// Função para obter estatísticas do Pomodoro
function getPomodoroStats() {
    return {
        totalWorkTime, // Tempo total de trabalho em segundos
        totalBreakTime, // Tempo total de pausas em segundos
        completedCycles, // Número de ciclos completados
    };
}

module.exports = {
    startPomodoro,
    stopPomodoro,
    getPomodoroStats,
};
