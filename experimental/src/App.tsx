import React from 'react';
import './App.css';
import {EventList} from "./components/EventList";

function App() {
    return (
        <div>
            <header className="App-header">
                Oracle-MMA POC
            </header>
            <main>
                <EventList/>
            </main>
        </div>
    );
}

export default App;
