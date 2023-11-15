import express from "express";

export const HeadersMiddleware =  (req: express.Request, res: express.Response, next: express.NextFunction) => {

    if (req.url !== '/') {
        res.append('Access-Control-Allow-Origin', '*');
        res.append('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        res.append('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        res.append('Access-Control-Allow-Credentials', 'true');
    }

    if (req.method !== 'OPTIONS'){
        res.append('content-type', 'application/json; charset=utf-8');
    }

    next();
}