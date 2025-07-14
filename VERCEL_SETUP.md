# Vercel Setup Guide untuk Frontend

Panduan lengkap untuk setup deployment frontend ke Vercel.

## 🚀 **Langkah 1: Setup Vercel Account**

1. **Buka [vercel.com](https://vercel.com)**
2. **Sign up/Login** dengan akun GitHub
3. **Verifikasi email** jika diperlukan

## 🔑 **Langkah 2: Dapatkan Vercel Secrets**

### **A. Vercel Token (VERCEL_TOKEN)**

1. **Buka Vercel Dashboard** → [vercel.com/account](https://vercel.com/account)
2. **Klik Settings** (⚙️) di pojok kanan atas
3. **Pilih "Tokens"** dari sidebar
4. **Klik "Create Token"**
5. **Isi form**:
   - **Name**: `GitHub Actions Deploy`
   - **Scope**: `Full Account`
   - **Expiration**: `No expiration` (atau pilih tanggal)
6. **Klik "Create"**
7. **Copy token** yang muncul (simpan dengan aman!)

### **B. Organization ID (VERCEL_ORG_ID)**

1. **Buka [vercel.com/account](https://vercel.com/account)**
2. **Scroll ke bagian "General"**
3. **Copy "Team ID"** (biasanya format: `team_xxxxxxxxxx`)

### **C. Project ID (VERCEL_PROJECT_ID)**

#### **Opsi 1: Buat Project Baru**
1. **Buka [vercel.com/new](https://vercel.com/new)**
2. **Import repository** GitHub Anda
3. **Klik "Deploy"** (biarkan deploy selesai)
4. **Buka project** yang baru dibuat
5. **Klik Settings** → **General**
6. **Scroll ke bawah**, copy **"Project ID"**

#### **Opsi 2: Dari Project yang Sudah Ada**
1. **Buka project** di Vercel Dashboard
2. **Klik Settings** → **General**
3. **Scroll ke bawah**, copy **"Project ID"**

## 📝 **Langkah 3: Tambah Secrets ke GitHub**

1. **Buka repository GitHub** frontend Anda
2. **Klik tab "Settings"**
3. **Pilih "Secrets and variables"** → **"Actions"**
4. **Klik "New repository secret"**
5. **Tambah satu per satu**:

```
Name: VERCEL_TOKEN
Value: [token dari langkah 2A]

Name: VERCEL_ORG_ID
Value: [team ID dari langkah 2B]

Name: VERCEL_PROJECT_ID
Value: [project ID dari langkah 2C]
```

## 🌐 **Langkah 4: Setup Environment Variables**

### **Di Vercel Dashboard:**
1. **Buka project** di Vercel
2. **Klik Settings** → **Environment Variables**
3. **Tambah variables**:

```
Name: NEXT_PUBLIC_API_URL
Value: https://your-heroku-app.herokuapp.com
Environment: Production, Preview, Development

Name: NEXT_PUBLIC_APP_URL  
Value: https://your-app.vercel.app
Environment: Production, Preview, Development
```

### **Atau via CLI:**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL production
vercel env add NEXT_PUBLIC_APP_URL production
```

## 🔄 **Langkah 5: Test Deployment**

1. **Push ke branch main**:
   ```bash
   git add .
   git commit -m "Setup Vercel deployment"
   git push origin main
   ```

2. **Cek GitHub Actions**:
   - Buka repository → tab **Actions**
   - Lihat workflow "CI/CD Pipeline"
   - Pastikan semua steps berhasil

3. **Cek Vercel Dashboard**:
   - Buka project di Vercel
   - Lihat deployment terbaru
   - Pastikan status "Ready"

## 🛠️ **Troubleshooting**

### **Error: "Vercel token not found"**
- Pastikan `VERCEL_TOKEN` sudah ditambahkan ke GitHub Secrets
- Pastikan token belum expired
- Buat token baru jika perlu

### **Error: "Organization not found"**
- Pastikan `VERCEL_ORG_ID` benar
- Cek di [vercel.com/account](https://vercel.com/account)
- Copy ulang Team ID

### **Error: "Project not found"**
- Pastikan project sudah dibuat di Vercel
- Pastikan `VERCEL_PROJECT_ID` benar
- Cek di project settings

### **Build Error**
- Cek logs di GitHub Actions
- Pastikan semua dependencies terinstall
- Cek TypeScript errors

## 📋 **Checklist Setup**

- [ ] Vercel account dibuat
- [ ] Vercel token dibuat
- [ ] Organization ID dicopy
- [ ] Project dibuat di Vercel
- [ ] Project ID dicopy
- [ ] Semua secrets ditambahkan ke GitHub
- [ ] Environment variables diset di Vercel
- [ ] Test deployment berhasil

## 🔗 **Links Penting**

- **Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)
- **Account Settings**: [vercel.com/account](https://vercel.com/account)
- **Tokens**: [vercel.com/account/tokens](https://vercel.com/account/tokens)
- **GitHub Actions**: [github.com/actions](https://github.com/features/actions)

## 💡 **Tips**

1. **Simpan token dengan aman** - jangan share ke siapapun
2. **Gunakan environment variables** untuk konfigurasi
3. **Test di preview** sebelum deploy ke production
4. **Monitor deployment logs** untuk debugging
5. **Setup custom domain** jika diperlukan 