import BackgroundParticles from './components/BackgroundParticles';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import StatsGrid from './components/StatsGrid';
import WizardForm from './components/WizardForm';
import Dashboard from './components/Dashboard';
import EquipmentTable from './components/EquipmentTable';
import PipelineSteps from './components/PipelineSteps';
import Footer from './components/Footer';

function App() {
  return (
    <div className="relative min-h-screen text-white font-sans overflow-hidden bg-bg-dark selection:bg-accent-cyan/30 selection:text-white">
      {/* Interactive Canvas backdrop */}
      <BackgroundParticles />
      
      {/* Top navigation */}
      <Navbar />
      
      {/* Main content flow */}
      <main className="relative z-10">
        <Hero />
        <StatsGrid />
        <WizardForm />
        <Dashboard />
        <EquipmentTable />
        <PipelineSteps />
      </main>
      
      {/* Metrology credit and regulations info */}
      <Footer />
    </div>
  );
}

export default App;
