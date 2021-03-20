// import 'bootstrap/dist/css/bootstrap.min.css';
import fs from 'fs';
import path from 'path';
import runApp from './rssApp.js';

const initHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html')).toString();
const parser = new DOMParser();
parser.parseFromString(initHtml, 'text/html');

runApp();
