import React, {Suspense} from 'react';

import './assets/scss/themes.scss';

import Route from './Routes';
import ErrorBoundary from './Components/ErrorBoundary'

function MyErrorBoundaryFallback({errorMessage, errorStatus}) {
    return (
        <div>
            <h1>Error</h1>
            <div>
                Error Status: <b>{errorStatus}</b>
            </div>
            <div>
                ErrorMessage: <b>{errorMessage}</b>
            </div>
        </div>
    );
}

function App() {
    return (
        <ErrorBoundary fallback={<MyErrorBoundaryFallback/>}>
            <Suspense fallback={<div>Loading..</div>}>
                <Route/>
            </Suspense>
        </ErrorBoundary>
    );
}

export default App;
