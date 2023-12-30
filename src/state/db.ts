import mysql from 'mysql-await';
require('dotenv').config();
let con: any;

export async function connect(){
    con = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    });
}

export async function fetchOne(query: string) : Promise<any> {
    return (await con.awaitQuery(query))[0];
}

export async function fetch(query: string) : Promise<Array<any>> {
    return await con.awaitQuery(query);
}