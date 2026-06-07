import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Landing } from "./pages/Landing";
import { Workspace } from "./pages/Workspace";
import { WorkspaceProvider } from "./context/WorkspaceContext";

function App() {
  return (
    <BrowserRouter>
      <WorkspaceProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </WorkspaceProvider>
    </BrowserRouter>
  );
}

export default App;
