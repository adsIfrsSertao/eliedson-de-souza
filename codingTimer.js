const vscode = require('vscode');

let codingTime = 0; // Tempo total codando, em segundos
let inactivityTime = 0; // Tempo de inatividade, em segundos
let timer = null; // Referência ao cronômetro
const INACTIVITY_LIMIT = 120; // 2 minutos de inatividade
const BREAK_REMINDER_INTERVAL = 45 * 60; // 45 minutos, em segundos
let statusBarItem = null; // Item da barra de status

function startCodingTimer() {
    if (timer) return; // Não inicia outro cronômetro se já estiver rodando

    if (!statusBarItem) {
        statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        statusBarItem.show();
    }

    vscode.window.showInformationMessage("Cronômetro iniciado!");

    timer = setInterval(() => {
        codingTime++;
        inactivityTime++;
        statusBarItem.text = formatTime(codingTime);

        if (inactivityTime >= INACTIVITY_LIMIT) {
            stopCodingTimer();
            vscode.window.showWarningMessage("Cronômetro pausado devido à inatividade.");
        }
        
        // Verifica se é hora de lembrar o usuário de fazer uma pausa
        if (codingTime > 0 && codingTime % BREAK_REMINDER_INTERVAL === 0) {
            vscode.window.showInformationMessage(
                "Por que não fazer uma pausa né! Tome um café e relaxe por alguns minutos. 🍃☕"
            );
        }
    }, 1000); // Atualização a cada 1 segundo
}

function resetInactivityTimer() {
    inactivityTime = 0; // Reseta apenas o tempo de inatividade
}

function resetCodingTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }

    codingTime = 0; // Zera o tempo total de codificação
    inactivityTime = 0; // Zera o tempo de inatividade

    if (!statusBarItem) {
        statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        statusBarItem.show();
    }

    statusBarItem.text = formatTime(codingTime); // Atualiza a exibição na barra de status

    vscode.window.showInformationMessage("Cronômetro reiniciado!");
    startCodingTimer(); // Reinicia o cronômetro
}

function stopCodingTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
        if (statusBarItem) {
            statusBarItem.dispose(); // Remove o item da barra de status
            statusBarItem = null;
        }
        vscode.window.showInformationMessage(
            `Cronômetro parado. Tempo total: ${formatTime(codingTime, true)}`
        );
    }
}

function formatTime(totalSeconds, verbose = false) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (verbose) {
        return `${hours > 0 ? `${hours}h ` : ""}${minutes}m ${seconds}s`;
    } else {
        return `⏳ ${hours > 0 ? `${hours}h ` : ""}${minutes}m ${seconds}s`;
    }
}

// Função para obter estatísticas do cronômetro de codificação
function getCodingTimerStats() {
    return {
        totalCodingTime: codingTime, // Tempo total de codificação em segundos
        totalInactivityTime: inactivityTime, // Tempo total de inatividade em segundos
        isTimerRunning: !!timer, // Estado do cronômetro (rodando ou parado)
    };
}

module.exports = {
    startCodingTimer,
    resetInactivityTimer,
    resetCodingTimer,
    stopCodingTimer,
    getCodingTimerStats, // Exporta a nova função
};
