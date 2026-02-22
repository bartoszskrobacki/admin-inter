# Admin Inter - Admin Panel

Admin panel dla zarządzania promocjami restauracji z integracją Facebook.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** - build tool
- **Tailwind CSS v4** + **shadcn/ui** - UI components
- **React Router** - routing
- **Axios** - HTTP client

## Features

- JWT authentication
- Promotion CRUD operations
- Image preview (generated Facebook posts)
- Protected routes
- Responsive design

## Prerequisites

- Node.js >= 18
- Yarn
- Backend API running on `http://localhost:3000`

## Setup

```bash
# Install dependencies
yarn install

# Copy environment file
cp .env.example .env

# Configure API URL if needed (default: http://localhost:3000)
# Edit .env and set VITE_API_URL
```

## Development

```bash
# Start dev server
yarn dev

# Access at http://localhost:5173
```

## Build

```bash
# Build for production
yarn build

# Preview production build
yarn preview
```

## API Endpoints Used

- `POST /auth/login` - User authentication
- `GET /promotion` - List all promotions
- `GET /promotion/:id` - Get promotion with image
- `PUT /promotion/:id` - Update promotion (protected)
- `DELETE /promotion/:id` - Delete promotion (protected)

## Environment Variables

```bash
VITE_API_URL=http://localhost:3000  # Backend API URL
```

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── PromotionDialog.tsx
│   └── ImagePreviewDialog.tsx
├── contexts/
│   └── AuthContext.tsx  # Authentication context
├── lib/
│   ├── api.ts           # API client
│   └── utils.ts         # Utilities (cn helper)
├── pages/
│   ├── LoginPage.tsx
│   └── PromotionsPage.tsx
├── App.tsx              # Routes configuration
└── main.tsx             # Entry point
```

## Default Credentials

Check with backend configuration - typically defined in backend's `.env` file.

## Development Notes

- Protected routes require JWT token (stored in localStorage)
- Token is automatically added to requests via axios interceptor
- Image preview fetches base64 encoded images from backend
- Edit dialog supports dynamic meal management
# admin-inter
