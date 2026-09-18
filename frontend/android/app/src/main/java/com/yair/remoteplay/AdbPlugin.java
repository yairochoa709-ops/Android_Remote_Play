package com.yair.remoteplay;

import android.util.Base64;
import android.util.Log;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import com.tananaev.adblib.AdbBase64;
import com.tananaev.adblib.AdbConnection;
import com.tananaev.adblib.AdbCrypto;
import com.tananaev.adblib.AdbStream;

import java.io.File;
import java.net.Socket;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.HashSet;
import java.util.Set;

import android.content.Context;
import android.net.nsd.NsdManager;
import android.net.nsd.NsdServiceInfo;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;

@CapacitorPlugin(name = "AdbPlugin")
public class AdbPlugin extends Plugin {

    private AdbConnection connection;
    private AdbCrypto crypto;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    @PluginMethod
    public void scanTVs(PluginCall call) {
        NsdManager nsdManager = (NsdManager) getContext().getSystemService(Context.NSD_SERVICE);
        JSArray devicesArray = new JSArray();
        Set<String> foundIps = new HashSet<>();

        NsdManager.DiscoveryListener discoveryListener = new NsdManager.DiscoveryListener() {
            @Override public void onDiscoveryStarted(String regType) { }
            @Override public void onServiceLost(NsdServiceInfo service) { }
            @Override public void onDiscoveryStopped(String serviceType) { }
            @Override public void onStartDiscoveryFailed(String serviceType, int errorCode) { }
            @Override public void onStopDiscoveryFailed(String serviceType, int errorCode) { }

            @Override
            public void onServiceFound(NsdServiceInfo service) {
                nsdManager.resolveService(service, new NsdManager.ResolveListener() {
                    @Override public void onResolveFailed(NsdServiceInfo serviceInfo, int errorCode) { }
                    @Override
                    public void onServiceResolved(NsdServiceInfo serviceInfo) {
                        String ip = serviceInfo.getHost().getHostAddress();
                        if (!foundIps.contains(ip)) {
                            foundIps.add(ip);
                            JSObject device = new JSObject();
                            device.put("name", serviceInfo.getServiceName());
                            device.put("ip", ip);
                            devicesArray.put(device);
                        }
                    }
                });
            }
        };

        // Escanear por dispositivos Chromecast/Android TV
        nsdManager.discoverServices("_googlecast._tcp.", NsdManager.PROTOCOL_DNS_SD, discoveryListener);

        // Esperar 3 segundos recolectando IPs y devolver el resultado
        executor.execute(() -> {
            try { Thread.sleep(3000); } catch (Exception e) {}
            try { nsdManager.stopServiceDiscovery(discoveryListener); } catch (Exception e) {}
            
            JSObject ret = new JSObject();
            ret.put("devices", devicesArray);
            call.resolve(ret);
        });
    }

    private void setupCrypto() throws Exception {
        if (crypto == null) {
            File pubKey = new File(getContext().getFilesDir(), "adbkey.pub");
            File privKey = new File(getContext().getFilesDir(), "adbkey");

            AdbBase64 base64 = new AdbBase64() {
                @Override
                public String encodeToString(byte[] data) {
                    return Base64.encodeToString(data, Base64.NO_WRAP);
                }
            };

            if (pubKey.exists() && privKey.exists()) {
                crypto = AdbCrypto.loadAdbKeyPair(base64, privKey, pubKey);
            } else {
                crypto = AdbCrypto.generateAdbKeyPair(base64);
                crypto.saveAdbKeyPair(privKey, pubKey);
            }
        }
    }

    @PluginMethod
    public void connectToTV(PluginCall call) {
        String ip = call.getString("ip");
        if (ip == null) {
            call.reject("Falta la IP");
            return;
        }

        executor.execute(() -> {
            try {
                setupCrypto();
                if (connection != null) {
                    try { connection.close(); } catch (Exception e) {}
                }
                
                String[] parts = ip.split(":");
                String host = parts[0];
                int port = parts.length > 1 ? Integer.parseInt(parts[1]) : 5555;

                Socket socket = new Socket(host, port);
                connection = AdbConnection.create(socket, crypto);
                connection.connect();
                
                call.resolve();
            } catch (Exception e) {
                Log.e("AdbPlugin", "Error al conectar", e);
                call.reject("Error de conexión: " + e.getMessage());
            }
        });
    }

    private void sendAdbCommand(String command, PluginCall call) {
        if (connection == null) {
            call.reject("No conectado");
            return;
        }
        executor.execute(() -> {
            try {
                AdbStream stream = connection.open(command);
                // Leer todo para que el comando termine correctamente
                while (!stream.isClosed()) {
                    stream.read();
                }
                if (call != null) call.resolve();
            } catch (Exception e) {
                Log.e("AdbPlugin", "Error enviando comando: " + command, e);
                if (call != null) call.reject("Error enviando comando: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void sendCommand(PluginCall call) {
        Integer keyCode = call.getInt("keyCode");
        if (keyCode == null) {
            call.reject("Falta keyCode");
            return;
        }
        sendAdbCommand("shell:input keyevent " + keyCode, call);
    }

    @PluginMethod
    public void sendText(PluginCall call) {
        String text = call.getString("text");
        if (text == null) {
            call.reject("Falta text");
            return;
        }
        String escaped = text.replace(" ", "%s");
        sendAdbCommand("shell:input text \"" + escaped + "\"", call);
    }

    @PluginMethod
    public void launchApp(PluginCall call) {
        String pkg = call.getString("pkg");
        if (pkg == null) {
            call.reject("Falta pkg");
            return;
        }
        sendAdbCommand("shell:monkey -p " + pkg + " -c android.intent.category.LAUNCHER 1", call);
    }
}
