import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Favorites from "./pages/Favorites";
import MovieDetail from "./pages/MovieDetail";
import Watchlist from "./pages/Watchlist.tsx";
import Navbar from "./Components/Navbar";
import { MovieProvider } from "./contexts/MovieContext";


function App() {


   return(
        <MovieProvider>

            <Navbar/>
            <main className="mainContent">
                <Routes>
                    <Route path="/" element={<Home/>} />
                    <Route path="/favorites" element={<Favorites/>} />
                    <Route path="/watchlist" element={<Watchlist/>} />
                    <Route path="/movie/:id" element={<MovieDetail/>} />
               </Routes>
            </main>

        </MovieProvider>
    );
};
export default App;
