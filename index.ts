import express, { Express, Response, Request, NextFunction } from 'express';
import HandleRequest from './src/server.ts';
import * as db from './src/state/db.ts';
const app: Express = express();

// middleware for reading raw body
app.use(function(req: Request, res: Response, next: NextFunction){
    let data = '';
    req.on('data', function(chunk){
        data  += chunk;
    });
    req.on('end', function(){
        req.body = data;
        next();
    });
});

app.get('/', async (_: Request, res: Response) => {
    res.send('running ts-bancho v0.7.2');
});

app.post('/', async (req: Request, res: Response) => {
    await HandleRequest(req, res);
});

app.listen(5000, async () => {
    await db.connect();
    console.log('[server]: Server is running at http://localhost:5000');
});