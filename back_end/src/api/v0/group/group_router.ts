import { Router } from 'express';
import * as groupController from './group.controller';

const groupRouter = Router();

// Group management
groupRouter.post('/create', groupController.createGroup);
groupRouter.post('/join', groupController.joinGroup);
groupRouter.post('/leave/:userId', groupController.leaveGroup);
groupRouter.delete('/:groupId', groupController.deleteGroup);

// Transaction management
groupRouter.post('/transaction', groupController.createTransaction);
groupRouter.post('/transaction/:transactionId/close', groupController.closeTransaction);
groupRouter.post('/transaction/:transactionId/mark-paid', groupController.markTransactionPaid);

// Query endpoints
groupRouter.get('/user/:userId', groupController.getUserGroupDetails);
groupRouter.get('/user/:userId/owes', groupController.getUserDebts);
groupRouter.get('/user/:userId/owed', groupController.getUserCredits);
groupRouter.get('/:groupId/transactions', groupController.getGroupTransactions);

export default groupRouter;
