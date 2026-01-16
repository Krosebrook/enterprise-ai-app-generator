import { lazy } from 'react';
import __Layout from './Layout.jsx';

/**
 * Lazy-loaded page components for code splitting and performance optimization
 * Each page is loaded only when navigated to, reducing initial bundle size
 */
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Deploy = lazy(() => import('./pages/Deploy'));
const Documentation = lazy(() => import('./pages/Documentation'));
const Editor = lazy(() => import('./pages/Editor'));
const Examples = lazy(() => import('./pages/Examples'));
const Generator = lazy(() => import('./pages/Generator'));
const Pipelines = lazy(() => import('./pages/Pipelines'));
const Scripts = lazy(() => import('./pages/Scripts'));
const Templates = lazy(() => import('./pages/Templates'));
const CodeAI = lazy(() => import('./pages/CodeAI'));

/**
 * Pages configuration object mapping route names to lazy-loaded components
 * @type {Object.<string, React.LazyExoticComponent>}
 */
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

/**
 * Main pages configuration
 * @typedef {Object} PagesConfig
 * @property {string} mainPage - Default page to load
 * @property {Object.<string, React.LazyExoticComponent>} Pages - All page components
 * @property {React.Component} Layout - Layout wrapper component
 */
export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};
