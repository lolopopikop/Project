import './App.css';
import Header from "./components/Header/Header.jsx";
import ProductsCatalog from './components/ProductsCatalog/ProductsCatalog';

function App() {
    return (
        <div className="App">
            <Header />
            <div className="main-content">
                <ProductsCatalog />
            </div>
        </div>
    );
}

export default App;