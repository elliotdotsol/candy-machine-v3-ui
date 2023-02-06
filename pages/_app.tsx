import React from "react";
import "@solana/wallet-adapter-react-ui/styles.css";
import "../styles/globals.css";
import '../styles/modal.css';

const App = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

export default App; 
