import bcrypt from "bcrypt"; // Verwende "import" anstelle von "require"
import readline from "readline"; // ESM-kompatibler Import

// Erstelle ein Readline-Interface, um Eingaben vom Benutzer zu lesen
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Funktion zum Hashen des Passworts
const hashPassword = async (password) => {
  try {
    // Passwort hashen mit einem Salt-Wert von 10 Runden (standardmäßig)
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Verschlüsseltes Passwort:", hashedPassword);
  } catch (error) {
    console.error("Fehler beim Hashen des Passworts:", error);
  } finally {
    // Schließe das Readline-Interface
    rl.close();
  }
};

// Frage den Benutzer nach dem Passwort
rl.question("Gib dein Passwort ein: ", (password) => {
  hashPassword(password);
});
