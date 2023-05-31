// import "./App.css"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { CreateGroup } from "./components/CreateGroup"
import { AddMembers } from "./components/AddMembers"
import { ExpenseMain } from "./components/ExpenseMain"
import { RecoilRoot } from "recoil"
import "bootstrap/dist/css/bootstrap.min.css"

function App() {
  return (
    <BrowserRouter> 
      <RecoilRoot>
        <Routes>
          <Route path ="" element={<CreateGroup/>}/>
          <Route path ="/add" element={<AddMembers/>}/>
          <Route path ="" element={<ExpenseMain/>}/>
        </Routes>
      </RecoilRoot>
    </BrowserRouter>
  );
}

export default App;
