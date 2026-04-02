import Home from "./pages/Home";
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import { Route, Routes } from "react-router-dom";


function App() {
    return (
        <div>
            <Navbar />
            <main className="px-6 py-6 max-w-7xl mx-auto">
                <Routes>
                    <Route path="/"       element={<Home />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="*"       element={<NotFound />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
