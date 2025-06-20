# 🎮 BARIO 

> A modern Web3 gaming platform built with Next.js, Supabase, and blockchain integration

[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-green)](https://supabase.com/)
[![Base Chain](https://img.shields.io/badge/Base-Chain-blue)](https://base.org/)

## 🌟 Overview

BAES (Bario Entertainment System) is a cutting-edge Web3 gaming platform that combines traditional gaming experiences with blockchain technology. Built on the Base chain, it features wallet authentication, game management, user ratings, and a modern gaming interface.

## ✨ Features

### 🔗 **Blockchain Integration**
- **Sign-In with Ethereum (SIWE)** authentication
- **Base Chain** integration via RainbowKit
- **Wallet-based** user management
- **Secure** JWT token sessions

### 🎯 **Gaming Platform**
- **Game catalog** with categories and ratings
- **User reviews** and comment system
- **Search functionality** with filters
- **Responsive design** for all devices

### 🛡️ **Security & Performance**
- **Row Level Security (RLS)** with Supabase
- **Rate limiting** and DDoS protection
- **Content Security Policy (CSP)**
- **Input validation** and sanitization

### ⚡ **Modern Tech Stack**
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Supabase** for database and auth
- **Framer Motion** for animations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm or npm
- Supabase account
- WalletConnect Project ID

### Installation

1. **Clone the repository**
```bash
git clone [your-new-repo-url]
cd baes-entertainment-system
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Environment setup**
```bash
cp .env.example .env.local
# Fill in your environment variables
```

4. **Run development server**
```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📋 Environment Variables

See `.env.example` for all required environment variables:

- `NEXTAUTH_SECRET` - NextAuth authentication secret
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `AUTHORIZED_ADMIN_ADDRESS` - Admin wallet address

## 🏗️ Architecture

```
├── app/                    # Next.js App Router pages
├── components/             # Reusable React components
├── lib/                    # Utilities and configurations
│   ├── supabase/          # Database operations
│   ├── config.ts          # Environment configuration
│   └── utils.ts           # Helper functions
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
└── supabase/              # Database migrations
```

## 🔒 Security Features

- **Environment variable validation**
- **Rate limiting middleware**
- **CSRF protection**
- **XSS prevention**
- **SQL injection protection via RLS**
- **Content sanitization**

## 🎨 UI/UX Features

- **Dark theme** optimized design
- **Responsive** mobile-first layout
- **Smooth animations** with Framer Motion
- **Accessible** components
- **Modern gaming** aesthetic

## 📱 Supported Wallets

Via RainbowKit integration:
- MetaMask
- Coinbase Wallet
- WalletConnect compatible wallets
- And more...

## 🗄️ Database Schema

Main tables:
- `games` - Game catalog with metadata
- `comments` - User reviews and comments
- `ratings` - Game rating system

All tables protected with Row Level Security (RLS).

## 🛠️ Development

### Running Tests
```bash
pnpm test
```

### Building for Production
```bash
pnpm build
```

### Database Migrations
```bash
supabase migration up
```

## 📚 Documentation

- [Admin Setup](README-admin.md)
- [Supabase Configuration](README-supabase.md)
- [RainbowKit Integration](README-rainbowkit.md)
- [Security Implementation](SECURITY_IMPROVEMENT_PLAN.md)

## 🤝 Contributing

We welcome contributions! Please see our [LICENSE](LICENSE) for terms.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under a **proprietary license**. See [LICENSE](LICENSE) for details.

**For commercial use**, please contact us for licensing options.

## 📞 Contact

- **Email**: contact@baesapp.com
- **GitHub**: @panikadak
- **Project**: BAES Entertainment System

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database by [Supabase](https://supabase.com/)
- Blockchain integration via [RainbowKit](https://rainbowkit.com/)
- UI components with [Radix UI](https://radix-ui.com/)

---

⭐ **Star this repository if you find it helpful!** 