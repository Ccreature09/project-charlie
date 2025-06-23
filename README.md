# PROJECT: Charlie

A modern web-based gaming platform that combines Unity WebGL games with social features, built with Next.js and Firebase.

## 🎮 Features

- **Level Creator**: Create custom game levels using an integrated Unity WebGL level editor
- **Level Playing**: Play community-created levels with Unity WebGL integration
- **Level Discovery**: Browse and discover levels created by the community
- **Level Packs**: Organized collections of levels for themed gameplay
- **User Profiles**: Personal profiles with level statistics and achievements
- **Search**: Find levels and users across the platform
- **Admin Panel**: Administrative tools for platform management
- **Progressive Web App**: Installable PWA with offline capabilities

## 🚀 Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom components
- **UI Components**: Radix UI primitives with custom styling
- **Game Engine**: Unity WebGL integration via react-unity-webgl
- **Backend**: Firebase (Firestore database, Authentication)
- **State Management**: React hooks and context
- **Form Handling**: React Hook Form with Zod validation
- **Rich Text Editor**: Quill.js integration
- **Analytics**: Vercel Analytics and Speed Insights
- **PWA**: next-pwa for Progressive Web App features

## 📱 Pages & Routes

- `/` - Home page with platform overview
- `/discover` - Discover new levels and content
- `/level/[id]` - Play individual levels
- `/level-creator` - Create new levels
- `/level-packs` - Browse level collections
- `/level-packs/[pack]` - View specific level pack
- `/profile/[id]` - User profiles
- `/search/[query]` - Search results
- `/admin` - Administrative dashboard

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project configured

### Getting Started

1. Clone the repository:
```bash
git clone https://github.com/your-username/project-charlie.git
cd project-charlie
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with your Firebase configuration:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🏗️ Project Structure

```
project-charlie/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard
│   ├── discover/          # Level discovery
│   ├── level/             # Level playing
│   ├── level-creator/     # Level creation tool
│   ├── level-packs/       # Level collections
│   ├── profile/           # User profiles
│   └── search/            # Search functionality
├── components/            # React components
│   ├── functional/        # Feature-specific components
│   └── ui/               # Reusable UI components
├── firebase/             # Firebase configuration
├── lib/                  # Utility functions
├── public/               # Static assets
│   ├── build/            # Unity WebGL builds
│   └── images/           # App icons and images
└── assets/               # Fonts and other assets
```

## 🎮 Unity Integration

The project includes Unity WebGL builds for:
- **Level Player** (`/public/build/level/`) - Game runtime for playing levels
- **Level Creator** (`/public/build/level-creator/`) - Visual level editor

Unity games are integrated using the `react-unity-webgl` library, providing seamless communication between the React frontend and Unity games.

## 🔧 Key Components

- **Navbar**: Main navigation with user authentication
- **Unity Level**: WebGL game component for level playing
- **Unity Level Creator**: WebGL editor for level creation
- **Level List**: Display and browse levels
- **User List**: Browse community members
- **Sign In**: Authentication components

## 📱 Progressive Web App

The app is configured as a PWA with:
- Offline functionality
- App icons for various platforms (72x72 to 512x512)
- Web app manifest
- Service worker integration

## 🌟 Features in Development

- **Съзтезания (Competitions)**: Programming competitions for efficient level solutions
- **Значки (Badges)**: Achievement system with collectible badges
- **Enhanced Social Features**: Extended community interactions

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary. All rights reserved.

## 🔗 Links

- [Live Demo](https://your-deployment-url.com) (if deployed)
- [Documentation](./Documentation.odg) (LibreOffice Draw format)

## 🐛 Issues & Support

Please report issues through the GitHub issue tracker or contact the development team.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

---

**PROJECT: Charlie** - Bringing interactive programming education to the web through Unity and modern web technologies.
