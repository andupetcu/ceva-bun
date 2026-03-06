import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import { Landing } from './pages/Landing'
import { ChooseBudget } from './pages/ChooseBudget'
import { Listing } from './pages/Listing'
import { ProductDetail } from './pages/ProductDetail'

const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/alege', element: <ChooseBudget /> },
  { path: '/toate', element: <Listing /> },
  { path: '/produs/:id', element: <ProductDetail /> },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
