import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../DBHelpers';



// ============================================================================================
// USER/ACCOUNT HELPERS
// ============================================================================================
interface CreateUserDTO {
    username: string;
    email: string;
    firstName: string;
    surname: string;
    password_hash?: string | null;
    salt?: string | null;
    googleId?: number | null;
}
// Define the expected result shape
interface PasswordResult extends RowDataPacket {
    id: number;
    username: string;
    password_hash: string;
    salt?: string;
}

interface IdResult extends RowDataPacket {
    id: number;
}

interface paymentDTO{
    userId:number,
    reference:string,
    paymentAmount:number,

}

interface addCredit{
    userId:number,
    amount:number
}
export interface UserAuthData extends RowDataPacket {
    id: number;
    username: string;
    password_hash: string;
    // salt: string; // Not needed if using bcrypt, it's built into the hash
}

export interface paymentHistory extends RowDataPacket {
    id: number,
    paymentAmount : number,
    reference : string
}


export const createUser = async (userData: CreateUserDTO): Promise<number> => {
    const { username, email, firstName, surname, password_hash = null, salt = null } = userData;
    const { googleId = null } = userData;

    // 1. Define the SQL with '?' placeholders. include googleId (nullable)
    const sql = `
        INSERT INTO user (username, email, firstName, surname, password_hash, salt, googleId)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    // 2. Execute Query
    // Pass the actual data as the second argument in an array.
    // The order MUST match the '?' order in the SQL above.
    const [result] = await pool.query<ResultSetHeader>(sql, [
        username,
        email,
        firstName,
        surname,
        password_hash,
        salt,
        googleId
    ]);

    // 3. Return the new user's ID
    return result.insertId;
};

export const getUserById = async (id: number) : Promise<{id:number, username:string, email?:string} | null> => {
    const sql = 'SELECT id, username, email FROM user WHERE id = ? LIMIT 1';
    const [rows] = await pool.query<RowDataPacket[]>(sql, [id]);
    if (rows.length === 0) return null;
    const row: any = rows[0];
    return { id: row.id, username: row.username, email: row.email };
};

export const getPasswordHash = async (identifier?: string): Promise<UserAuthData | null> => {
    // Accept a single identifier (username or email) and try to find a matching user.
    if (!identifier) return null;

    const sql = 'SELECT id, username, password_hash, salt FROM user WHERE username = ? OR email = ? LIMIT 1';
    const [rows] = await pool.query<UserAuthData[]>(sql, [identifier, identifier]);
    return rows.length > 0 ? rows[0] : null;
};

export const getId = async (username: string): Promise<number | null> => {
    const sql = 'SELECT id FROM user WHERE username = ?';
    const [rows] = await pool.query<IdResult[]>(sql, [username]);
    return rows.length > 0 ? rows[0].id : null;
};

export const getUserByGoogleId = async (googleId: string | number) : Promise<{id:number, username:string, email?:string} | null> => {
    const sql = 'SELECT id, username, email FROM user WHERE googleId = ? LIMIT 1';
    const [rows] = await pool.query<RowDataPacket[]>(sql, [googleId]);
    if (rows.length === 0) return null;
    const row: any = rows[0];
    return { id: row.id, username: row.username, email: row.email };
};

//=================================
// Payments
//=================================
export const addPayment = async (payment: paymentDTO, transaction?: any): Promise<any> => {
    const { userId, reference, paymentAmount } = payment;

    if (userId === null) {
        throw new Error('User not found');
    }

    const sql = 'INSERT INTO payment (userId, reference, paymentAmount, date) VALUES (?, ?, ?, NOW())';
    const queryMethod = transaction ? transaction.query.bind(transaction) : pool.query.bind(pool);
    const [result] = await queryMethod(sql, [userId, reference, paymentAmount]);

    return {
        id: result.insertId,
        userId,
        reference,
        paymentAmount,
        date: new Date()
    };
}

export const getPayments = async(userId?: number): Promise<paymentHistory[]> => {
    let sql = 'SELECT id, userId, paymentAmount, reference, date FROM payment';
    const params: any[] = [];
    
    if (userId !== undefined) {
        sql += ' WHERE userId = ?';
        params.push(userId);
    }
    
    sql += ' ORDER BY date DESC';
    const [rows] = await pool.query<paymentHistory[]>(sql, params);
    return rows;
}

export const deletePayment = async(paymentId: number, transaction?: any): Promise<boolean> => {
    const queryMethod = transaction ? transaction.query.bind(transaction) : pool.query.bind(pool);
    const sql = 'DELETE FROM payment WHERE id = ?';
    const [result] = await queryMethod(sql, [paymentId]);
    return (result as ResultSetHeader).affectedRows > 0;
}
/**
 * This method adds credit.amount to the user's current balance
 * @param credit
 * @returns The new balance of the user
 */
export const addCredit = async (credit: addCredit, transaction?: any): Promise<number> => {
    const { userId, amount } = credit;
    const queryMethod = transaction ? transaction.query.bind(transaction) : pool.query.bind(pool);

    // Update the user's balance by adding the specified amount
    const sql = 'UPDATE user SET balance = balance + ? WHERE id = ?';
    await queryMethod(sql, [amount, userId]);

    // Retrieve the new balance
    const [rows] = await queryMethod(`SELECT balance FROM user WHERE id = ?`, [userId]);
    return rows.length > 0 ? rows[0].balance : 0;
}

export const getCashBackRate = async(): Promise<string> => {
    const sql = 'SELECT setting_value FROM settings WHERE setting_key = ?';
    const [rows] = await pool.query<RowDataPacket[]>(sql, ['cashback_rate']);
    return rows[0]?.setting_value ?? '1.0'; // Default to 1.0 if not found
}

export const setCashBackRate = async(newRate :number):Promise<void> => {
    const sql = 'UPDATE settings SET value = ? WHERE key = "cashback_rate"';
    await pool.query<ResultSetHeader>(sql,[newRate]);

}