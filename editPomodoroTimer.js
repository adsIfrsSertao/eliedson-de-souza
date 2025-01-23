const vscode = require('vscode');

// Inicializa as configurações padrão do Pomodoro
let pomodoroSettings = {
    workDuration: 25 * 60, // 25 minutos
    shortBreak: 5 * 60,    // 5 minutos
    longBreak: 20 * 60,    // 20 minutos
    pomodoroCycles: 4      // 4 ciclos
};

/**
 * Carrega as configurações do Pomodoro do globalState.
 * @param {vscode.ExtensionContext} context - Contexto da extensão.
 */
function loadPomodoroSettings(context) {
    const savedSettings = context.globalState.get('pomodoroSettings');
    if (savedSettings) {
        pomodoroSettings = savedSettings;
    }
}

/**
 * Salva as configurações do Pomodoro no globalState.
 * @param {vscode.ExtensionContext} context - Contexto da extensão.
 */
function savePomodoroSettings(context) {
    context.globalState.update('pomodoroSettings', pomodoroSettings);
}

/**
 * Permite ao usuário editar as configurações do Pomodoro.
 * @param {vscode.ExtensionContext} context - Contexto da extensão.
 */
function editPomodoroSettings(context) {
    vscode.window.showInputBox({ prompt: "Tempo de trabalho (minutos):", value: (pomodoroSettings.workDuration / 60).toString() })
        .then((workInput) => {
            if (!workInput) return;
            pomodoroSettings.workDuration = parseInt(workInput) * 60;

            vscode.window.showInputBox({ prompt: "Tempo de pausa curta (minutos):", value: (pomodoroSettings.shortBreak / 60).toString() })
                .then((shortBreakInput) => {
                    if (!shortBreakInput) return;
                    pomodoroSettings.shortBreak = parseInt(shortBreakInput) * 60;

                    vscode.window.showInputBox({ prompt: "Tempo de pausa longa (minutos):", value: (pomodoroSettings.longBreak / 60).toString() })
                        .then((longBreakInput) => {
                            if (!longBreakInput) return;
                            pomodoroSettings.longBreak = parseInt(longBreakInput) * 60;

                            vscode.window.showInputBox({ prompt: "Ciclos para pausa longa:", value: pomodoroSettings.pomodoroCycles.toString() })
                                .then((cyclesInput) => {
                                    if (!cyclesInput) return;
                                    pomodoroSettings.pomodoroCycles = parseInt(cyclesInput);

                                    // Salva as configurações no globalState
                                    savePomodoroSettings(context);

                                    vscode.window.showInformationMessage("Configurações do Pomodoro atualizadas!");
                                });
                        });
                });
        });
}

/**
 * Retorna as configurações do Pomodoro.
 * @returns {Object} - Configurações atuais do Pomodoro.
 */
function getPomodoroSettings() {
    return pomodoroSettings;
}

module.exports = {
    loadPomodoroSettings,
    savePomodoroSettings,
    editPomodoroSettings,
    getPomodoroSettings
};
