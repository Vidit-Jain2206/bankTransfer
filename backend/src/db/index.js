import mysql from "mysql2";
import csvtojson from "csvtojson";
import path from "path";

// MySQL connection setup
export const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "rootpassword",
  database: "banking",
  port: 3307,
});

export function connect() {
  db.connect(async function (err) {
    if (err) {
      console.log("Error occurred while connecting to MySQL:", err.message);
    } else {
      console.log("Connection to MySQL created successfully!");
      //   await createTable();
      //   await insertBanks();
      //   await insertLinks();
    }
  });
}

// Function to create tables
async function createTable() {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      user_id INT AUTO_INCREMENT PRIMARY KEY,
      user_aadhar_card VARCHAR(255) UNIQUE NOT NULL
    );
  `;

  const createBanksTable = `
    CREATE TABLE IF NOT EXISTS banks (
      bank_id INT AUTO_INCREMENT PRIMARY KEY,
      bank_name VARCHAR(255) UNIQUE NOT NULL,
      charges DECIMAL(10, 2) NOT NULL
    );
  `;

  const createAccountsTable = `
    CREATE TABLE IF NOT EXISTS accounts (
      account_id INT AUTO_INCREMENT PRIMARY KEY,
      account_number VARCHAR(20) UNIQUE NOT NULL,
      user_id INT NOT NULL,
      bank_id INT NOT NULL,
      balance DECIMAL(10, 2) DEFAULT 0.00,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id),
      FOREIGN KEY (bank_id) REFERENCES banks(bank_id),
      UNIQUE (user_id)
    );
  `;

  const createLinksTable = `
    CREATE TABLE IF NOT EXISTS links (
      link_id INT AUTO_INCREMENT PRIMARY KEY,
      from_bank_id INT NOT NULL,
      to_bank_id INT NOT NULL,
      transaction_time INT NOT NULL,
      FOREIGN KEY (from_bank_id) REFERENCES banks(bank_id),
      FOREIGN KEY (to_bank_id) REFERENCES banks(bank_id),
      UNIQUE (from_bank_id, to_bank_id)
    );
  `;

  const createTransactionsTable = `
    CREATE TABLE IF NOT EXISTS transactions (
      transaction_id INT AUTO_INCREMENT PRIMARY KEY,
      from_account_id INT NOT NULL,
      to_account_id INT NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      transaction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (from_account_id) REFERENCES accounts(account_id),
      FOREIGN KEY (to_account_id) REFERENCES accounts(account_id)
    );
  `;

  // Execute the queries to create the tables
  db.query(createUsersTable, (err, result) => {
    if (err) {
      console.error("Error creating users table:", err.message);
    } else {
      console.log("Users table created successfully.");
    }
  });

  db.query(createBanksTable, (err, result) => {
    if (err) {
      console.error("Error creating banks table:", err.message);
    } else {
      console.log("Banks table created successfully.");
    }
  });

  db.query(createAccountsTable, (err, result) => {
    if (err) {
      console.error("Error creating accounts table:", err.message);
    } else {
      console.log("Accounts table created successfully.");
    }
  });

  db.query(createLinksTable, (err, result) => {
    if (err) {
      console.error("Error creating links table:", err.message);
    } else {
      console.log("Links table created successfully.");
    }
  });

  db.query(createTransactionsTable, (err, result) => {
    if (err) {
      console.error("Error creating transactions table:", err.message);
    } else {
      console.log("Transactions table created successfully.");
    }
  });
}

async function insertBanks() {
  try {
    const banksJson = await csvtojson().fromFile(
      "/Users/vidit2003/Desktop/hclTech_Hackthon/files/banks.csv"
    );

    banksJson.forEach((bank) => {
      const { BIC, Charge } = bank;

      const query = "INSERT INTO banks (bank_name, charges) VALUES (?, ?)";

      db.query(query, [BIC, Charge], (err, result) => {
        if (err) {
          console.error("Error inserting bank:", err.message);
        } else {
          console.log(`Bank ${BIC} inserted successfully.`);
        }
      });
    });
  } catch (error) {
    console.error("Error processing bank CSV:", error.message);
  }
}

async function insertLinks() {
  try {
    const linksJson = await csvtojson().fromFile(
      "/Users/vidit2003/Desktop/hclTech_Hackthon/files/links.csv"
    );

    linksJson.forEach((link) => {
      const { FromBIC, ToBIC, TimeTakenInMinutes } = link;

      const query = `
          INSERT INTO links (from_bank_id, to_bank_id, transaction_time)
          SELECT b1.bank_id, b2.bank_id, ?
          FROM banks b1, banks b2
          WHERE b1.bank_name = ? AND b2.bank_name = ?
        `;

      db.query(query, [TimeTakenInMinutes, FromBIC, ToBIC], (err, result) => {
        if (err) {
          console.error("Error inserting link:", err.message);
        } else {
          console.log(
            `Link from ${FromBIC} to ${ToBIC} inserted successfully.`
          );
        }
      });
    });
  } catch (error) {
    console.error("Error processing links CSV:", error.message);
  }
}
