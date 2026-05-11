import { QueryProvider } from './providers/query/QueryProvider';
import { ThemeProvider } from './providers/theme';
import { AppRouter } from './providers/router';
import '../index.css';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryProvider>
        <AppRouter />
      </QueryProvider>
    </ThemeProvider>
  );
}

export default App;
