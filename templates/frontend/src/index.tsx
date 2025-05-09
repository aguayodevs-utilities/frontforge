import React from 'react';
import { createRoot } from 'react-dom/client';  
import { CustomLayout, appTheme } from '@aguayodevs-utilities/preact-shared';
import { TestComponent } from './components/TestComponent';
import { ThemeProvider } from '@mui/material/styles';
import "@aguayodevs-utilities/preact-shared/dist/static/css/base.css"; // importa css: estilos, variables, fuentes, etc. base
import "./style.css";

const App = () => {
  return (
    
    <ThemeProvider theme={appTheme}>
      <CustomLayout>
          <TestComponent />
      </CustomLayout>
    </ThemeProvider>
  );
};

createRoot(document.getElementById('app')!).render(<App />);