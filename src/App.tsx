import { useEffect, useState } from 'react';
import * as api from './api'

import './App.css';
import { Alert, AlertTitle } from '@material-ui/lab';
import { Text, HBox, Spacer } from './elem';

import {  BrowserRouter, Routes, Route } from "react-router-dom";

import { Collapse } from '@material-ui/core';
import { Button } from '@mui/material';

import { MsgButton, NotificationMessage } from './types';
import UserEvents from './user-events';
import Admin from './admin';

function App(props:any) {

  const [user, setUser] = useState<string | null | undefined>(undefined);
  const [msg, setMsg] = useState<NotificationMessage | undefined>(undefined);
  const [connected, setConnected] = useState(false);
  const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight });


  useEffect(() => {
    function handleResize() {
      setWindowSize({ w: window.innerWidth, h: window.innerHeight })
    }

    window.addEventListener('resize', handleResize)

  }, [])

  const notify = {
    success: (body: string, title?: string) => {
      setMsg({ open: true, severity: "success", title, body, progress: false });
      setTimeout(() => setMsg(undefined), 5000);
    },
    error: (body: string, title?: string) => {
      setMsg({ open: true, severity: "error", title, body, progress: false });
      setTimeout(() => setMsg(undefined), 5000);

    },
    ask: (body: string, title: string, buttons: MsgButton[], details?: string) => {
      setMsg({ open: true, severity: "info", title, body, buttons, details, progress: false });
    },
    clear: () => {
      setMsg(undefined);
    },
    inProgress: () => setMsg({ progress: true, open: true }),
  }

  useEffect(() => {
    const success = api.initAPI(
      // Callback for AuthStateChanged
      (user) => {
        console.log("user:", JSON.stringify(user));
        setUser(user?.displayName);
      });
    if (success) {
      setConnected(true);
    }


    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  
  return (
    <div className="App">
      {msg && <Collapse in={msg.open} timeout={500} style={{ position: 'absolute', top: msg.top || 0, left: 0, right: 0, fontSize: 15, zIndex: 1000 }} >
        <Alert severity={msg.severity}>
          {msg.title ? <AlertTitle>{msg.title}</AlertTitle> : null}
          <Text>{msg.body}</Text>
          {msg.details ? msg.details.split("\n").map(d => <Text fontSize={15}>{d}</Text>) : null}
          {msg.details ? <Spacer height={10} /> : null}
          {msg.buttons && msg.buttons.length > 0 ?
            <HBox>
              {msg.buttons.map(btn => ([
                <Spacer key={1} width={20} />,
                <Button key={2} variant="contained" onClick={() => {
                  setMsg(undefined);
                  btn.callback();
                }}>{btn.caption}</Button>
              ])
              )}
            </HBox> : null}
        </Alert>
      </Collapse>}

      <BrowserRouter>
        <Routes>
          <Route path="/admin" element={<Admin connected={connected} notify={notify} user={user}/>} />
          <Route path="/" element={<UserEvents windowSize={windowSize} connected={connected} notify={notify} user={user}/>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
