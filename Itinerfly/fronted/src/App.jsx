import React, { useState } from "react";
import Navbar from "./components/layout/Navbar";
import HomePage from "./Pages/Homepage";
import WidgetsPage from "./Pages/WidgetsPage";
import BaggageModal from "./components/baggage/BaggageModal";

export default function App() {
  const [activePage, setActivePage] = useState("itinerary");
  const [showBaggage, setShowBaggage] = useState(false);
  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fe", fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar activePage={activePage} onNavigate={setActivePage} onBaggageClick={() => setShowBaggage(true)} isAMW={true} />
      <main>
        {activePage === "itinerary" && <HomePage />}
        {activePage === "widgets"   && <WidgetsPage />}
      </main>
      {showBaggage && <BaggageModal onClose={() => setShowBaggage(false)} />}
    </div>
  );
}
