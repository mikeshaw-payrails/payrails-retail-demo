# E-Commerce Checkout App

A modern e-commerce checkout application built with React, TypeScript, and Tailwind CSS.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 16.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download here](https://git-scm.com/)

### Installing Node.js with nvm (recommended)

We recommend using nvm to manage Node.js versions:

```bash
# Install nvm (macOS/Linux)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart your terminal or run:
source ~/.bashrc

# Install and use the latest LTS Node.js
nvm install --lts
nvm use --lts
```

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Using yarn:
```bash
yarn install
```

### 3. Start the Development Server

Using npm:
```bash
npm run dev
```

Using yarn:
```bash
yarn dev
```

The application will be available at `http://localhost:8080`

### 4. Build for Production

Using npm:
```bash
npm run build
```

Using yarn:
```bash
yarn build
```

### 5. Preview Production Build

Using npm:
```bash
npm run preview
```

Using yarn:
```bash
yarn preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── CheckoutSummary.tsx
│   ├── CustomerForm.tsx
│   └── payment/        # Payment integration components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── assets/             # Static assets (images, etc.)
└── index.css          # Global styles and design tokens
```

## Technologies Used

This project is built with modern web technologies:

- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful UI components
- **React Router** - Client-side routing
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Lucide React** - Icon library

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Troubleshooting

### Common Issues

1. **Port already in use**: The app runs on port 8080 by default. If this port is busy, kill the process or change the port in `vite.config.ts`.

2. **Node version issues**: Make sure you're using Node.js version 16 or higher.

3. **Dependencies not installing**: Try deleting `node_modules` and `package-lock.json`, then run `npm install` again.

4. **Build errors**: Ensure all TypeScript errors are resolved before building.

### Environment Setup

No environment variables are required for basic functionality. The app runs entirely on the client-side.

## Development Workflow

1. Create a new branch for your feature
2. Make your changes
3. Test locally with `npm run dev`
4. Build and test production version with `npm run build && npm run preview`
5. Commit and push your changes

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Deployment Options

### Option 1: Lovable (Recommended)
- Open [Lovable](https://lovable.dev/projects/9b428934-0bc1-4c34-8de3-3dac30bad45f)
- Click Share → Publish
- Built-in CDN and hosting

### Option 2: Manual Deployment
- Build the project: `npm run build`
- Deploy the `dist` folder to any static hosting service:
  - Netlify
  - Vercel
  - GitHub Pages
  - AWS S3 + CloudFront

## Custom Domain

To connect a custom domain with Lovable:
1. Navigate to Project → Settings → Domains
2. Click "Connect Domain"
3. Follow the setup instructions

[Read more about custom domains](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Support

- [Lovable Documentation](https://docs.lovable.dev/)
- [Lovable Discord Community](https://discord.com/channels/1119885301872070706/1280461670979993613)
