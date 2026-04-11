const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// 🔥 middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// =============================
// 🔗 MONGODB
// =============================
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connecté"))
.catch(err => console.error(err));

// =============================
// 📦 SCHEMAS (remplace tes JSON)
// =============================
const Fondateur = mongoose.model("Fondateur", {
    username: String,
    password: String
});

const Admin = mongoose.model("Admin", {
    username: String,
    password: String
});

const Casier = mongoose.model("Casier", {
    username: String,
    reason: String,
    type: String,
    date: String
});

const Config = mongoose.model("Config", {
    status: String,
    version: String
});

// =============================
// 🔐 LOGIN FONDATEUR
// =============================
app.post("/api/login/fondateur", async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await Fondateur.findOne({ username, password });

        if (!user) {
            return res.json({ success: false, message: "Identifiants incorrects" });
        }

        const token = Math.random().toString(36).substring(2);

        res.json({
            success: true,
            token,
            redirect: "/fondateur.html"
        });

    } catch {
        res.json({ success: false, message: "Erreur serveur" });
    }
});

// =============================
// 👑 FONDATEURS
// =============================
app.get("/api/fondateurs", async (req, res) => {
    try {
        const data = await Fondateur.find();
        res.json(data);
    } catch {
        res.json([]);
    }
});

app.post("/api/fondateurs", async (req, res) => {
    const { username, password } = req.body;

    try {
        if (await Fondateur.findOne({ username })) {
            return res.json({ success: false });
        }

        await Fondateur.create({ username, password });

        res.json({ success: true });

    } catch {
        res.json({ success: false });
    }
});

app.post("/api/deleteFondateur", async (req, res) => {
    const { username } = req.body;

    try {
        const count = await Fondateur.countDocuments();

        if (count <= 1) {
            return res.json({ success: false });
        }

        await Fondateur.deleteOne({ username });

        res.json({ success: true });

    } catch {
        res.json({ success: false });
    }
});

// =============================
// 🛡️ ADMINS
// =============================
app.get("/api/admins", async (req, res) => {
    try {
        const data = await Admin.find();
        res.json(data);
    } catch {
        res.json([]);
    }
});

app.post("/api/admins", async (req, res) => {
    const { username, password } = req.body;

    try {
        if (await Admin.findOne({ username })) {
            return res.json({ success: false });
        }

        await Admin.create({ username, password });

        res.json({ success: true });

    } catch {
        res.json({ success: false });
    }
});

app.post("/api/deleteAdmin", async (req, res) => {
    const { username } = req.body;

    try {
        await Admin.deleteOne({ username });
        res.json({ success: true });
    } catch {
        res.json({ success: false });
    }
});

// =============================
// ⚙️ CONFIG / STATUS
// =============================
app.get("/api/config", async (req, res) => {
    try {
        let data = await Config.findOne();

        if (!data) {
            data = await Config.create({
                status: "offline",
                version: "1.21.1"
            });
        }

        res.json(data);

    } catch {
        res.json({ status: "offline", version: "unknown" });
    }
});

app.post("/api/status", async (req, res) => {
    const { status } = req.body;

    const allowed = ["online", "offline", "maintenance", "erreur"];

    if (!status || !allowed.includes(status)) {
        return res.json({ success: false, message: "Status invalide" });
    }

    try {
        let data = await Config.findOne();

        if (!data) {
            data = await Config.create({
                status,
                version: "1.0"
            });
        } else {
            data.status = status;
            await data.save();
        }

        res.json({ success: true, status: data.status });

    } catch (err) {
        console.error(err);
        res.json({ success: false, message: "Erreur serveur" });
    }
});

// =============================
// 🔐 LOGIN ADMIN
// =============================
app.post("/api/login/admin", async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await Admin.findOne({ username, password });

        if (!user) {
            return res.json({ success: false, message: "Identifiants incorrects" });
        }

        const token = Math.random().toString(36).substring(2);

        res.json({
            success: true,
            token,
            redirect: "/admin.html"
        });

    } catch {
        res.json({ success: false, message: "Erreur serveur" });
    }
});

// =============================
// 🔐 CASIER
// =============================
app.get("/api/casier", async (req, res) => {
    try {
        const data = await Casier.find();
        res.json(data);
    } catch {
        res.json([]);
    }
});

app.post("/api/casier", async (req, res) => {
    const { username, reason, type } = req.body;

    const allowed = ["warn", "kick", "ban"];

    if (!allowed.includes(type)) {
        return res.json({ success: false });
    }

    try {
        await Casier.create({
            username,
            reason,
            type,
            date: new Date().toISOString()
        });

        res.json({ success: true });

    } catch {
        res.json({ success: false });
    }
});

app.post("/api/deleteSanction", async (req, res) => {
    const { id } = req.body;

    try {
        await Casier.findByIdAndDelete(id);
        res.json({ success: true });
    } catch {
        res.json({ success: false });
    }
});

// =============================
// 🏠 HOME
// =============================
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
    console.log("Serveur lancé sur le port " + PORT);
});
