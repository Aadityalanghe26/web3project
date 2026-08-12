import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Web3Provider } from './context/Web3Context';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { VerificationPage } from './pages/VerificationPage';
import { IssuerDashboard } from './pages/IssuerDashboard';
import { StudentDashboard } from './pages/StudentDashboard';

export const App: React.FC = () => {
  return (
    <Web3Provider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white bg-hero-pattern">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<VerificationPage />} />
              <Route path="/verify" element={<VerificationPage />} />
              <Route path="/issue" element={<IssuerDashboard />} />
              <Route path="/student" element={<StudentDashboard />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </Web3Provider>
  );
};

export default App;
