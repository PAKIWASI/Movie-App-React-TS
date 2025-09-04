# Wasi's Movie App 🎬

A modern, responsive movie discovery application built with React and TypeScript. Browse popular movies, search for your favorites, and manage your personal collection with favorites and watchlist features.

https://github.com/user-attachments/assets/77d26520-cbbf-45f6-ad3c-b56966f1749f

## Features

- **Movie Discovery**: Browse popular movies with beautiful, interactive cards
- **Advanced Search**: Search for any movie using TMDB's extensive database
- **Detailed Movie Info**: View comprehensive movie details including cast, budget, revenue, and production companies
- **Favorites System**: Add/remove movies to your personal favorites collection
- **Watchlist Management**: Save movies you want to watch later
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern UI**: Glassmorphism design with smooth animations and hover effects
- **Persistent Storage**: Your favorites and watchlist are saved locally

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Routing**: React Router DOM
- **Styling**: CSS Modules with modern CSS features
- **API**: The Movie Database (TMDB) API
- **State Management**: React Context API
- **Storage**: Local Storage for persistence
- **Build Tool**: Vite

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- TMDB API Key (free registration required)

## Installation

1. **Clone the repository**
   ```bash
   git clone <https://github.com/PAKIWASI/Movie-App-React-TS>
   cd movie-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_TMDB_API_KEY=your_api_key_here
   ```
   
   Get your free API key from [The Movie Database (TMDB)](https://www.themoviedb.org/settings/api)

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173` to view the application

## Project Structure

```
src/
├── components/
│   ├── MovieCard.tsx          # Individual movie card component
│   ├── MovieCard.module.css   # Movie card styles
│   ├── Navbar.tsx            # Navigation component
│   └── Navbar.module.css     # Navigation styles
├── contexts/
│   └── MovieContext.tsx      # Global state management
├── pages/
│   ├── Home.tsx              # Homepage with search and popular movies
│   ├── Home.module.css       # Homepage styles
│   ├── Favorites.tsx         # Favorites page
│   ├── Favorites.module.css  # Favorites page styles
│   ├── Watchlist.tsx         # Watchlist page
│   ├── MovieDetail.tsx       # Detailed movie view
│   └── MovieDetail.module.css # Movie detail styles
├── services/
│   └── api.ts               # TMDB API integration
├── types.ts                 # TypeScript type definitions
└── App.tsx                  # Main application component
```

## API Integration

The application uses The Movie Database (TMDB) API to fetch movie data:

- **Popular Movies**: Fetches trending movies for the homepage
- **Movie Search**: Allows users to search through TMDB's movie database
- **Movie Details**: Retrieves comprehensive information about individual movies

## Features in Detail

### Movie Cards
- Hover animations with image scaling and glow effects
- Heart icon for favorites (filled/empty states)
- Bookmark icon for watchlist items
- Click to navigate to detailed movie view

### Movie Details Page
- Hero section with backdrop image and movie poster
- Complete movie information including runtime, budget, revenue
- Production company logos and details
- Add/remove from favorites functionality
- Responsive design for all screen sizes

### State Management
- React Context API for global state
- Persistent storage using localStorage
- Separate management for favorites and watchlist
- Error handling for storage operations

## Responsive Design

The application is fully responsive with breakpoints for:
- **Desktop**: Full-width layout with grid displays
- **Tablet**: Adjusted spacing and card sizes
- **Mobile**: Single-column layout with touch-optimized interactions

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Performance Features

- Lazy loading of movie images
- Efficient state updates with React Context
- CSS animations using hardware acceleration
- Optimized API calls with error handling

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- TypeScript for type safety
- CSS Modules for component-scoped styling
- Modern CSS features (Grid, Flexbox, Custom Properties)
- Consistent component architecture

## Acknowledgments

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for the movie data API
- [React](https://reactjs.org/) for the frontend framework
- [Vite](https://vitejs.dev/) for the build tool

## Contact

For questions or support, please open an issue on GitHub.

---

**Note**: This application is for educational purposes. Movie data and images are provided by TMDB under their terms of service.
