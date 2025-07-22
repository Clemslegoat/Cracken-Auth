// api/file-storage.js
// Stockage persistant pour les résultats d'authentification
// Utilise le système de fichiers temporaire de Vercel

const fs = require('fs').promises;
const path = require('path');

// Dossier temporaire pour stocker les sessions
const TEMP_DIR = '/tmp/cracken-auth';

// Créer le dossier temporaire s'il n'existe pas
async function ensureTempDir() {
  try {
    await fs.mkdir(TEMP_DIR, { recursive: true });
  } catch (error) {
    // Le dossier existe déjà, c'est OK
  }
}

// Fonction pour stocker un résultat d'authentification
async function setAuthResult(sessionId, result) {
  try {
    await ensureTempDir();
    
    const filePath = path.join(TEMP_DIR, `${sessionId}.json`);
    const data = {
      ...result,
      timestamp: Date.now()
    };
    
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    console.log(`📝 FILE STORAGE: Résultat stocké dans ${filePath}`);
    console.log(`📝 FILE STORAGE: Données:`, { success: result.success, provider: result.provider });
    
    return true;
  } catch (error) {
    console.error(`❌ FILE STORAGE: Erreur stockage session ${sessionId}:`, error);
    return false;
  }
}

// Fonction pour récupérer un résultat d'authentification
async function getAuthResult(sessionId) {
  try {
    const filePath = path.join(TEMP_DIR, `${sessionId}.json`);
    
    console.log(`🔍 FILE STORAGE: Recherche fichier ${filePath}`);
    
    // Vérifier si le fichier existe
    try {
      await fs.access(filePath);
    } catch (error) {
      console.log(`❌ FILE STORAGE: Fichier ${sessionId}.json non trouvé`);
      return null;
    }
    
    // Lire le fichier
    const fileContent = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    
    console.log(`✅ FILE STORAGE: Fichier trouvé pour session ${sessionId}`);
    
    // Vérifier si le résultat n'est pas expiré (10 minutes)
    const now = Date.now();
    const age = now - data.timestamp;
    
    if (age > 10 * 60 * 1000) {
      console.log(`⏰ FILE STORAGE: Session expirée (${Math.round(age/1000)}s), suppression`);
      await deleteAuthResult(sessionId);
      return null;
    }
    
    console.log(`🎯 FILE STORAGE: Session valide (âge: ${Math.round(age/1000)}s)`);
    return data;
    
  } catch (error) {
    console.error(`❌ FILE STORAGE: Erreur lecture session ${sessionId}:`, error);
    return null;
  }
}

// Fonction pour supprimer un résultat d'authentification
async function deleteAuthResult(sessionId) {
  try {
    const filePath = path.join(TEMP_DIR, `${sessionId}.json`);
    await fs.unlink(filePath);
    console.log(`🗑️ FILE STORAGE: Session ${sessionId} supprimée`);
    return true;
  } catch (error) {
    console.log(`⚠️ FILE STORAGE: Impossible de supprimer ${sessionId} (peut-être déjà supprimé)`);
    return false;
  }
}

// Fonction pour obtenir des statistiques
async function getStats() {
  try {
    await ensureTempDir();
    const files = await fs.readdir(TEMP_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    const sessions = [];
    for (const file of jsonFiles) {
      try {
        const filePath = path.join(TEMP_DIR, file);
        const content = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(content);
        const sessionId = file.replace('.json', '');
        
        sessions.push({
          id: sessionId.substring(0, 8) + '...',
          provider: data.provider,
          success: data.success,
          age: Math.round((Date.now() - data.timestamp) / 1000) + 's'
        });
      } catch (error) {
        // Fichier corrompu, on l'ignore
      }
    }
    
    return {
      totalSessions: sessions.length,
      sessions: sessions
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error);
    return { totalSessions: 0, sessions: [] };
  }
}

module.exports = {
  setAuthResult,
  getAuthResult,
  deleteAuthResult,
  getStats
};
