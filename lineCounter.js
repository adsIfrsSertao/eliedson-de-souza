const fs = require('fs');
const path = require('path');

const statsFile = path.join(__dirname, 'codingStats.json');

// Função para carregar estatísticas existentes ou inicializar um objeto vazio
function loadStats() {
    if (fs.existsSync(statsFile)) {
        const data = fs.readFileSync(statsFile, 'utf8');
        try {
            return JSON.parse(data);
        } catch (error) {
            console.error("Erro ao ler o arquivo de estatísticas. Reinicializando.", error);
            return {};
        }
    }
    return {};
}

// Função para salvar estatísticas atualizadas
function saveStats(stats) {
    fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));
}

// Função para contar linhas no arquivo atual e atualizar o acumulado
function countLines(editor) {
    if (editor) {
        const document = editor.document;
        const language = document.languageId;
        let lineCount = 0;

        // Contar apenas linhas não vazias
        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i).text;
            if (line.trim() !== '') {
                lineCount++;
            }
        }

        // Carregar estatísticas existentes
        const stats = loadStats();

        // Atualizar o contador de linhas para a linguagem atual
        if (stats[language]) {
            stats[language] += lineCount;
        } else {
            stats[language] = lineCount;
        }

        // Salvar estatísticas atualizadas
        saveStats(stats);

        // Retornar o resumo das estatísticas
        return {
            language,
            currentFileLines: lineCount,
            totalLines: stats[language],
        };
    } else {
        throw new Error("Nenhum editor ativo encontrado.");
    }
}

// Função para obter todas as estatísticas de linhas por linguagem
function getCodingStats() {
    return loadStats(); // Retorna o conteúdo do arquivo codingStats.json
}

module.exports = { countLines, getCodingStats };
