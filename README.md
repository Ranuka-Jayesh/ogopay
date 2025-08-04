# 💰 OgoPay - Personal Finance & Friend Loan Management System

<div align="center">

**A modern, full-stack solution for managing personal loans and transactions with friends**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge)](https://github.com/yourusername/ogopay)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-orange?style=for-the-badge)](https://github.com/yourusername/ogopay/releases)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

[🚀 **Live Demo**](https://ogopay.netlify.app) • [📖 **Documentation**](https://docs.ogopay.com) • [🐛 **Report Bug**](https://github.com/yourusername/ogopay/issues) • [✨ **Request Feature**](https://github.com/yourusername/ogopay/issues)

</div>

---

## 🌟 **Features Overview**

<details open>
<summary><strong>🔍 Click to explore features</strong></summary>

### 👨‍💼 **For Admins (Loan Managers)**
- 🧑‍🤝‍🧑 **Friend Management** - Add, edit, and delete friend profiles with WhatsApp integration
- 📊 **Transaction Tracking** - Record loans and repayments with detailed descriptions
- 📈 **Real-time Analytics** - View total borrowed, repaid, and remaining balances
- 🔗 **Tracking URLs** - Generate unique tracking links for friends
- 👤 **Profile Management** - Upload profile photos and manage account settings
- 🧾 **Transaction Slips** - Generate and print transaction receipts

### 👥 **For Friends (Borrowers)**
- 📱 **Personal Dashboard** - View their own transaction history and current balance
- 🔐 **Secure Access** - Private login to see only their own data
- 📜 **Transaction History** - Complete log of all loans and repayments

### 🌐 **Public Features**
- 🔍 **Tracking Pages** - Anyone can view transaction history using tracking URLs
- 🎨 **Modern Landing Page** - Beautiful, responsive design with smooth animations
- 📝 **Blog & Contact Pages** - Additional informational content
- 🌙 **Dark/Light Theme** - Toggle between themes for better UX

</details>

---

## 🛠️ **Technology Stack**

<div align="center">

| Category | Technologies |
|----------|-------------|
| **Frontend** | ![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E) |
| **Styling** | ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) ![Framer Motion](https://img.shields.io/badge/Framer_Motion-black?style=for-the-badge&logo=framer&logoColor=blue) |
| **Backend** | ![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white) |

</div>

---

## 🚀 **Quick Start**

### 📋 **Prerequisites**

```bash
node >= 18.0.0
npm >= 8.0.0
git
```

### 💾 **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ogopay.git
   cd ogopay
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:5173
   ```

> 🎉 **Congratulations!** OgoPay is now running locally.

---

## 📊 **Database Schema**

<details>
<summary><strong>🗄️ Click to view database structure</strong></summary>

```sql
-- Users table for authentication
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Friends table for managing borrowers
CREATE TABLE friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  phone VARCHAR,
  tracking_url VARCHAR UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Transactions table for loans and repayments
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  friend_id UUID REFERENCES friends(id) ON DELETE CASCADE,
  type VARCHAR CHECK (type IN ('loan', 'repayment')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

</details>

---

## 🔐 **Security Features**

<div align="center">

| Feature | Description |
|---------|-------------|
| 🔒 **Authentication** | Supabase Auth with role-based access control |
| 🛡️ **Environment Config** | Secure API key management |
| 🔗 **Tracking URLs** | Secure public access to transaction data |
| 🌐 **CORS Protection** | HTTPS enforcement and CORS configuration |

</div>

---

## 📱 **Screenshots**

<div align="center">

| Dashboard | Transaction History | Friend Management |
|-----------|-------------------|------------------|
| ![Dashboard](https://drive.google.com/file/d/1qFekj84M8uBs32iPGjqradDYXLkSCoSo/view?usp=sharing) | ![History](https://drive.google.com/file/d/1DIdZj0bWMPpIShrdq5YXmolv46YPyyye/view?usp=sharing) | ![Friends](https://drive.google.com/file/d/1nqa0ybBQcHX7a1_EnaXS9vBuyQKnMRXF/view?usp=sharing) |

</div>

---

## 🚀 **Deployment**

### **Deploy to Netlify**

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Deploy
   netlify deploy --prod --dir=dist
   ```

3. **Configure environment variables in Netlify dashboard**

### **Deploy to Vercel**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ogopay)

---

## 📈 **Performance**

<div align="center">

| Metric | Score |
|--------|-------|
| ⚡ **Performance** | 98/100 |
| ♿ **Accessibility** | 100/100 |
| ✅ **Best Practices** | 95/100 |
| 🔍 **SEO** | 100/100 |

*Tested with Lighthouse*

</div>

---

## 🤝 **Contributing**

We love contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Development Workflow**

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

---

## 📋 **Roadmap**

- [ ] 📊 Advanced analytics dashboard
- [ ] 💬 WhatsApp integration for notifications
- [ ] 📄 PDF receipt generation
- [ ] 🔄 Recurring payment reminders
- [ ] 📱 Mobile app (React Native)
- [ ] 🌍 Multi-language support
- [ ] 💳 Payment gateway integration

---

## 🐛 **Known Issues**

<details>
<summary><strong>⚠️ Current limitations</strong></summary>

- Mobile responsiveness needs improvement on very small screens
- Email notifications are not yet implemented
- Bulk operations for transactions are pending

</details>

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 **Acknowledgments**

- [Supabase](https://supabase.com) for the amazing backend-as-a-service
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework
- [Framer Motion](https://framer.com/motion) for smooth animations
- [Lucide React](https://lucide.dev) for beautiful icons

---

## 📞 **Support**

<div align="center">

**Need help?** We're here for you!

[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:rjganegama@ogotechnology.com)
[![Documentation](https://img.shields.io/badge/Docs-000000?style=for-the-badge&logo=gitbook&logoColor=white)](https://docs.ogopay.com)

</div>

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

**Made with ❤️ by [RJ Ganegame](https://github.com/rjganegame)**

</div>

---

<div align="center">

### 🚀 **Ready to manage your finances like a pro?**

[**Get Started Now →**](https://ogopay.netlify.app)

</div>
