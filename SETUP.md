# Step Central — Setup Accounts (free)

Fill these in later — the app runs without them except where noted.

## 1. MongoDB Atlas (required — app won't store data without it)
1. Go to https://www.mongodb.com/atlas → Sign up (free)
2. Create a **FREE M0** cluster
3. **Database Access** → Add New Database User → username + password (save these!)
4. **Network Access** → Add IP Address → `0.0.0.0/0` (allow all)
5. **Connect** → Drivers → copy the connection string
6. Paste into `backend/.env` → `DB_URI`, replacing `username:password`, and set the database name to `stepcentral`
   Example: `mongodb+srv://myuser:mypass@cluster0.xxx.mongodb.net/stepcentral?retryWrites=true&w=majority`

## 2. Cloudinary (required — product/avatar photos)
1. Go to https://cloudinary.com → Sign up (free)
2. On the Dashboard, copy **Cloud name**, **API Key**, **API Secret**
3. Paste into `backend/.env` → `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

## 3. Mailtrap (required for transaction emails + PDF receipt — Phase 4)
1. Go to https://mailtrap.io → Sign up (free)
2. Create an **Inbox** → SMTP Credentials tab
3. Paste host/port/username/password into `backend/.env` → `SMTP_*` lines
   (defaults `sandbox.smtp.mailtrap.io` / `2525` are usually correct)

## 4. JWT secret (2 seconds)
Generate any long random string, e.g. run in terminal:
```
node -e "console.log(require('crypto').randomBytes(40).toString('hex'))"
```
Paste into `backend/.env` → `JWT_SECRET`

## 5. Firebase (needed in Phase 2/5 — skip for now)
1. Go to https://console.firebase.google.com → Add project (free, no Blaze plan needed)
2. **Build → Authentication → Get started** → enable **Email/Password**, **Google**, **Facebook**
3. **Project settings → Service accounts → Generate new private key**
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the `\n` escapes, wrap in quotes)
4. For Google/Facebook sign-in buttons you'll also need the web API config (we'll add `frontend/src/firebase.js` in Phase 2)

## Run
```bash
# terminal 1
cd C:\Users\Joseph\step-central\backend
npm run dev        # → http://localhost:4001

# terminal 2
cd C:\Users\Joseph\step-central\frontend
npm run dev        # → http://localhost:5173
```
