import Dashboard from './pages/Dashboard';
import Generator from './pages/Generator';
import Templates from './pages/Templates';
import Examples from './pages/Examples';
import Documentation from './pages/Documentation';
import Scripts from './pages/Scripts';
import Pipelines from './pages/Pipelines';
import Editor from './pages/Editor';
import Deploy from './pages/Deploy';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Generator": Generator,
    "Templates": Templates,
    "Examples": Examples,
    "Documentation": Documentation,
    "Scripts": Scripts,
    "Pipelines": Pipelines,
    "Editor": Editor,
    "Deploy": Deploy,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};