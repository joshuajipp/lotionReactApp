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

const sessionTimeoutDuration = 300000;
function App() {
  const [isNoteVisable, setVisability] = React.useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  let sessionTimeoutId;
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      setIsLoggedIn(true);
    }
  }, []);

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
          sessionTimeoutId = setTimeout(() => {
            setUser(null);
            setIsLoggedIn(false);
            setProfile(null);
            localStorage.removeItem("user");
            console.log("Session timed out");
          }, sessionTimeoutDuration);
        })
        .catch((err) => console.log(err));
    }
    return () => clearTimeout(sessionTimeoutId);
  }, [user]);

  // log out function to log the user out of google and set the profile array to null
  const logOut = () => {
    googleLogout();
    setProfile(null);
    setIsLoggedIn(false);
    clearTimeout(sessionTimeoutId);
    localStorage.removeItem("user");
  };

  const onSuccess = (codeResponse) => {
    setUser(codeResponse);
    setIsLoggedIn(true);
    localStorage.setItem("user", JSON.stringify(codeResponse));
  };

  const login = useGoogleLogin({
    onSuccess,
    onError: (error) => console.log("Login Failed:", error),
  });

  function hideItem() {
    setVisability(!isNoteVisable);
  }
  console.log(user);
  return (
    <div className="body">
      {profile == null ? (
        <div>
          <LoginPage />
          <div className="login-content">
            <div>
              <button className="login-button" onClick={() => login()}>
                Sign in with Google 🚀{" "}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <Navigation
            toggleNotes={hideItem}
            profile={profile}
            logOut={logOut}
          />
          <BrowserRouter>
            <Routes>
              <Route
                path="/"
                element={
                  <BodyContent
                    user={user}
                    profile={profile}
                    isVisable={isNoteVisable}
                  />
                }
              />
              <Route
                path="/notes"
                element={
                  <BodyContent
                    user={user}
                    profile={profile}
                    isVisable={isNoteVisable}
                  />
                }
              />
              <Route
                path="/notes/:activeNoteParam"
                element={
                  <BodyContent
                    user={user}
                    profile={profile}
                    isVisable={isNoteVisable}
                  />
                }
              />
              <Route
                path="/notes/:activeNoteParam/:editParam"
                element={
                  <BodyContent
                    user={user}
                    profile={profile}
                    isVisable={isNoteVisable}
                  />
                }
              />
            </Routes>
          </BrowserRouter>
        </>
      )}
    </div>
  );
}

export default App;
