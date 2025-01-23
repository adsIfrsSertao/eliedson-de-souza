const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const marked = require('marked');
const moment = require('moment'); // Manipulação de datas
const { checkProgressAndNotify } = require('./weeklyGoals'); // Importa as metas semanais

// Função para criar o arquivo Markdown com as estatísticas
function createMarkdownFile(data) {
    const markdownContent = generateMarkdown(data);
    const filePath = path.join(__dirname, 'statistics.md');
    fs.writeFileSync(filePath, markdownContent);
    return filePath;
}

// Geração do conteúdo Markdown com base nos dados
function generateMarkdown(data) {
    let markdown = `# Estatísticas de Codificação\n\n`;

    const dailyStats = {};
    const weeklyStats = {};
    const monthlyStats = {};

    // Organiza os dados em categorias
    Object.entries(data).forEach(([key, value]) => {
        const date = moment(key); // Interpreta datas ISO corretamente
        if (!date.isValid()) return; // Ignora datas inválidas

        const day = date.format('DD/MM/YYYY');
        const week = date.startOf('isoWeek').format('[Semana] WW');
        const month = date.format('MMMM'); // Nome do mês

        dailyStats[day] = dailyStats[day] || [];
        weeklyStats[week] = weeklyStats[week] || [];
        monthlyStats[month] = monthlyStats[month] || [];

        dailyStats[day].push(value);
        weeklyStats[week].push(value);
        monthlyStats[month].push(value);
    });

    // Função para calcular estatísticas acumuladas e linguagem mais usada
    const calculateAggregatedStats = (stats) => {
        const aggregated = {};
        Object.entries(stats).forEach(([key, values]) => {
            const totalLines = values.reduce((sum, session) => sum + (session.totalLines || 0), 0);
            const totalCodingTime = values.reduce((sum, session) => sum + (session.totalCodingTime || 0), 0);
            const totalPomodoroTime = values.reduce((sum, session) => sum + (session.totalPomodoroTime || 0), 0);
            const completedPomodoroCycles = values.reduce((sum, session) => sum + (session.completedPomodoroCycles || 0), 0);

            // Contagem de linhas por linguagem
            const languageLines = {};
            values.forEach(session => {
                if (session.codingStats) {
                    Object.entries(session.codingStats).forEach(([language, lines]) => {
                        languageLines[language] = (languageLines[language] || 0) + lines;
                    });
                }
            });

            // Determinar a linguagem mais utilizada
            const mostUsedLanguage = Object.entries(languageLines).reduce(
                (max, [language, lines]) => (lines > max.lines ? { language, lines } : max),
                { language: 'Nenhuma', lines: 0 }
            ).language;

            aggregated[key] = {
                totalLines,
                totalCodingTime,
                totalPomodoroTime,
                completedPomodoroCycles,
                mostUsedLanguage,
            };
        });
        return aggregated;
    };

    const aggregatedDaily = calculateAggregatedStats(dailyStats);
    const aggregatedWeekly = calculateAggregatedStats(weeklyStats);
    const aggregatedMonthly = calculateAggregatedStats(monthlyStats);

    // Calcula os totais gerais de todas as sessões
    const totalStats = calculateAggregatedStats({ Total: Object.values(data) });
    const totalStatsData = totalStats['Total'] || {
        totalLines: 0,
        totalCodingTime: 0,
        totalPomodoroTime: 0,
        completedPomodoroCycles: 0,
        mostUsedLanguage: 'Nenhuma',
    };

    // Obtem os dados de "Hoje"
    const today = moment().format('DD/MM/YYYY');
    const todayStats = aggregatedDaily[today] || {
        totalLines: 0,
        totalCodingTime: 0,
        totalPomodoroTime: 0,
        completedPomodoroCycles: 0,
        mostUsedLanguage: 'Nenhuma',
    };

    // Obtem o nome do último mês
    const lastMonth = moment().subtract(1, 'month').format('MMMM');
    const lastMonthStats = aggregatedMonthly[lastMonth] || {
        totalLines: 0,
        totalCodingTime: 0,
        totalPomodoroTime: 0,
        completedPomodoroCycles: 0,
        mostUsedLanguage: 'Nenhuma',
    };

    // Adiciona as seções ao markdown
    markdown += addTodaySection('Hoje', todayStats); // Seção para "Hoje"
    markdown += addStatsSection('Última Semana', aggregatedWeekly, false); // Não exibe a data
    markdown += addMonthlySection('Último Mês', lastMonth, lastMonthStats);
    markdown += addTotalSection('Total', totalStatsData); // Adiciona a seção "Total"

    return markdown;
}

function addTodaySection(title, stats) {
    let section = `## ${title}\n\n`;

    section += `- **Total de Linhas de Código**: ${stats.totalLines || 0}\n`;
    section += `- **Tempo de Codificação**: ${stats.totalCodingTime || 0} minutos\n`;
    section += `- **Tempo de Pomodoro**: ${stats.totalPomodoroTime || 0} minutos\n`;
    section += `- **Ciclos de Pomodoro Completos**: ${stats.completedPomodoroCycles || 0}\n\n`;
    section += `- **Linguagem Mais Utilizada**: ${stats.mostUsedLanguage || 'Nenhuma'}\n\n`;
    return section;
}

function addStatsSection(title, stats, showDate) {
    let section = `## ${title}\n\n`;

    Object.entries(stats).forEach(([key, value]) => {
        if (showDate) {
            section += `### ${key}\n`;
        }
        section += `- **Total de Linhas de Código**: ${value.totalLines || 0}\n`;
        section += `- **Tempo de Codificação**: ${value.totalCodingTime || 0} minutos\n`;
        section += `- **Tempo de Pomodoro**: ${value.totalPomodoroTime || 0} minutos\n`;
        section += `- **Ciclos de Pomodoro Completos**: ${value.completedPomodoroCycles || 0}\n\n`;
        section += `- **Linguagem Mais Utilizada**: ${value.mostUsedLanguage || 'Nenhuma'}\n\n`;
    });

    return section;
}

function addMonthlySection(title, monthName, stats) {
    let section = `## ${title}: ${monthName}\n\n`;

    section += `- **Total de Linhas de Código**: ${stats.totalLines || 0}\n`;
    section += `- **Tempo de Codificação**: ${stats.totalCodingTime || 0} minutos\n`;
    section += `- **Tempo de Pomodoro**: ${stats.totalPomodoroTime || 0} minutos\n`;
    section += `- **Ciclos de Pomodoro Completos**: ${stats.completedPomodoroCycles || 0}\n\n`;
    section += `- **Linguagem Mais Utilizada**: ${stats.mostUsedLanguage || 'Nenhuma'}\n\n`;

    return section;
}

function addTotalSection(title, stats) {
    let section = `## ${title}\n\n`;

    section += `- **Total de Linhas de Código**: ${stats.totalLines || 0}\n`;
    section += `- **Tempo de Codificação**: ${stats.totalCodingTime || 0} minutos\n`;
    section += `- **Tempo de Pomodoro**: ${stats.totalPomodoroTime || 0} minutos\n`;
    section += `- **Ciclos de Pomodoro Completos**: ${stats.completedPomodoroCycles || 0}\n\n`;
    section += `- **Linguagem Mais Utilizada**: ${stats.mostUsedLanguage || 'Nenhuma'}\n\n`;

    return section;
}

function createHtmlFromMarkdown(filePath) {
    const markdownContent = fs.readFileSync(filePath, 'utf-8');
    const htmlContent = marked.parse(markdownContent);

    // Estilos para o HTML
    const styledHtml = `
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    background-color: #f4f4f9;
                    color: #333;
                    padding: 20px;
                }
                h1, h2 {
                    color: #444;
                }
                h3 {
                    margin-bottom: 5px;
                    color: #555;
                }
                ul {
                    padding: 0;
                    list-style: none;
                }
                ul li {
                    margin: 5px 0;
                    padding: 8px;
                    background: #fff;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                }
                .section {
                    margin-bottom: 20px;
                }
            </style>
        </head>
        <body>
            ${htmlContent}
        </body>
        </html>
    `;

    return styledHtml;
}

function showHtmlPreview(htmlContent) {
    const panel = vscode.window.createWebviewPanel(
        'codingStats',
        'Estatísticas de Codificação',
        vscode.ViewColumn.One,
        {}
    );

    panel.webview.html = htmlContent;
}

module.exports = {
    createMarkdownFile,
    generateMarkdown,
    createHtmlFromMarkdown,
    showHtmlPreview,
    checkProgressAndNotify
};
