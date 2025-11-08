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
    password_hash: string;
    salt: string;
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
    username:string,
    reference:string,
    timestamp:number

}
export interface UserAuthData extends RowDataPacket {
    id: number;
    username: string;
    password_hash: string;
    // salt: string; // Not needed if using bcrypt, it's built into the hash
}


export const createUser = async (userData: CreateUserDTO): Promise<number> => {
    const { username, email, firstName, surname, password_hash, salt } = userData;

    // 1. Define the SQL with '?' placeholders
    const sql = `
        INSERT INTO user (username, email, firstName, surname, password_hash, salt)
        VALUES (?, ?, ?, ?, ?, ?)
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
        salt
    ]);

    // 3. Return the new user's ID
    return result.insertId;
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

//=================================
// Payments
//=================================
export const addPayment = async (payment : paymentDTO):Promise<number> => {
    const sql = 'INSERT '
    return 0;
}
