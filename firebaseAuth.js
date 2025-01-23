const vscode = require('vscode');
const { auth } = require('./firebaseConfig'); // Importa o auth exportado
const { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut 
} = require('firebase/auth'); // Importa as funções necessárias do Firebase

let currentUser = null;

// Função de cadastro
function register() {
    vscode.window.showInputBox({ prompt: 'Digite seu e-mail para cadastro' }).then((email) => {
        if (!email) return;

        vscode.window.showInputBox({ prompt: 'Digite sua senha', password: true }).then((password) => {
            if (!password) return;

            // Usa a função createUserWithEmailAndPassword passando o auth
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    currentUser = userCredential.user;
                    vscode.window.showInformationMessage(`Conta criada com sucesso! Bem-vindo, ${currentUser.email}`);
                })
                .catch((error) => {
                    vscode.window.showErrorMessage(`Erro ao criar conta: ${error.message}`);
                });
        });
    });
}

// Função de login
function login() {
    vscode.window.showInputBox({ prompt: 'Digite seu e-mail' }).then((email) => {
        if (!email) return;

        vscode.window.showInputBox({ prompt: 'Digite sua senha', password: true }).then((password) => {
            if (!password) return;

            signInWithEmailAndPassword(auth, email, password) // Usa a função passando o auth
                .then((userCredential) => {
                    currentUser = userCredential.user;
                    vscode.window.showInformationMessage(`Login bem-sucedido! Olá, ${currentUser.email}`);
                })
                .catch((error) => {
                    vscode.window.showErrorMessage(`Erro ao fazer login: ${error.message}`);
                });
        });
    });
}

// Função de logout
function logout() {
    signOut(auth) // Usa a função passando o auth
        .then(() => {
            currentUser = null;
            vscode.window.showInformationMessage("Logout realizado com sucesso!");
        })
        .catch((error) => {
            vscode.window.showErrorMessage(`Erro ao sair: ${error.message}`);
        });
}

// Função para obter o usuário atual
function getCurrentUser() {
    return currentUser;
}

module.exports = { register, login, logout, getCurrentUser };
