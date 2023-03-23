import React from "react";
import { useState, useEffect } from "react";
import Navigation from "./Navigation";
import BodyContent from "./BodyContent";
import LoginPage from "./LoginPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  useGoogleLogin,
  googleLogout,
} from "@react-oauth/google";
import axios from "axios";

function App() {
  const [isNoteVisable, setVisability] = React.useState(true);

  const [user, setUser] = useState([]);
  const [profile, setProfile] = useState(null);

  console.log(profile);
  const login = useGoogleLogin({
    onSuccess: (codeResponse) => setUser(codeResponse),
    onError: (error) => console.log("Login Failed:", error),
  });

  useEffect(() => {
    if (user) {
      axios
        .get(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`,
          {
            headers: {
              Authorization: `Bearer ${user.access_token}`,
              Accept: "application/json",
            },
          }
        )
        .then((res) => {
          setProfile(res.data);
          console.log(res.data);
        })
        .catch((err) => console.log(err));
    }
  }, [user]);

  // log out function to log the user out of google and set the profile array to null
  const logOut = () => {
    googleLogout();
    setProfile(null);
  };

  function hideItem() {
    setVisability(!isNoteVisable);
  }
  console.log(user)
  return (
    <div className="body">
      {profile == null ? (
        <div>
          <LoginPage/>
          <div className="login-content">
            <div>
             <button className="login-button" onClick={() => login()}>Sign in with Google 🚀 </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <Navigation toggleNotes={hideItem} profile={profile} logOut={logOut}/>
          <BrowserRouter>
            <Routes>
              <Route
                path="/"
                element={<BodyContent profile={profile} isVisable={isNoteVisable} />}
              />
              <Route
                path="/notes"
                element={<BodyContent profile={profile} isVisable={isNoteVisable} />}
              />
              <Route
                path="/notes/:activeNoteParam"
                element={<BodyContent profile={profile} isVisable={isNoteVisable} />}
              />
              <Route
                path="/notes/:activeNoteParam/:editParam"
                element={<BodyContent profile={profile} isVisable={isNoteVisable} />}
              />
            </Routes>
          </BrowserRouter>
        </>
      )}
    </div>
  );
}

export default App;
