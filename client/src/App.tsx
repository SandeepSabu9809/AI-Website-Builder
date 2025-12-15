import React from 'react'
import { Routes, Route } from 'react-router-dom';
import Projects from './pages/Projects';
import Pricing from './pages/Pricing';
import Preview from './pages/Preview';
import MyProjects from './pages/MyProjects';
import Home from './pages/Home';
import Community from './pages/Community';
import View from './pages/View';

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} /> 
        <Route path="/projects/:projectId" element={<Projects />} />
        <Route path="/projects" element={<MyProjects />} />
        <Route path="/preview/:projectId" element={<Preview />} />
        <Route path="/preview/:projectId/:versionId" element={<Preview />} />
        <Route path="/community" element={<Community />} />
        <Route path="/view/:projectId" element={<View />} />
      </Routes>      
    </div>
  )
}

export default App
