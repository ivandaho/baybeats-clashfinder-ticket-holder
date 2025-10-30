import "./App.css";
import Clashfinder from "./components/clashfinder/Clashfinder";

function App() {
  // useEffect(() => {
  //   for (let i = 0; i <= localStorage.length; i++) {
  //     const data = localStorage.getItem(localStorage.key(i) || "");
  //     if (typeof data === "string" && !isNaN(parseInt(data))) {
  //       // number parsed is an actual number
  //     }
  //   }
  // }, []);
  return <Clashfinder />;
}

export default App;
