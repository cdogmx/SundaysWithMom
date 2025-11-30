# Sundays with Mom

A web application built with React and Vite.

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Deployment

This project is configured for deployment on Vercel.

### Vercel Setup

1. Install Vercel CLI: `npm i -g vercel`
2. Login to Vercel: `vercel login`
3. Link your project: `vercel link`
4. Deploy: `vercel --prod`

### GitHub Integration

The project includes GitHub Actions workflows for automated deployment to Vercel.

To set up:
1. Add the following secrets to your GitHub repository:
   - `VERCEL_TOKEN`: Your Vercel API token
   - `VERCEL_ORG_ID`: Your Vercel organization ID
   - `VERCEL_PROJECT_ID`: Your Vercel project ID

2. Push to the `main` branch to trigger automatic deployment.

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Base44 SDK
- React Router
- TanStack Query
# SundaysWithMom
