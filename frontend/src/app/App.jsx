import { useState } from 'react';
import Editor from './editor/editor.jsx';
import Login from './login/Login.jsx';

export default function App(){
    const [loggedIn, setLoggedIn] = useState(false);

    if (!loggedIn) {
        return <Login onLogin={() => setLoggedIn(true)} />;
    }

    return <Editor/>
}
