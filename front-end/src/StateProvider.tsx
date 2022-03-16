import React, { createContext, useState, useContext, Dispatch } from "react"

const AppContext = createContext({
  filterType: "first_name",
  sortType: "asc",
  searchText: "",
  setFilterType: {} as Dispatch<any>,
  setSortType: {} as Dispatch<any>,
  setSearchText: {} as Dispatch<any>,
})

const AppStateProvider: React.FC = ({ children }) => {
  const [filterType, setFilterType] = useState<string>("first_name")
  const [sortType, setSortType] = useState<string>("asc")
  const [searchText, setSearchText] = useState<any>("")
  return <AppContext.Provider value={{ searchText, setSearchText, filterType, setFilterType, sortType, setSortType }}>{children}</AppContext.Provider>
}

export const useAppState = () => {
  const context = useContext(AppContext)
  return context
}

export { AppContext, AppStateProvider }