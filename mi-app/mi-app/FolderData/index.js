import fs from "fs/promises";
import path from "path";

export async function listarArchivos(carpeta) {
    try {
        const files = await fs.readdir(carpeta);
        console.log(`Archivos en ${carpeta}:`);
        for (const file of files) {
            const fullPath = path.join(carpeta, file);
            const stats = await fs.stat(fullPath);
            if (stats.isFile()) {
                console.log("- " + file);
            }
        }
    } catch (err) {
        console.error("Error leyendo carpeta:", err);
    }
}

