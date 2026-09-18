import { registerPlugin, Capacitor } from '@capacitor/core';

const AdbPlugin = registerPlugin('AdbPlugin');
const isNative = Capacitor.isNativePlatform();

export const KEYCODES = {
  UP: 19,
  DOWN: 20,
  LEFT: 21,
  RIGHT: 22,
  CENTER: 23, // OK
  BACK: 4,
  HOME: 3,
  MENU: 82,
  VOL_UP: 24,
  VOL_DOWN: 25,
  MUTE: 164,
  POWER: 26,
  ASSIST: 219, // Mic / Voice Assistant
  CHANNEL_UP: 166,
  CHANNEL_DOWN: 167,
  PLAY_PAUSE: 85,
  SEARCH: 84
};

export const APPS = {
  NETFLIX: 'com.netflix.ninja',
  YOUTUBE: 'com.google.android.youtube.tv',
  PRIME: 'com.amazon.amazonvideo.livingroom',
  HBO: 'com.wbd.stream',
};

// Usa la IP del servidor actual dinámicamente en lugar de localhost (Solo para Web)
const BACKEND_URL = `http://${window.location.hostname}:3001`;

export const sendCommand = async (keyCode) => {
  if (isNative) {
    await AdbPlugin.sendCommand({ keyCode });
    return { success: true };
  }
  try {
    const response = await fetch(`${BACKEND_URL}/api/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyCode }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error al enviar comando:', error);
    throw error;
  }
};

export const sendText = async (text) => {
  if (isNative) {
    await AdbPlugin.sendText({ text });
    return { success: true };
  }
  try {
    const response = await fetch(`${BACKEND_URL}/api/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error al enviar texto:', error);
    throw error;
  }
};

export const launchApp = async (pkg) => {
  if (isNative) {
    await AdbPlugin.launchApp({ pkg });
    return { success: true };
  }
  try {
    const response = await fetch(`${BACKEND_URL}/api/launch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pkg }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error al lanzar app:', error);
    throw error;
  }
};

export const connectToTv = async (ip) => {
  if (isNative) {
    await AdbPlugin.connectToTV({ ip });
    return { success: true };
  }
  try {
    const response = await fetch(`${BACKEND_URL}/api/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al conectar');
    return data;
  } catch (error) {
    console.error('Error al conectar:', error);
    throw error;
  }
};

export const scanForTvs = async () => {
  if (isNative) {
    const result = await AdbPlugin.scanTVs();
    return result.devices || [];
  }
  return []; // En web no podemos escanear la red local fácilmente
};
