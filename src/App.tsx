import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "@/pages/Home";

const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

export default function App() {
  return (
    <Router basename={basename}>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}
