import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";


function App() {
    return (
        <div>
            <Navbar />
            <main className="px-6 py-6 max-w-7xl mx-auto">
                <Routes>
                    <Route path="/" element={<Home />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
