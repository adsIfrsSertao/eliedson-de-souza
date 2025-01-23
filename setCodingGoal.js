const vscode = require('vscode');

/**
 * Permite que o usuário defina uma meta de codificação semanal.
 * @param {vscode.ExtensionContext} context - Contexto da extensão.
 */
async function setCodingGoal(context) {
    try {
        // Solicita ao usuário para inserir a meta de linhas de código
        const goalInput = await vscode.window.showInputBox({
            prompt: 'Defina sua meta de linhas de código por semana',
            validateInput: (value) => {
                const parsedValue = parseInt(value, 10); // Converte para número
                if (isNaN(parsedValue) || parsedValue <= 0) {
                    return 'Por favor, insira um número válido maior que zero.';
                }
                return null;
            },
        });

        // Verifica se o usuário forneceu uma entrada válida
        if (goalInput) {
            const parsedGoal = parseInt(goalInput, 10); // Converte novamente para número inteiro
            if (isNaN(parsedGoal) || parsedGoal <= 0) {
                vscode.window.showErrorMessage('Meta inválida. Por favor, tente novamente.');
                return;
            }

            // Salva a meta no globalState
            await context.globalState.update('codingGoal', parsedGoal);

            // Exibe uma mensagem de sucesso
            vscode.window.showInformationMessage(
                `Meta de ${parsedGoal} linhas de código por semana definida com sucesso!`
            );
        } else {
            vscode.window.showWarningMessage('Nenhuma meta foi definida.');
        }
    } catch (error) {
        console.error('Erro ao definir a meta de codificação:', error);
        vscode.window.showErrorMessage('Ocorreu um erro ao tentar salvar sua meta. Por favor, tente novamente.');
    }
}

module.exports = { setCodingGoal };
