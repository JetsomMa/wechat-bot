import { patch } from 'happy-eyeballs';
import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';

patch(HttpAgent, {delay: 30000});
patch(HttpsAgent, {delay: 30000});

import "./src/wechaty/index.js";
