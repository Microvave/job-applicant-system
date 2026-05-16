# 📋 Job Applicant Management System

ระบบจัดการผู้สมัครงาน พัฒนาด้วย React + Google Apps Script + Google Sheets

---

## 🛠 Tech Stack

| Layer    | Technology                |
|----------|---------------------------|
| Frontend | React (Vite), Tailwind CSS|
| Backend  | Google Apps Script (GAS)  |
| Database | Google Sheets             |
| Deploy   | Vercel / Netlify          |

---

## 📁 Folder Structure

```
job-applicant-system/
├── src/
│   ├── App.jsx        # Main component (CRUD, Search, Filter, Pagination)
│   └── main.jsx       # Entry point
├── gas_backend/
│   └── Code.gs        # Google Apps Script backend
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## ⚙️ การติดตั้งและรัน (Local)

### 1. Clone project
```bash
git clone https://github.com/YOUR_USERNAME/job-applicant-system.git
cd job-applicant-system
```

### 2. Install dependencies
```bash
npm install
```

### 3. ตั้งค่า Environment Variable
```bash
cp .env.example .env
```

แก้ไขไฟล์ `.env`:
```env
VITE_GAS_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

### 4. รัน Development Server
```bash
npm run dev
```

เปิดที่ `http://localhost:5173`

---

## 🔗 วิธีเชื่อม Google Sheets + Google Apps Script

### ขั้นตอนที่ 1: สร้าง Google Sheets
1. ไปที่ [Google Sheets](https://sheets.google.com)
2. สร้าง Spreadsheet ใหม่ (ไม่ต้องสร้าง header เอง — GAS จะสร้างให้อัตโนมัติ)
3. ตั้งชื่อ sheet ว่า `Applicants` (หรือเปลี่ยนใน `Code.gs` บรรทัด `const SHEET_NAME`)

### ขั้นตอนที่ 2: Deploy Google Apps Script
1. ใน Google Sheets → **Extensions → Apps Script**
2. วางโค้ดจากไฟล์ `gas_backend/Code.gs` ลงใน editor
3. บันทึก (Ctrl+S)
4. คลิก **Deploy → New Deployment**
5. เลือก Type: **Web App**
6. ตั้งค่า:
   - Execute as: **Me**
   - Who has access: **Anyone** (สำคัญ!)
7. คลิก **Deploy** → คัดลอก URL ที่ได้

### ขั้นตอนที่ 3: ใส่ URL ใน .env
```env
VITE_GAS_URL=https://script.google.com/macros/s/XXXXXX/exec
```

---

## 🚀 Deploy Frontend

### Vercel
```bash
npm install -g vercel
vercel
# ตั้งค่า VITE_GAS_URL ใน Vercel Dashboard → Settings → Environment Variables
```

### Netlify
```bash
npm run build
# ลาก folder `dist` ไปที่ netlify.com/drop
```

### GitHub Pages
```bash
npm run build
npx gh-pages -d dist
```

---

## 📡 API Reference (Google Apps Script)

Base URL: `https://script.google.com/macros/s/YOUR_ID/exec`

| Method | Action   | Description           |
|--------|----------|-----------------------|
| GET    | `?action=list` | ดึงรายการทั้งหมด |
| GET    | `?action=get&id=xxx` | ดึงรายการเดียว |
| POST   | `{"action":"create",...}` | เพิ่มผู้สมัคร |
| POST   | `{"action":"update",...}` | แก้ไขผู้สมัคร |
| POST   | `{"action":"delete","id":"xxx"}` | ลบผู้สมัคร |

---

## 🔄 Status Flow

```
Applied → Interview → Passed
                   ↘ Rejected
Applied → Rejected
```

การเปลี่ยนสถานะย้อนกลับ (เช่น Passed → Applied) จะถูกป้องกันทั้ง Frontend และ Backend

---

## ✅ Features

- [x] แสดงรายการผู้สมัครทั้งหมด
- [x] เพิ่มผู้สมัครพร้อม validation
- [x] แก้ไขข้อมูล
- [x] ลบพร้อม confirm dialog
- [x] ตรวจสอบ Email/Phone ซ้ำ
- [x] Status flow validation
- [x] Search by name
- [x] Filter by status
- [x] Sort by date
- [x] Pagination
- [x] Responsive (Mobile + Desktop)
- [x] Loading & Error states
