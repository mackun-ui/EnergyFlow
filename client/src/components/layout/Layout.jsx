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
  },
  main: {
    marginLeft: '240px',
    flex: 1,
    padding: '32px',
    background: '#F5F5F5',
    minHeight: '100vh',
  },
};

export default Layout;