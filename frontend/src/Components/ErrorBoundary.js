import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {hasError: false};
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return {hasError: true, message: error?.message, status: error?.status};
    }

    render() {
        function addExtraProps(Component, extraProps) {
            return <Component.type {...Component.props} {...extraProps} />;
        }

        if (this.state.hasError) {
            return addExtraProps(this.props.fallback, {
                errorMessage: this.state.message,
                errorStatus: this.state.status,
            });
        }
        return this.props.children;
    }
}

export default ErrorBoundary;