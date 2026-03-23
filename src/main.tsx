import { createRoot } from "react-dom/client";
import { Component, ErrorInfo, ReactNode } from "react";
import App from "./App.tsx";
import "./index.css";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: string }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: '' };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('React Error:', error, info.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: 'center', background: '#1a1a2e', color: '#eee', minHeight: '100vh', fontFamily: 'Cairo, sans-serif' }} dir="rtl">
          <h1 style={{ color: '#f59e0b', fontSize: 24 }}>حدث خطأ في التطبيق</h1>
          <p style={{ marginTop: 16, color: '#aaa' }}>{this.state.error}</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: 24, padding: '10px 24px', background: '#f59e0b', color: '#1a1a2e', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>
            إعادة تحميل
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
