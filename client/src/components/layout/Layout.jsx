import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div style={styles.container}>
      <Sidebar />
      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: '#0A0F1E',
  },
  main: {
    marginLeft: '240px',
    flex: 1,
    padding: '32px',
    background: '#0A0F1E',
    minHeight: '100vh',
  },
};

export default Layout;