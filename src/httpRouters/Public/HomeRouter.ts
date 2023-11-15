import Express from 'express';
/**
 * se encarga de ejcutar las peticiones que llegan al home /
 *
 * @param req
 * @param res
 */
export const HomeRouter = async (req: Express.Request, res: Express.Response) => {
    
    res.send('Hello world !');
}