#!/bin/bash

# Verzeichnis der Anwendung
APP_DIR="."

# Wechsle in das Verzeichnis der Anwendung
cd $APP_DIR || { echo "Verzeichnis nicht gefunden: $APP_DIR"; exit 1; }

# Hole die neuesten Änderungen aus dem Git-Repository
echo "Führe git pull aus..."
git pull || { echo "Git pull fehlgeschlagen!"; exit 1; }

# Baue das Projekt
echo "Führe npm run build aus..."
npm run build || { echo "npm run build fehlgeschlagen!"; exit 1; }

# Stoppe alle laufenden PM2-Prozesse
echo "Stoppe alle PM2-Prozesse..."
pm2 kill || { echo "PM2 kill fehlgeschlagen!"; exit 1; }

# Starte die Anwendung mit PM2
echo "Starte die Anwendung mit PM2..."
pm2 start npm --name "nuxt-app" -- run start || { echo "PM2 start fehlgeschlagen!"; exit 1; }

echo "Anwendung wurde erfolgreich neu gestartet."
