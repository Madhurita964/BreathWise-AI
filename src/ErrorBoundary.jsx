import React from 'react';
export default class ErrorBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <main style={{ maxWidth: 600, margin: '15vh auto', padding: 30 }}>
          <h1>Let’s get your view back.</h1>
          <p style={{ marginTop: 20 }}>
            The interface encountered an unexpected problem. Your saved preferences are
            still on this device.
          </p>
          <button className="button" onClick={() => window.location.reload()}>
            Reload Breathewise
          </button>
        </main>
      );
    return this.props.children;
  }
}
