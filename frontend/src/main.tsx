import './index.css'
import App from './App.tsx'
// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { UserProvider } from './contexts/UserContext'
import { CollectionProvider } from './contexts/CollectionContext.tsx'


createRoot(document.getElementById('root')!).render(
    // <StrictMode>
        <BrowserRouter>
            <UserProvider>
                <CollectionProvider>
                    <App />
                </CollectionProvider>
            </UserProvider>
        </BrowserRouter>
    // </StrictMode>,
)
