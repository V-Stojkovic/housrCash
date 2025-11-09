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
export const addPayment = async (payment : paymentDTO):Promise<number> => {
    const sql = 'INSERT '
    return 0;
}
