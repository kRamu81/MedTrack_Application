import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleGoHome = () => {
    const basePath = window.location.pathname.includes("/MedTrack_Application")
      ? "/MedTrack_Application"
      : "/";
    window.location.href = basePath;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-surface text-primary">
          <div className="text-center space-y-4 p-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold">Something went wrong</h1>
            <p className="text-lg text-secondary max-w-md mx-auto">
              An unexpected error occurred. Please try refreshing the page or
              return to the homepage.
            </p>
            <button
              onClick={this.handleGoHome}
              className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
