const express = require('express');
const cors = require('cors');
const { exec, spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const adbPath = path.join(__dirname, 'platform-tools', 'adb.exe');

// Proceso de shell persistente para eliminar la latencia de creación de procesos
let adbShell = null;

function startAdbShell(ip = null) {
    if (adbShell) {
        adbShell.kill();
    }
    const args = ip ? ['-s', ip, 'shell'] : ['shell'];
    adbShell = spawn(adbPath, args);
    
    adbShell.on('error', (err) => console.error('Error en ADB Shell:', err));
    adbShell.on('exit', () => { adbShell = null; });
}

// Inicializar el shell por defecto al arrancar
startAdbShell();

// Endpoint para enviar comandos (keyevents)
app.post('/api/command', (req, res) => {
    const { keyCode } = req.body;
    
    if (!keyCode) {
        return res.status(400).json({ error: 'Falta el keyCode' });
    }

    // Si el shell persistente está activo, escribimos directamente
    if (adbShell && adbShell.stdin.writable) {
        adbShell.stdin.write(`input keyevent ${keyCode}\n`);
        res.json({ success: true, command: keyCode, mode: 'stream' });
    } else {
        const command = `"${adbPath}" shell input keyevent ${keyCode}`;
        exec(command, (error) => {
            if (error) return res.status(500).json({ error: 'Error al enviar comando' });
            res.json({ success: true, command: keyCode, mode: 'exec' });
            startAdbShell();
        });
    }
});

// Endpoint para enviar texto (teclado)
app.post('/api/text', (req, res) => {
    let { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Falta el texto' });
    
    // Escapar espacios para el comando ADB
    const escapedText = text.replace(/ /g, '%s');
    
    if (adbShell && adbShell.stdin.writable) {
        adbShell.stdin.write(`input text "${escapedText}"\n`);
        res.json({ success: true, mode: 'stream' });
    } else {
        exec(`"${adbPath}" shell input text "${escapedText}"`, (error) => {
            if (error) return res.status(500).json({ error: 'Error' });
            res.json({ success: true });
        });
    }
});

// Endpoint para lanzar aplicaciones (accesos rápidos)
app.post('/api/launch', (req, res) => {
    const { pkg } = req.body;
    if (!pkg) return res.status(400).json({ error: 'Falta el paquete' });
    
    if (adbShell && adbShell.stdin.writable) {
        adbShell.stdin.write(`monkey -p ${pkg} -c android.intent.category.LAUNCHER 1\n`);
        res.json({ success: true, mode: 'stream' });
    } else {
        exec(`"${adbPath}" shell monkey -p ${pkg} -c android.intent.category.LAUNCHER 1`, (error) => {
            if (error) return res.status(500).json({ error: 'Error' });
            res.json({ success: true });
        });
    }
});

// Endpoint para conectar un TV por IP
app.post('/api/connect', (req, res) => {
    const { ip } = req.body;
    
    if (!ip) {
        return res.status(400).json({ error: 'Falta la IP del TV' });
    }

    const command = `"${adbPath}" connect ${ip}`;
    
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error al conectar ADB: ${error.message}`);
            return res.status(500).json({ error: 'Error de conexión', details: error.message });
        }
        
        if (stdout.includes('failed')) {
            return res.status(400).json({ error: 'Fallo al conectar', details: stdout });
        }
        
        console.log(`Conectado exitosamente a: ${ip}`);
        
        // Reiniciamos el shell apuntando al nuevo TV conectado
        startAdbShell(ip);

        res.json({ success: true, message: stdout });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
