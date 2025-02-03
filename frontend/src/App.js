import React from 'react';
import Piano from './Components/Piano';

function App() {
  return (
    <div style={{ backgroundColor: '#f0f0f0', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Barra de Navegación */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#2c3e50',
        padding: '10px 20px',
        color: '#fff',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src="/logo-removebg-preview.png"  // Ruta corregida
            alt="Logo de Kibotech" 
            style={{ width: '40px', height: '40px', marginRight: '10px', borderRadius: '50%' }} 
          />
          <h2 style={{ margin: 0, fontSize: '20px' }}>Kibotech</h2>
        </div>
      </nav>

      {/* Contenido Principal */}
      <div style={{ textAlign: 'center', padding: '20px', flex: '1' }}>
        <h1 style={{ color: '#333', marginBottom: '20px' }}>🎹 Piano Visual Interactivo 🎶</h1>
        <Piano />
      </div>

      {/* Pie de página con derechos de autor */}
      <footer style={{ padding: '10px', backgroundColor: '#333', color: '#fff', textAlign: 'center' }}>
        © {new Date().getFullYear()} Kibotech. Todos los derechos reservados.
      </footer>
    </div>
  );
}

export default App;
