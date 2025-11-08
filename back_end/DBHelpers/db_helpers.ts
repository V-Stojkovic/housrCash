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
    password_hash: string;
}

interface IdResult extends RowDataPacket{
    id: number;
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

export const getPasswordHash = async (username?: string, email?: string): Promise<UserAuthData | null> => {
    let sql = 'SELECT password_hash,salt,userId FROM user WHERE ';
    let searchParam:string;
    if (username) {
        sql += 'username = ?';
    } else if (email) {
        sql += 'email = ?';
    } else {
        // Neither was provided
        return null;
    }
    const [rows] = await pool.query<UserAuthData[]>(sql, [username ? username : email]);
        // Return the hash if found, otherwise null
        return rows.length > 0 ? rows[0]: null;
};

export const getId = async (username: string): Promise<number | null> =>{
    const sql = 'SELECT id FROM user WHERE userName = ?';

    const[rows] = await pool.query<IdResult[]>(sql,[username]);

    return rows.length > 0 ? rows[0].id : null;
}

//=================================
// Payments
//=================================
