import "./App.css";
import Clashfinder from "./components/clashfinder/Clashfinder";
import { GRADIENT_BG_CSS } from "./utils/clashfinder";
import cx from "./utils/cx";

function App() {
  // useEffect(() => {
  //   for (let i = 0; i <= localStorage.length; i++) {
  //     const data = localStorage.getItem(localStorage.key(i) || "");
  //     if (typeof data === "string" && !isNaN(parseInt(data))) {
  //       // number parsed is an actual number
  //     }
  //   }
  // }, []);
  return (
    <div
      className={cx(
        "w-full bg-lime-500/20 w-screen overflow-y-auto flex justify-center",
        GRADIENT_BG_CSS,
      )}
    >
      <Clashfinder />
    </div>
  );
}

export default App;
