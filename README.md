# 🌿 Obojima Utilities

A complete companion app for the world of **Obojima**, inspired by Studio Ghibli aesthetics. This utility handles foraging mechanics, potion brewing, inventory management, and social interactions for players.

## ✨ Features

### 🎲 Foraging System
Explore the wilds of Obojima with a robust digital foraging tool:
- **7 Unique Regions**: Including Coastal Highlands, Gale Fields, Mount Arbora, and more.
- **Dynamic Difficulty**:
  - Common Native: DC 10-15
  - Uncommon Native: DC 16-20
  - Uncommon Non-Native: DC 21-25
- **Flexible Mechanics**: Supports Nature or Survival checks, Advantage/Disadvantage, and custom modifiers.
- **Bonus Dice**: Integrate d4-d12 bonus dice into your rolls.

### 🧪 Potion Brewing System
Become an alchemist with the detailed potion crafting system:
- **3-Ingredient Recipes**: Combine unique ingredients to discover new potions.
- **Attribute Scoring**: Recipes are calculated based on **Combat**, **Utility**, and **Whimsy** scores.
- **Automated Mechanics**: The system handles the math to determine the resulting potion category and specific effect.
- **Discovery & Heritage**: Save your discovered recipes and manage a personal potion inventory.

### 🤝 Social Hub
Connect with fellow adventurers:
- **Friend System**: Add friends, manage requests, and see who is online.
- **Trading**: Send ingredients and potions to friends in real-time.
- **Presence System**: See what your friends are currently doing (e.g., "Foraging in Mount Arbora").

### 👑 Admin Panel
Tools for game masters and administrators:
- **User Management**: View and edit user profiles and inventories.
- **Item Management**: Add or remove ingredients/potions from player inventories.
- **System Monitoring**: Track item economy and player engagement.

### 🎒 Collection Management
- **Local & Cloud Sync**: Data is persisted locally and synced via Firebase.
- **Smart Filtering**: Sort by availability, rarity, region, or name.
- **Usage Tracking**: Mark ingredients as used and track your consumption history.
- **Export/Import**: Backup your data with full JSON export capabilities.

## 🛠️ Technology Stack

Built with modern web technologies for performance and experience:
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Backend/Auth**: [Firebase](https://firebase.google.com/) (Auth, Firestore, Admin SDK)
- **UI Library**: [React 19](https://react.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/obojima-utilitys.git
   cd obojima-utilitys
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env.local` file in the root directory with your Firebase credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   FIREBASE_ADMIN_PRIVATE_KEY="your_private_key"
   FIREBASE_ADMIN_CLIENT_EMAIL=your_client_email
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the app**
   Visit `http://localhost:3000` to start foraging!

## 📂 Project Structure

```
src/
├── app/                  # Next.js App Router pages
├── components/           # React components
│   ├── forage/           # Foraging mechanics
│   ├── Potions/          # Potion brewing logic
│   ├── Social/           # Friends and trading
│   ├── admin/            # Admin dashboard tools
│   └── ...
├── hooks/                # Custom React hooks (logic layer)
├── services/             # Firebase and Logic services
├── types/                # TypeScript definitions
└── lib/                  # Utility functions
```

## 🎨 Design Philosophy

- **Studio Ghibli Aesthetics**: Using soft, natural palettes and smooth transitions.
- **Mobile-First**: Fully responsive design that works perfectly on phones during tabletop sessions.
- **User Feedback**: Rich micro-interactions and animations (using Framer Motion ideas) to make every action feel rewarding.

---

**Developed with ❤️ for LucasPB1**