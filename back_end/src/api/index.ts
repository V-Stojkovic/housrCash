import { Router } from 'express';
import v0Router from './v0'; // Imports from ./v0/index.ts automatically

const apiRouter = Router();

apiRouter.use('/v0', v0Router);
// Future: router.use('/v1', v1Router);

export default apiRouter;