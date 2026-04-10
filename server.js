const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

// 🔥 middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// 📁 fichiers
const fondateurPath = path.join(__dirname, "public", "data", "fondateurs.json");
const adminPath = path.join(__dirname, "public", "data", "admins.json");
const configPath = path.join(__dirname, "public", "data", "config.json");
const casierPath = path.join(__dirname, "public", "data", "casier.json");


// =============================
// 🔐 LOGIN FONDATEUR
// =============================
app.post("/api/login/fondateur", (req, res) => {
    const { username, password } = req.body;

    try {
        const data = JSON.parse(fs.readFileSync(fondateurPath));

        const user = data.find(u => u.username === username && u.password === password);

        if (!user) {
            return res.json({
                success: false,
                message: "Identifiants incorrects"
            });
        }

        const token = Math.random().toString(36).substring(2);

        return res.json({
            success: true,
            token,
            redirect: "/fondateur.html"
        });

    } catch {
        return res.json({
            success: false,
            message: "Erreur serveur"
        });
    }
});


// =============================
// 👑 FONDATEURS
// =============================

// 📖 lire
app.get("/api/fondateurs", (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(fondateurPath));
        res.json(data);
    } catch {
        res.json([]);
    }
});

// ➕ ajouter
app.post("/api/fondateurs", (req, res) => {
    const { username, password } = req.body;

    try {
        const data = JSON.parse(fs.readFileSync(fondateurPath));

        if (data.find(f => f.username === username)) {
            return res.json({ success: false });
        }

        data.push({ username, password });

        fs.writeFileSync(fondateurPath, JSON.stringify(data, null, 2));

        res.json({ success: true });

    } catch {
        res.json({ success: false });
    }
});

// ❌ supprimer
app.post("/api/deleteFondateur", (req, res) => {
    const { username } = req.body;

    try {
        let data = JSON.parse(fs.readFileSync(fondateurPath));

        if (data.length <= 1) {
            return res.json({ success: false });
        }

        data = data.filter(f => f.username !== username);

        fs.writeFileSync(fondateurPath, JSON.stringify(data, null, 2));

        res.json({ success: true });

    } catch {
        res.json({ success: false });
    }
});


// =============================
// 🛡️ ADMINS
// =============================

// 📖 lire
app.get("/api/admins", (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(adminPath));
        res.json(data);
    } catch {
        res.json([]);
    }
});

// ➕ ajouter
app.post("/api/admins", (req, res) => {
    const { username, password } = req.body;

    try {
        const data = JSON.parse(fs.readFileSync(adminPath));

        if (data.find(a => a.username === username)) {
            return res.json({ success: false });
        }

        data.push({ username, password });

        fs.writeFileSync(adminPath, JSON.stringify(data, null, 2));

        res.json({ success: true });

    } catch {
        res.json({ success: false });
    }
});

// ❌ supprimer
app.post("/api/deleteAdmin", (req, res) => {
    const { username } = req.body;

    try {
        let data = JSON.parse(fs.readFileSync(adminPath));

        data = data.filter(a => a.username !== username);

        fs.writeFileSync(adminPath, JSON.stringify(data, null, 2));

        res.json({ success: true });

    } catch {
        res.json({ success: false });
    }
});


// =============================
// ⚙️ CONFIG / STATUS
// =============================

// 📖 lire config
app.get("/api/config", (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(configPath));
        res.json(data);
    } catch {
        res.json({
            status: "offline",
            version: "unknown"
        });
    }
});

// ⚙️ changer status
app.post("/api/status", (req, res) => {
    const { status } = req.body;

    const allowed = ["online", "maintenance", "offline"];

    if (!allowed.includes(status)) {
        return res.json({
            success: false,
            message: "Status invalide"
        });
    }

    try {
        const data = JSON.parse(fs.readFileSync(configPath));

        data.status = status;

        fs.writeFileSync(configPath, JSON.stringify(data, null, 2));

        res.json({
            success: true,
            status
        });

    } catch {
        res.json({ success: false });
    }
});


// =============================
// 🔐 LOGIN ADMIN
// =============================
app.post("/api/login/admin", (req, res) => {
    const { username, password } = req.body;

    try {
        const data = JSON.parse(fs.readFileSync(adminPath));

        const user = data.find(u => u.username === username && u.password === password);

        if (!user) {
            return res.json({
                success: false,
                message: "Identifiants incorrects"
            });
        }

        const token = Math.random().toString(36).substring(2);

        return res.json({
            success: true,
            token,
            redirect: "/admin.html"
        });

    } catch {
        return res.json({
            success: false,
            message: "Erreur serveur"
        });
    }
});

// =============================
// 🔐 CASIER
// =============================
app.get("/api/casier", (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(casierPath));
        res.json(data);
    } catch {
        res.json([]);
    }
});
app.post("/api/casier", (req, res) => {
    const { username, reason, type } = req.body;

    const allowed = ["warn", "kick", "ban"];

    if (!allowed.includes(type)) {
        return res.json({
            success: false,
            message: "Type de sanction invalide"
        });
    }

    try {
        const data = JSON.parse(fs.readFileSync(casierPath));

        data.push({
            username,
            reason,
            type,
            date: new Date().toISOString()
        });

        fs.writeFileSync(casierPath, JSON.stringify(data, null, 2));

        return res.json({
            success: true
        });

    } catch {
        return res.json({
            success: false,
            message: "Erreur serveur"
        });
    }
});
// =============================
// ➕ ajouter sanction
// =============================
app.post("/api/casier", (req, res) => {
    const { username, reason, type } = req.body;

    console.log("SANCTION REÇUE :", username, reason, type); // DEBUG

    if (!username || !reason || !type) {
        return res.json({ success: false, message: "Champs manquants" });
    }

    const allowed = ["warn", "kick", "ban"];
    if (!allowed.includes(type)) {
        return res.json({ success: false, message: "Type invalide" });
    }

    try {
        const data = JSON.parse(fs.readFileSync(casierPath));

        data.push({
            username,
            reason,
            type,
            date: new Date().toISOString()
        });

        fs.writeFileSync(casierPath, JSON.stringify(data, null, 2));

        console.log("✔ Sanction ajoutée");

        res.json({ success: true });

    } catch (err) {
        console.error("ERREUR CASIER :", err);
        res.json({ success: false });
    }
});

// =============================
// ❌ supprimer sanction
// =============================

app.post("/api/deleteSanction", (req, res) => {
    const { index } = req.body;

    try {
        let data = JSON.parse(fs.readFileSync(casierPath));

        if (index < 0 || index >= data.length) {
            return res.json({ success: false });
        }

        data.splice(index, 1);

        fs.writeFileSync(casierPath, JSON.stringify(data, null, 2));

        res.json({ success: true });

    } catch {
        res.json({ success: false });
    }
});
app.listen(3000, () => {
    console.log("Serveur lancé sur http://localhost:3000");
});