# Media Library Dashboard

A modern, full-featured media management dashboard built with Next.js 16, featuring advanced file
upload, preview, editing, and organization capabilities.

## ✨ Features

- **📤 Media Upload**: Drag-and-drop file upload with React Dropzone
- **🖼️ Media Gallery**: Grid and single view layouts with virtual scrolling
- **👁️ Preview & Download**: Built-in media preview with download functionality
- **✏️ Edit & Delete**: Manage media files with edit and delete operations
- **🎯 Media Picker**: Reusable media picker component for selecting files
- **🌓 Theme Support**: Dark/light mode with next-themes
- **📱 Responsive Design**: Mobile-first responsive UI
- **🔄 State Management**: Redux Toolkit with RTK Query for efficient data fetching
- **🎨 Modern UI**: shadcn/ui components with Radix Nova style
- **✅ Form Validation**: React Hook Form with Zod schema validation

## 🛠️ Tech Stack

### Core

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Package Manager**: [pnpm](https://pnpm.io/)

### UI & Styling

- **Component Library**: [shadcn/ui](https://ui.shadcn.com/) (Radix Nova)
- **CSS Framework**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: tw-animate-css
- **Theme**: next-themes

### State & Data Management

- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **API Layer**: RTK Query
- **React Integration**: react-redux

### Forms & Validation

- **Form Handling**: [React Hook Form](https://react-hook-form.com/)
- **Validation**: [Zod](https://zod.dev/)
- **Resolver**: @hookform/resolvers

### Additional Libraries

- **File Upload**: react-dropzone
- **Virtual Scrolling**: @tanstack/react-virtual
- **Notifications**: Sonner
- **UI Primitives**: @base-ui/react, radix-ui

## 📁 Project Structure

```
dashboard/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Home page (Media Template)
│   │   └── globals.css           # Global styles
│   ├── components/               # Reusable UI components
│   │   └── ui/                   # shadcn/ui components
│   ├── templates/                # Feature templates
│   │   └── Media/                # Media management feature
│   │       ├── Components/       # Media-specific components
│   │       ├── Contexts/         # React Context providers
│   │       ├── Hooks/            # Custom hooks
│   │       ├── Redux/            # Redux slices & API
│   │       ├── Types/            # TypeScript definitions
│   │       ├── Utils/            # Utility functions
│   │       └── Validators/       # Zod schemas
│   ├── redux/                    # Redux store configuration
│   ├── lib/                      # Shared utilities
│   ├── core/                     # Core configuration
│   └── providers/                # React providers
├── public/                       # Static assets
└── @types/                       # Custom type definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd dashboard
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_API_URL=your_api_url
   NEXT_PUBLIC_FRONTEND_URL=your_frontend_url
   ```

4. **Run the development server**

   ```bash
   pnpm dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 📜 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier

## 🎨 Component Architecture

### Media Template Structure

The media library follows a modular architecture:

```
Media/
├── MediaTemplate.tsx           # Main template container
├── MediaPicker.tsx             # Media picker component
├── Components/
│   ├── MediaGridView.tsx       # Grid layout view
│   ├── MediaSingleView.tsx     # Single item view
│   ├── MediaUploaderBox.tsx    # Upload interface
│   ├── MediaPreview.tsx        # Media preview
│   ├── MediaEditModal.tsx      # Edit modal
│   └── MediaDeleteAlert.tsx    # Delete confirmation
├── Contexts/
│   └── MediaContext.tsx        # Media state context
├── Redux/
│   └── MediaAPISlice.ts        # RTK Query API
└── Hooks/
    └── useMediaDownload.ts     # Download functionality
```

## 🔧 Configuration Files

- `next.config.ts` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `components.json` - shadcn/ui configuration
- `eslint.config.mjs` - ESLint configuration
- `postcss.config.mjs` - PostCSS configuration

## 🌐 Environment Variables

| Variable                   | Description     | Required |
| -------------------------- | --------------- | -------- |
| `NEXT_PUBLIC_API_URL`      | Backend API URL | ✅       |
| `NEXT_PUBLIC_FRONTEND_URL` | Frontend URL    | ✅       |

## 🎯 Key Features Explained

### Media Upload

- Drag-and-drop interface powered by react-dropzone
- Multiple file support
- Upload progress tracking
- File type validation

### Media Management

- View uploaded media in grid or single view
- Preview images and videos
- Download media files
- Edit media metadata
- Delete media with confirmation

### State Management

- Centralized state with Redux Toolkit
- Efficient data fetching with RTK Query
- Optimistic updates for better UX
- Automatic cache invalidation

## 📚 Learn More

### Next.js Resources

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - Interactive Next.js tutorial
- [Next.js GitHub](https://github.com/vercel/next.js) - Contribute to Next.js

### UI/Component Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/)

### State Management Resources

- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [RTK Query Documentation](https://redux-toolkit.js.org/rtk-query/overview)

## 🚢 Deployment

### Deploy on Vercel

The easiest way to deploy this Next.js app is using [Vercel](https://vercel.com):

1. Push your code to GitHub/GitLab/Bitbucket
2. Import your repository to Vercel
3. Configure environment variables
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

For more details, check the
[Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

### Other Deployment Options

This application can be deployed on any platform that supports Node.js:

- [Netlify](https://www.netlify.com/)
- [AWS Amplify](https://aws.amazon.com/amplify/)
- [Digital Ocean](https://www.digitalocean.com/)
- [Railway](https://railway.app/)
- Self-hosted with Docker

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

Your Name / Team Name

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components
- [Redux Toolkit](https://redux-toolkit.js.org/) - State management
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

---

**Built with ❤️ using Next.js and TypeScript**
