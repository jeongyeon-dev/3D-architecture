import { useState } from 'react';
import "./App.css";

import Editor from './editor/editor.jsx';
import Login from './login/Login.jsx';
import Community from './community/Community.jsx';

export default function App(){
    const [loggedIn, setLoggedIn] = useState(false);

    if (!loggedIn) {
        return (
            <div className='home-layout'>
                <Login onLogin={() => setLoggedIn(true)} />
                <Community />
            </div>
        )
        
    }

    return <Editor/>
}
