import { patch } from 'happy-eyeballs';
import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';

patch(HttpAgent, {delay: 10000});
patch(HttpsAgent, {delay: 10000});

import "./src/wechaty/index.js";
