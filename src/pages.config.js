import Dashboard from './pages/Dashboard';
import Deploy from './pages/Deploy';
import Documentation from './pages/Documentation';
import Editor from './pages/Editor';
import Examples from './pages/Examples';
import Generator from './pages/Generator';
import Pipelines from './pages/Pipelines';
import Scripts from './pages/Scripts';
import Templates from './pages/Templates';
import CodeAI from './pages/CodeAI';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Deploy": Deploy,
    "Documentation": Documentation,
    "Editor": Editor,
    "Examples": Examples,
    "Generator": Generator,
    "Pipelines": Pipelines,
    "Scripts": Scripts,
    "Templates": Templates,
    "CodeAI": CodeAI,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};