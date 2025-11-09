
import { addCredit } from './db_helpers';
import pool from './index';

const givePoints = async (userId: number, amount: number) => {
  try {
    console.log(`Giving ${amount} points to user ${userId}...`);
    const newBalance = await addCredit({ userId, amount });
    console.log(`User ${userId} now has a balance of ${newBalance}.`);
  } catch (error) {
    console.error('Error giving points:', error);
  } finally {
    await pool.end();
  }
};

const args = process.argv.slice(2);
if (args.length !== 2) {
  console.error('Usage: ts-node add_points.ts <userId> <amount>');
  process.exit(1);
}

const userId = parseInt(args[0], 10);
const amount = parseInt(args[1], 10);

if (isNaN(userId) || isNaN(amount)) {
  console.error('Invalid userId or amount. Both must be numbers.');
  process.exit(1);
}

givePoints(userId, amount);
