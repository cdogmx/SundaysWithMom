import Home from './pages/Home';
import Directory from './pages/Directory';
import Events from './pages/Events';
import LocationDetail from './pages/LocationDetail';
import AddLocation from './pages/AddLocation';
import AddEvent from './pages/AddEvent';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import NotificationSettings from './pages/NotificationSettings';
import OrganizerProfile from './pages/OrganizerProfile';
import Messages from './pages/Messages';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Directory": Directory,
    "Events": Events,
    "LocationDetail": LocationDetail,
    "AddLocation": AddLocation,
    "AddEvent": AddEvent,
    "Profile": Profile,
    "Admin": Admin,
    "NotificationSettings": NotificationSettings,
    "OrganizerProfile": OrganizerProfile,
    "Messages": Messages,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};