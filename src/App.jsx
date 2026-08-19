import { Routes, Route } from "react-router-dom";
import { ProfileProvider } from "./context/ProfileContext.jsx";
import { NexaDrawerProvider } from "./context/NexaDrawerContext.jsx";
import { SavedProvider } from "./context/SavedContext.jsx";
import { ConnectionsProvider } from "./context/ConnectionsContext.jsx";
import { ConversationsProvider } from "./context/ConversationsContext.jsx";
import NavBar from "./components/NavBar.jsx";
import NexaDrawer from "./components/NexaDrawer.jsx";
import Landing from "./pages/Landing.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import Analysis from "./pages/Analysis.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import Discover from "./pages/Discover.jsx";
import OpportunityDetail from "./pages/OpportunityDetail.jsx";
import Saved from "./pages/Saved.jsx";
import Network from "./pages/Network.jsx";
import WomanDetail from "./pages/WomanDetail.jsx";
import Connections from "./pages/Connections.jsx";
import Nexa from "./pages/Nexa.jsx";
import PlaceholderRoute from "./pages/PlaceholderRoute.jsx";

// Routes: / -> /onboarding -> /analysis -> /dashboard, plus /profile, the
// Phase 3 /discover experience (/discover, /discover/:id, /saved), the
// Phase 4 women network (/network, /network/:id, /network/connections),
// the Phase 5 assistant (/nexa), and the remaining /roadmap placeholder.
export default function App() {
  return (
    <ProfileProvider>
      <SavedProvider>
        <ConnectionsProvider>
          <ConversationsProvider>
            <NexaDrawerProvider>
              <div id="nexa-app" style={{ minHeight: "100%" }}>
                <NavBar />
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/analysis" element={<Analysis />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/discover" element={<Discover />} />
                  <Route path="/discover/:id" element={<OpportunityDetail />} />
                  <Route path="/saved" element={<Saved />} />
                  <Route path="/network" element={<Network />} />
                  <Route path="/network/connections" element={<Connections />} />
                  <Route path="/network/:id" element={<WomanDetail />} />
                  <Route path="/nexa" element={<Nexa />} />
                  <Route path="/roadmap" element={<PlaceholderRoute route="roadmap" />} />
                </Routes>
                <NexaDrawer />
              </div>
            </NexaDrawerProvider>
          </ConversationsProvider>
        </ConnectionsProvider>
      </SavedProvider>
    </ProfileProvider>
  );
}
