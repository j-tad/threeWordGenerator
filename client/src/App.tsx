import { Switch, Route } from "wouter";
import MainPage from "./pages/MainPage";
import ProfilePage from "./pages/ProfilePage";
import AuthPage from "./pages/AuthPage";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <>
      <Switch>
        <Route path="/" component={MainPage} />
        <Route path="/login" component={AuthPage} />
        <Route path="/:username" component={ProfilePage} />
      </Switch>
      <Toaster />
    </>
  );
}

export default App;
