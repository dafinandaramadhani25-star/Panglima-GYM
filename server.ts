import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Fallback JSON database file paths
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}
const FALLBACK_ITEMS_FILE = path.join(DATA_DIR, "items.json");
const FALLBACK_MAINTENANCE_FILE = path.join(DATA_DIR, "maintenance.json");
const FALLBACK_LOGS_FILE = path.join(DATA_DIR, "logs.json");
const FALLBACK_USERS_FILE = path.join(DATA_DIR, "users.json");

// Define Mock Initial Data
const INITIAL_ITEMS = [
  {
    id: 'item-1',
    name: 'Treadmill Commercial T600',
    brand: 'Matrix Fitness',
    serial: 'MX-TRD-48902-A',
    category: 'Cardio',
    condition: 'Good',
    location: 'Area Kardio Barat',
    totalStock: 5,
    imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=300&auto=format&fit=crop',
    qrCodeUrl: 'MOCK-QR-MATRIX-T600',
    description: 'Treadmill performansi tinggi dengan motor AC 4.2HP, konsol LED terang, dan sistem peredam kejut Ultimate Deck.',
    updatedAt: new Date('2026-06-01T10:00:00Z').toISOString()
  },
  {
    id: 'item-2',
    name: 'Smith Machine Series 700',
    brand: 'Life Fitness',
    serial: 'LF-SM-93108-B',
    category: 'Strength',
    condition: 'In Repairs',
    location: 'Zon Bebas Beban Tengah',
    totalStock: 2,
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=300&auto=format&fit=crop',
    qrCodeUrl: 'MOCK-QR-SMITH-700',
    description: 'Sistem pengaman lintasan bar 7 derajat natural dengan bantalan linier presisi tinggi demi keamanan latihan kekuatan.',
    updatedAt: new Date('2026-06-03T14:30:00Z').toISOString()
  },
  {
    id: 'item-3',
    name: 'Olympic Hex Trap Bar 20kg',
    brand: 'Rogue Fitness',
    serial: 'RG-HEX-10293-F',
    category: 'Free Weights',
    condition: 'Good',
    location: 'Zon Angkat Berat Utama',
    totalStock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?q=80&w=300&auto=format&fit=crop',
    qrCodeUrl: 'MOCK-QR-ROGUE-HEX',
    description: 'Bilah hex bar lapis kromium industrial berkualitas tinggi, sangat direkomendasikan untuk sesi deadlift presisi tinggi.',
    updatedAt: new Date('2026-06-04T08:15:00Z').toISOString()
  }
];

const INITIAL_MAINTENANCE = [
  {
    id: 'maint-1',
    itemId: 'item-2',
    itemName: 'Smith Machine Series 700',
    nextServiceDate: '2026-06-10',
    maintenanceType: 'Lubrikasi Lintasan Rel & Kalibrasi Kabel',
    status: 'Mendatang'
  },
  {
    id: 'maint-2',
    itemId: 'item-3',
    itemName: 'Olympic Hex Trap Bar 20kg',
    nextServiceDate: '2026-06-15',
    maintenanceType: 'Inspeksi Keretakan Pengunci Kerah Logam',
    status: 'Mendatang'
  }
];

const INITIAL_LOGS = [
  {
    id: 'log-1',
    timestamp: '2026-06-04T08:15:00Z',
    type: 'Masuk',
    itemId: 'item-3',
    itemName: 'Olympic Hex Trap Bar 20kg',
    quantity: 3,
    userEmail: 'dafinandaramadhani25@gmail.com',
    userName: 'Dafina Ramadhani',
    destinationOrSource: 'Pemasok Rogue Jakarta Barat'
  }
];

const INITIAL_USERS = [
  {
    uid: 'user-1',
    email: 'dafinandaramadhani25@gmail.com',
    displayName: 'Dafina Ramadhani',
    photoURL: null,
    role: 'Admin',
    password: 'panglimagym2026'
  },
  {
    uid: 'user-2',
    email: 'ahmad@gymstock.com',
    displayName: 'Ahmad Muzakir',
    photoURL: null,
    role: 'Staff',
    password: 'staffpassword2026'
  },
  {
    uid: 'user-3',
    email: 'budi@gymstock.com',
    displayName: 'Budi Santoso',
    photoURL: null,
    role: 'Staff',
    password: 'staffpassword22'
  }
];

// Helper to write JSON files
function writeJsonFallback(filePath: string, data: any) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// Helper to read JSON files with automatic initialization
function readJsonFallback(filePath: string, initialData: any) {
  if (!fs.existsSync(filePath)) {
    writeJsonFallback(filePath, initialData);
    return initialData;
  }
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    return initialData;
  }
}

// MySQL connection pool variable
let pool: mysql.Pool | null = null;
let useMySQL = false;

// Snake case to Camel case mappings
const mapItemToCamel = (row: any) => ({
  id: row.id,
  name: row.name,
  brand: row.brand,
  serial: row.serial,
  category: row.category,
  condition: row.condition,
  location: row.location,
  totalStock: row.total_stock,
  imageUrl: row.image_url,
  qrCodeUrl: row.qr_code_url,
  description: row.description,
  updatedAt: row.updated_at || new Date().toISOString()
});

const mapMaintToCamel = (row: any) => ({
  id: row.id,
  itemId: row.item_id,
  itemName: row.item_name,
  nextServiceDate: row.next_service_date,
  maintenanceType: row.maintenance_type,
  status: row.status
});

const mapLogToCamel = (row: any) => ({
  id: row.id,
  timestamp: row.created_at || new Date().toISOString(),
  type: row.type,
  itemId: row.item_id,
  itemName: row.item_name,
  quantity: row.quantity,
  userEmail: row.user_email,
  userName: row.user_name,
  destinationOrSource: row.destination_or_source
});

const mapUserToCamel = (row: any) => ({
  uid: row.uid,
  email: row.email,
  displayName: row.display_name,
  role: row.role || 'Staff',
  password: row.password
});

// Initialize MySQL Connection if configuration is provided
async function initDatabase() {
  const host = process.env.MYSQL_HOST;
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD;
  const database = process.env.MYSQL_DATABASE || "gymstock";
  const port = parseInt(process.env.MYSQL_PORT || "3306", 10);

  if (host) {
    console.log(`Connecting to local MySQL at ${host}:${port}...`);
    try {
      // First connect without specifying database to create it if it does not exist
      const conn = await mysql.createConnection({ host, user, password, port });
      await conn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
      await conn.end();

      // Create main pool with database specified
      pool = mysql.createPool({
        host,
        user,
        password,
        database,
        port,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });

      // Test connection
      const [testRows] = await pool.query("SELECT 1");
      useMySQL = true;
      console.log(`Successfully connected to MySQL database: "${database}"`);

      // Initialize tables using lower_snake_case for perfect compatibility with Laravel DB migrations
      await pool.query(`
        CREATE TABLE IF NOT EXISTS gym_items (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          brand VARCHAR(255),
          serial VARCHAR(255),
          category VARCHAR(255),
          \`condition\` VARCHAR(255),
          location VARCHAR(255),
          total_stock INT NOT NULL DEFAULT 0,
          image_url TEXT,
          qr_code_url VARCHAR(255),
          description TEXT,
          updated_at VARCHAR(255)
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS maintenance_schedules (
          id VARCHAR(255) PRIMARY KEY,
          item_id VARCHAR(255) NOT NULL,
          item_name VARCHAR(255),
          next_service_date VARCHAR(255),
          maintenance_type VARCHAR(255),
          status VARCHAR(255),
          FOREIGN KEY (item_id) REFERENCES gym_items (id) ON DELETE CASCADE
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS stock_logs (
          id VARCHAR(255) PRIMARY KEY,
          type VARCHAR(255) NOT NULL,
          item_id VARCHAR(255) NOT NULL,
          item_name VARCHAR(255),
          quantity INT NOT NULL DEFAULT 0,
          user_email VARCHAR(255),
          user_name VARCHAR(255),
          destination_or_source VARCHAR(255),
          created_at VARCHAR(255),
          updated_at VARCHAR(255)
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS user_profiles (
          uid VARCHAR(255) PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          display_name VARCHAR(255),
          role VARCHAR(255) NOT NULL DEFAULT 'Staff',
          password VARCHAR(255)
        )
      `);

      // Seed tables if empty
      const [itemRows]: any = await pool.query("SELECT COUNT(*) as count FROM gym_items");
      if (itemRows[0].count === 0) {
        console.log("Seeding initial items to MySQL...");
        for (const item of INITIAL_ITEMS) {
          await pool.query(
            "INSERT INTO gym_items (id, name, brand, serial, category, `condition`, location, total_stock, image_url, qr_code_url, description, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [item.id, item.name, item.brand, item.serial, item.category, item.condition, item.location, item.totalStock, item.imageUrl, item.qrCodeUrl, item.description, item.updatedAt]
          );
        }
      }

      const [maintRows]: any = await pool.query("SELECT COUNT(*) as count FROM maintenance_schedules");
      if (maintRows[0].count === 0) {
        console.log("Seeding initial maintenance schedules to MySQL...");
        for (const m of INITIAL_MAINTENANCE) {
          await pool.query(
            "INSERT INTO maintenance_schedules (id, item_id, item_name, next_service_date, maintenance_type, status) VALUES (?, ?, ?, ?, ?, ?)",
            [m.id, m.itemId, m.itemName, m.nextServiceDate, m.maintenanceType, m.status]
          );
        }
      }

      const [logRows]: any = await pool.query("SELECT COUNT(*) as count FROM stock_logs");
      if (logRows[0].count === 0) {
        console.log("Seeding initial stock logs to MySQL...");
        for (const log of INITIAL_LOGS) {
          await pool.query(
            "INSERT INTO stock_logs (id, type, item_id, item_name, quantity, user_email, user_name, destination_or_source, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [log.id, log.type, log.itemId, log.itemName, log.quantity, log.userEmail, log.userName, log.destinationOrSource, log.timestamp, log.timestamp]
          );
        }
      }

      const [userRows]: any = await pool.query("SELECT COUNT(*) as count FROM user_profiles");
      if (userRows[0].count === 0) {
        console.log("Seeding initial user profiles to MySQL...");
        for (const u of INITIAL_USERS) {
          await pool.query(
            "INSERT INTO user_profiles (uid, email, display_name, role, password) VALUES (?, ?, ?, ?, ?)",
            [u.uid, u.email, u.displayName, u.role, u.password]
          );
        }
      }

    } catch (err: any) {
      console.warn("Failed to connect to MySQL database:", err.message);
      console.warn("Falling back to local high-fidelity JSON files storage layers.");
      useMySQL = false;
    }
  } else {
    console.log("No MYSQL_HOST provided in environment variables. Running in direct offline JSON file mode.");
    useMySQL = false;
  }
}

// REST APIs
app.get("/api/status", (req, res) => {
  res.json({
    status: "ok",
    mode: useMySQL ? "MySQL Active" : "Local JSON Storage Fallback",
    database: useMySQL ? process.env.MYSQL_DATABASE || "gymstock" : "data/*.json file system",
    host: useMySQL ? process.env.MYSQL_HOST : "Local Disk Storage"
  });
});

// Gym Items API
app.get("/api/items", async (req, res) => {
  if (useMySQL && pool) {
    try {
      const [rows]: any[] = await pool.query("SELECT * FROM gym_items ORDER BY updated_at DESC");
      res.json(rows.map(mapItemToCamel));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  } else {
    const data = readJsonFallback(FALLBACK_ITEMS_FILE, INITIAL_ITEMS);
    res.json(data);
  }
});

app.post("/api/items", async (req, res) => {
  const item = req.body;
  if (!item.id) {
    item.id = 'item-' + Date.now();
  }
  if (!item.updatedAt) {
    item.updatedAt = new Date().toISOString();
  }

  if (useMySQL && pool) {
    try {
      // Upsert
      await pool.query(
        "REPLACE INTO gym_items (id, name, brand, serial, category, `condition`, location, total_stock, image_url, qr_code_url, description, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          item.id, 
          item.name, 
          item.brand || null, 
          item.serial || null, 
          item.category || null, 
          item.condition, 
          item.location || null, 
          item.totalStock || 0, 
          item.imageUrl || null, 
          item.qrCodeUrl || 'MOCK-QR-' + item.serial, 
          item.description || null, 
          item.updatedAt
        ]
      );
      res.json({ success: true, item });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  } else {
    const items = readJsonFallback(FALLBACK_ITEMS_FILE, INITIAL_ITEMS);
    const existingIndex = items.findIndex((it: any) => it.id === item.id);
    if (existingIndex > -1) {
      items[existingIndex] = item;
    } else {
      items.unshift(item);
    }
    writeJsonFallback(FALLBACK_ITEMS_FILE, items);
    res.json({ success: true, item });
  }
});

app.delete("/api/items/:id", async (req, res) => {
  const { id } = req.params;
  if (useMySQL && pool) {
    try {
      await pool.query("DELETE FROM gym_items WHERE id = ?", [id]);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  } else {
    const items = readJsonFallback(FALLBACK_ITEMS_FILE, INITIAL_ITEMS);
    const filtered = items.filter((it: any) => it.id !== id);
    writeJsonFallback(FALLBACK_ITEMS_FILE, filtered);
    res.json({ success: true });
  }
});

// Maintenance Schedules API
app.get("/api/maintenance", async (req, res) => {
  if (useMySQL && pool) {
    try {
      const [rows]: any[] = await pool.query("SELECT * FROM maintenance_schedules");
      res.json(rows.map(mapMaintToCamel));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  } else {
    const data = readJsonFallback(FALLBACK_MAINTENANCE_FILE, INITIAL_MAINTENANCE);
    res.json(data);
  }
});

app.post("/api/maintenance", async (req, res) => {
  const entry = req.body;
  if (!entry.id) {
    entry.id = 'maint-' + Date.now();
  }

  if (useMySQL && pool) {
    try {
      await pool.query(
        "REPLACE INTO maintenance_schedules (id, item_id, item_name, next_service_date, maintenance_type, status) VALUES (?, ?, ?, ?, ?, ?)",
        [entry.id, entry.itemId, entry.itemName, entry.nextServiceDate, entry.maintenanceType, entry.status]
      );
      res.json({ success: true, entry });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  } else {
    const data = readJsonFallback(FALLBACK_MAINTENANCE_FILE, INITIAL_MAINTENANCE);
    const index = data.findIndex((m: any) => m.id === entry.id);
    if (index > -1) {
      data[index] = entry;
    } else {
      data.unshift(entry);
    }
    writeJsonFallback(FALLBACK_MAINTENANCE_FILE, data);
    res.json({ success: true, entry });
  }
});

// Stock Logs API
app.get("/api/logs", async (req, res) => {
  if (useMySQL && pool) {
    try {
      const [rows]: any[] = await pool.query("SELECT * FROM stock_logs ORDER BY created_at DESC");
      res.json(rows.map(mapLogToCamel));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  } else {
    const data = readJsonFallback(FALLBACK_LOGS_FILE, INITIAL_LOGS);
    res.json(data);
  }
});

app.post("/api/logs", async (req, res) => {
  const log = req.body;
  if (!log.id) {
    log.id = 'log-' + Date.now();
  }
  if (!log.timestamp) {
    log.timestamp = new Date().toISOString();
  }

  if (useMySQL && pool) {
    try {
      await pool.query(
        "INSERT INTO stock_logs (id, type, item_id, item_name, quantity, user_email, user_name, destination_or_source, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [log.id, log.type, log.itemId, log.itemName, log.quantity, log.userEmail, log.userName, log.destinationOrSource, log.timestamp, log.timestamp]
      );
      res.json({ success: true, log });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  } else {
    const data = readJsonFallback(FALLBACK_LOGS_FILE, INITIAL_LOGS);
    data.unshift(log);
    writeJsonFallback(FALLBACK_LOGS_FILE, data);
    res.json({ success: true, log });
  }
});

app.delete("/api/logs", async (req, res) => {
  if (useMySQL && pool) {
    try {
      await pool.query("DELETE FROM stock_logs");
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  } else {
    writeJsonFallback(FALLBACK_LOGS_FILE, []);
    res.json({ success: true });
  }
});

// User Profiles API
app.get("/api/users", async (req, res) => {
  if (useMySQL && pool) {
    try {
      const [rows]: any[] = await pool.query("SELECT * FROM user_profiles");
      res.json(rows.map(mapUserToCamel));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  } else {
    const data = readJsonFallback(FALLBACK_USERS_FILE, INITIAL_USERS);
    res.json(data);
  }
});

app.post("/api/users", async (req, res) => {
  const userProf = req.body;
  if (!userProf.uid) {
    userProf.uid = 'user-' + Date.now();
  }

  if (useMySQL && pool) {
    try {
      await pool.query(
        "REPLACE INTO user_profiles (uid, email, display_name, role, password) VALUES (?, ?, ?, ?, ?)",
        [userProf.uid, userProf.email, userProf.displayName, userProf.role || 'Staff', userProf.password || '']
      );
      res.json({ success: true, user: userProf });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  } else {
    const data = readJsonFallback(FALLBACK_USERS_FILE, INITIAL_USERS);
    const index = data.findIndex((u: any) => u.uid === userProf.uid);
    if (index > -1) {
      data[index] = userProf;
    } else {
      data.push(userProf);
    }
    writeJsonFallback(FALLBACK_USERS_FILE, data);
    res.json({ success: true, user: userProf });
  }
});

app.delete("/api/users/:uid", async (req, res) => {
  const { uid } = req.params;
  if (useMySQL && pool) {
    try {
      await pool.query("DELETE FROM user_profiles WHERE uid = ?", [uid]);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  } else {
    const data = readJsonFallback(FALLBACK_USERS_FILE, INITIAL_USERS);
    const filtered = data.filter((u: any) => u.uid !== uid);
    writeJsonFallback(FALLBACK_USERS_FILE, filtered);
    res.json({ success: true });
  }
});

// App server setup with Vite
async function startServer() {
  await initDatabase();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();
