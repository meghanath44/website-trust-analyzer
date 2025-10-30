import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Components/Home'
import Result from './Components/Result'

function App() {

  return (
    (<Router>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path='/result' element={<Result/>}/>
      </Routes>
    </Router>)
  )
}

export default App
