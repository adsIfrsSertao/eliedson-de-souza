const vscode = require('vscode');
const { getDatabase, ref, push, get } = require('firebase/database');
const { firebase } = require('./firebaseConfig');
const { getCurrentUser } = require('./firebaseAuth');
const { getCodingStats } = require('./lineCounter');
const { getPomodoroStats } = require('./pomodoroTimer');
const { getCodingTimerStats } = require('./codingTimer');
const { createMarkdownFile, createHtmlFromMarkdown, showHtmlPreview } = require('./markdown');

function saveSession() {
    const currentUser = getCurrentUser();

    if (!currentUser) {
        vscode.window.showErrorMessage("Usuário não está logado!");
        return;
    }

    const userId = currentUser.uid;
    const date = new Date().toISOString();

    const db = getDatabase(firebase);

    const codingStats = getCodingStats() || {};
    const totalLines = Object.values(codingStats).reduce((acc, lines) => acc + lines, 0);

    const mostUsedLanguage = Object.keys(codingStats).reduce((mostUsed, language) => {
        return codingStats[language] > (codingStats[mostUsed] || 0) ? language : mostUsed;
    }, '') || "Nenhuma";

    /**
     * @type {{ totalWorkTime?: number, completedCycles?: number }}
     */
    const pomodoroStats = getPomodoroStats() || {};
    const totalPomodoroTime = pomodoroStats.totalWorkTime || 0;
    const completedCycles = pomodoroStats.completedCycles || 0;

    /**
     * @type {{ totalCodingTime?: number }}
     */
    const codingTimerStats = getCodingTimerStats() || {};
    const totalCodingTime = codingTimerStats.totalCodingTime || 0;

    const sessionData = {
        date: date,
        codingStats: codingStats,
        totalLines: totalLines,
        mostUsedLanguage: mostUsedLanguage,
        totalCodingTime: totalCodingTime,
        totalPomodoroTime: totalPomodoroTime,
        completedPomodoroCycles: completedCycles,
    };

    push(ref(db, `users/${userId}/sessions`), sessionData)
        .then(() => {
            vscode.window.showInformationMessage("Sessão salva com sucesso no banco de dados!");
        })
        .catch((error) => {
            vscode.window.showErrorMessage(`Erro ao salvar dados no banco: ${error.message}`);
        });
}

function getSessionData() {
    const currentUser = getCurrentUser();

    if (!currentUser) {
        vscode.window.showErrorMessage("Usuário não está logado!");
        return Promise.reject("Usuário não está logado.");
    }

    const userId = currentUser.uid;

    const db = getDatabase(firebase);
    const userSessionsRef = ref(db, `users/${userId}/sessions`);

    return get(userSessionsRef)
        .then(snapshot => {
            if (snapshot.exists()) {
                // Converte os dados em um formato utilizável
                const rawData = snapshot.val();
                const formattedData = Object.entries(rawData).reduce((acc, [key, value]) => {
                    acc[value.date] = {
                        totalLines: value.totalLines || 0,
                        mostUsedLanguage: value.mostUsedLanguage || "Nenhuma",
                        totalCodingTime: value.totalCodingTime || 0,
                        totalPomodoroTime: value.totalPomodoroTime || 0,
                        completedPomodoroCycles: value.completedPomodoroCycles || 0,
                    };
                    return acc;
                }, {});
                return formattedData;
            } else {
                vscode.window.showWarningMessage("Nenhuma sessão encontrada.");
                return {};
            }
        })
        .catch(error => {
            vscode.window.showErrorMessage(`Erro ao buscar dados: ${error.message}`);
            return Promise.reject(error);
        });
}

function viewStats() {
    vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: "Carregando estatísticas...",
            cancellable: false,
        },
        async () => {
            try {
                const data = await getSessionData();

                if (Object.keys(data).length === 0) {
                    vscode.window.showWarningMessage("Nenhuma estatística encontrada.");
                    return;
                }

                const markdownFilePath = createMarkdownFile(data);
                const htmlContent = createHtmlFromMarkdown(markdownFilePath);
                showHtmlPreview(htmlContent);
            } catch (error) {
                vscode.window.showErrorMessage(`Erro ao carregar estatísticas: ${error.message}`);
            }
        }
    );
}

module.exports = { saveSession, getSessionData, viewStats };
