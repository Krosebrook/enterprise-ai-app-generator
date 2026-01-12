import Dashboard from './pages/Dashboard';
import Generator from './pages/Generator';
import Templates from './pages/Templates';
import Examples from './pages/Examples';
import Documentation from './pages/Documentation';
import Scripts from './pages/Scripts';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Generator": Generator,
    "Templates": Templates,
    "Examples": Examples,
    "Documentation": Documentation,
    "Scripts": Scripts,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};