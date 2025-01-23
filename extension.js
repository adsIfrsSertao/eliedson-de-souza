const vscode = require('vscode');
const { countLines } = require('./lineCounter');
const { startCodingTimer, resetInactivityTimer, resetCodingTimer, stopCodingTimer } = require('./codingTimer');
const { startPomodoro, stopPomodoro } = require('./pomodoroTimer');
const { register, login, logout } = require('./firebaseAuth');
const { saveSession, viewStats } = require('./firebaseData');
const { editPomodoroSettings, loadPomodoroSettings } = require('./editPomodoroTimer'); // Adiciona a nova importação
const { setCodingGoal } = require('./setCodingGoal');
const { trackCodingProgress } = require('./weeklyGoals');


function activate(context) {
    console.log('Congratulations, your extension "kata-kid" is now active!');
    loadPomodoroSettings(context);
    // Comando para registrar usuário
    let registrarCommand = vscode.commands.registerCommand('extension.register', () => {
        register();
    });
    context.subscriptions.push(registrarCommand);

    // Comando para login
    let loginCommand = vscode.commands.registerCommand('extension.login', () => {
        login();
    });
    context.subscriptions.push(loginCommand);

    // Comando para logout
    let logoutCommand = vscode.commands.registerCommand('extension.logout', () => {
        logout();
    });
    context.subscriptions.push(logoutCommand);

    // Comando para salvar sessão
    let saveSessionCommand = vscode.commands.registerCommand('extension.saveSession', () => {
        saveSession(); 
    });
    context.subscriptions.push(saveSessionCommand);

    // Comando para contar linhas
    let countLinesCommand = vscode.commands.registerCommand('extension.countLines', () => {
        const editor = vscode.window.activeTextEditor;
        try {
            const result = countLines(editor);
            vscode.window.showInformationMessage(
                `Linguagem: ${result.language}\nLinhas neste arquivo: ${result.currentFileLines}\nTotal acumulado: ${result.totalLines}`
            );
        } catch (error) {
            vscode.window.showErrorMessage(error.message);
        }
    });    
    context.subscriptions.push(countLinesCommand);

    // Comando para iniciar o cronômetro manualmente
    let startTimerCommand = vscode.commands.registerCommand('extension.startCodingTimer', () => {
        startCodingTimer();
    });
    context.subscriptions.push(startTimerCommand);

    // Comando para reiniciar o cronômetro manualmente
    let resetTimerCommand = vscode.commands.registerCommand('extension.resetCodingTimer', () => {
        resetCodingTimer();
    });
    context.subscriptions.push(resetTimerCommand);

    // Listener para redefinir o tempo de inatividade ao editar
    vscode.workspace.onDidChangeTextDocument(() => {
        startCodingTimer();
        resetInactivityTimer();
    });

    // Comando para parar o cronômetro manualmente
    let stopTimerCommand = vscode.commands.registerCommand('extension.stopTimer', () => {
        stopCodingTimer();
    });
    context.subscriptions.push(stopTimerCommand);

    // Comando para iniciar o método Pomodoro
    let startPomodoroCommand = vscode.commands.registerCommand('extension.startPomodoro', () => {
        startPomodoro(); // Chama a função importada
    });
    context.subscriptions.push(startPomodoroCommand);

    // Comando para parar o método Pomodoro
    let stopPomodoroCommand = vscode.commands.registerCommand('extension.stopPomodoro', () => {
        stopPomodoro(); // Chama a função importada
    });
    context.subscriptions.push(stopPomodoroCommand);

    // Comando para editar configurações do Pomodoro
    let editSettingsCommand = vscode.commands.registerCommand('extension.editPomodoroSettings', () => {
        editPomodoroSettings(context);
    });
    context.subscriptions.push(editSettingsCommand);

    // Comando para ver as estatísticas
    let disposable = vscode.commands.registerCommand('extension.viewStats', () => {
        viewStats();
    });
    context.subscriptions.push(disposable);

     // Comando para definir metas
     context.subscriptions.push(
        vscode.commands.registerCommand('extension.setCodingGoal', () => setCodingGoal(context))
    );

    // Inicia o rastreamento de progresso semanal
    trackCodingProgress(context);
}

function deactivate() {
    stopCodingTimer();
    stopPomodoro();
}

module.exports = {
    activate,
    deactivate,
};
