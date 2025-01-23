const vscode = require('vscode');

/**
 * Restaura ou reseta as estatísticas semanais com base no tempo.
 * @param {vscode.ExtensionContext} context - Contexto da extensão.
 */
function resetWeeklyStats(context) {
    const today = new Date();
    const lastReset = context.globalState.get('lastReset') || 0;
    const oneWeek = 7 * 24 * 60 * 60 * 1000; // Uma semana em milissegundos

    if (today.getTime() - lastReset > oneWeek) {
        context.globalState.update('weeklyStats', {}); // Reseta as estatísticas
        context.globalState.update('lastReset', today.getTime()); // Atualiza a data do último reset
    }
}

/**
 * Inicia o rastreamento de progresso semanal de codificação.
 * @param {vscode.ExtensionContext} context - Contexto da extensão.
 */
function trackCodingProgress(context) {
    resetWeeklyStats(context); // Reseta as estatísticas se necessário

    // Recupera ou inicializa as estatísticas semanais
    let weeklyStats = context.globalState.get('weeklyStats') || {};

    // Monitora alterações nos documentos abertos
    vscode.workspace.onDidChangeTextDocument((event) => {
        const { document } = event;
        const fileName = document.fileName;

        // Atualiza o total de linhas do arquivo
        if (!weeklyStats[fileName]) {
            weeklyStats[fileName] = { totalLines: 0 };
        }
        weeklyStats[fileName].totalLines = document.lineCount;

        // Salva as estatísticas atualizadas
        context.globalState.update('weeklyStats', weeklyStats);

        // Log opcional para debug
        console.log('Estatísticas semanais atualizadas:', weeklyStats);
    });

    // Verifica o progresso periodicamente
    setInterval(() => {
        const updatedWeeklyStats = context.globalState.get('weeklyStats');
        checkProgressAndNotify(context, updatedWeeklyStats);
    }, 60000); // Verifica a cada minuto
}

/**
 * Verifica o progresso semanal e notifica o usuário com base em sua meta.
 * @param {vscode.ExtensionContext} context - Contexto da extensão.
 * @param {Object} weeklyStats - Estatísticas semanais agregadas.
 */
function checkProgressAndNotify(context, weeklyStats) {
    const goal = context.globalState.get('codingGoal'); // Recupera a meta
    if (!goal) {
        return; // Não faz nada se nenhuma meta estiver definida
    }

    // Soma o total de linhas de código escritas na semana
    const totalLinesThisWeek = Object.values(weeklyStats).reduce((sum, stats) => sum + (stats.totalLines || 0), 0);

    // Notificações com base no progresso
    if (totalLinesThisWeek >= goal) {
        vscode.window.showInformationMessage(
            `Parabéns! Você alcançou sua meta de ${goal} linhas de código nesta semana! 🎉`
        );
    } else {
        const remaining = goal - totalLinesThisWeek;
        vscode.window.showWarningMessage(
            `Você está a ${remaining} linhas de código da sua meta semanal. Continue codando! 💻`
        );
    }
}

module.exports = {
    trackCodingProgress,
    checkProgressAndNotify,
};
