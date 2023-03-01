import { patch } from 'happy-eyeballs';
import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';

patch(HttpAgent, {delay: 1000});
patch(HttpsAgent, {delay: 1000});

import "./src/wechaty/index.js";
