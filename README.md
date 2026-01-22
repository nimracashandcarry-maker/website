# Nimra Shop - E-commerce Application

A modern, full-stack e-commerce application built with Next.js, Supabase, Tailwind CSS, and shadcn/ui.

## Features

### Public Features
- 🏠 **Home Page** - Displays featured categories
- 📦 **Products Listing** - Browse all available products
- 🏷️ **Category Pages** - View products by category
- 🔍 **Product Details** - Detailed product information with images

### Admin Features
- 🔐 **Admin Authentication** - Secure login with Supabase Auth
- 📊 **Dashboard** - Overview of categories and products
- 🏷️ **Category Management** - Full CRUD operations for categories
- 📦 **Product Management** - Full CRUD operations for products
- 🛡️ **Protected Routes** - Role-based access control

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Form Validation**: React Hook Form + Zod
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Nimra_Shop
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the SQL script from `supabase/schema.sql`
   - This will create the necessary tables and policies

5. **Set up admin user**
   - In Supabase Dashboard, go to Authentication > Users
   - Create a new user or use an existing one
   - Update the user's metadata to include `role: "admin"`:
     ```json
     {
       "role": "admin"
     }
     ```
   - You can do this via SQL:
     ```sql
     UPDATE auth.users
     SET raw_user_meta_data = jsonb_set(
       COALESCE(raw_user_meta_data, '{}'::jsonb),
       '{role}',
       '"admin"'
     )
     WHERE id = '<user-id>';
     ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/              # Admin dashboard pages
│   │   ├── category/           # Category pages
│   │   ├── products/           # Product pages
│   │   └── layout.tsx          # Root layout
│   ├── components/             # React components
│   │   ├── admin/              # Admin-specific components
│   │   └── ui/                 # shadcn/ui components
│   ├── lib/                    # Utility functions
│   │   ├── actions/            # Server actions
│   │   ├── supabase/           # Supabase clients
│   │   └── utils.ts            # Utility functions
│   └── types/                  # TypeScript types
├── supabase/
│   └── schema.sql              # Database schema
├── middleware.ts               # Next.js middleware for auth
└── components.json             # shadcn/ui configuration
```

## Database Schema

### Categories Table
- `id` (UUID, Primary Key)
- `name` (VARCHAR)
- `slug` (VARCHAR, Unique)
- `created_at` (TIMESTAMP)

### Products Table
- `id` (UUID, Primary Key)
- `name` (VARCHAR)
- `slug` (VARCHAR, Unique)
- `description` (TEXT)
- `price` (DECIMAL)
- `image_url` (TEXT)
- `category_id` (UUID, Foreign Key)
- `created_at` (TIMESTAMP)

## Admin Routes

- `/admin` - Dashboard
- `/admin/login` - Admin login
- `/admin/categories` - Manage categories
- `/admin/categories/new` - Create category
- `/admin/categories/[id]/edit` - Edit category
- `/admin/products` - Manage products
- `/admin/products/new` - Create product
- `/admin/products/[id]/edit` - Edit product

## Public Routes

- `/` - Home page
- `/products` - All products
- `/products/[slug]` - Product detail page
- `/category/[slug]` - Category page

## Features in Detail

### Authentication
- Uses Supabase Auth for authentication
- Role-based access control (admin role required)
- Protected admin routes via middleware
- Session management with server and client components

### Data Fetching
- Server Components for initial data loading
- Server Actions for mutations (create, update, delete)
- Automatic revalidation after mutations
- Optimistic updates where applicable

### Form Validation
- Zod schemas for type-safe validation
- React Hook Form for form state management
- Client-side and server-side validation
- User-friendly error messages

### UI/UX
- Responsive design with Tailwind CSS
- shadcn/ui components for consistent UI
- Loading and error states
- Confirmation dialogs for destructive actions

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Components

To add new shadcn/ui components:
```bash
npx shadcn@latest add [component-name]
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables

Make sure to set these in your deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Security Notes

- Row Level Security (RLS) is enabled on all tables
- Public read access for categories and products
- Admin-only write access (enforced via RLS policies)
- Admin routes are protected by middleware
- User role is checked in both middleware and server actions

## Future Enhancements

- [ ] Image upload to Supabase Storage
- [ ] Shopping cart functionality
- [ ] User authentication for customers
- [ ] Order management
- [ ] Payment integration
- [ ] Search functionality
- [ ] Product filtering and sorting
- [ ] Pagination

## License

This project is open source and available under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.



++++++++ things to do ++++++++
forgot password not working 
email setup not working 
order items is not showing up 
responsive ness 
emplyees can create new customers 

