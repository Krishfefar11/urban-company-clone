import { createContext, useContext, useState, useEffect } from 'react'

const CITIES = ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Mumbai', 'Pune', 'Bengaluru', 'Delhi', 'Hyderabad']

const CityContext = createContext(null)

export const CityProvider = ({ children }) => {
  const [city, setCity] = useState(() => localStorage.getItem('uc_city') || 'Ahmedabad')

  useEffect(() => {
    localStorage.setItem('uc_city', city)
  }, [city])

  return (
    <CityContext.Provider value={{ city, setCity, cities: CITIES }}>
      {children}
    </CityContext.Provider>
  )
}

export const useCity = () => {
  const ctx = useContext(CityContext)
  if (!ctx) throw new Error('useCity must be used inside CityProvider')
  return ctx
}
