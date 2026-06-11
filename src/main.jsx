import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { HelmetProvider } from 'react-helmet-async'
import { queryClient } from './lib/queryClient'
import AppRouter from './routes/AppRouter'
import ErrorBoundary from './components/common/ErrorBoundary'
import { CityProvider } from './context/CityContext'
import { WishlistProvider } from './context/WishlistContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <CityProvider>
          <QueryClientProvider client={queryClient}>
            <WishlistProvider>
              <AppRouter />
            </WishlistProvider>
            {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
          </QueryClientProvider>
        </CityProvider>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
