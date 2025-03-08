import { db } from "../db/index.js";
import { PriorityQueue } from "../utils/PriorityQueue.js";

export const getOptions = async (req, res) => {
  try {
    // const { from_account, to_account } = req.query;
    // if (!from_account || !to_account) {
    //   throw new Error("Invalid Data");
    // }
    // const from_Bank_Id = await db.query(
    //   `select bank_id from accounts where account_id = ${from_account}`
    // );
    // const to_Bank_Id = await db.query(
    //   `select bank_id from accounts where account_id = ${from_account}`
    // );
    const min_time = await calculateMinTime(6, 4);
    const min_cost = await calculateMinCost(6, 4);
    res.status(200).json({
      message: "Options fetched successfully",
      data: {
        min_time,
        min_cost,
      },
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

const calculateMinTime = async (from_Bank_Id, to_Bank_Id) => {
  try {
    const total_banksPromise = new Promise((resolve, reject) =>
      db.query(`select * from banks`, (err, result) => {
        if (err) reject(err);
        resolve(result.length);
      })
    );
    const total_banks = await total_banksPromise;
    let dist = [];
    for (let i = 0; i < total_banks; i++) {
      dist[i] = 1000000000;
    }
    dist[from_Bank_Id] = 0;
    let pq = new PriorityQueue();
    pq.enqueue(from_Bank_Id, 0);
    while (pq.size() !== 0) {
      let top = pq.dequeue();
      let node = top.node;
      let weight = top.priority;
      // get all the edges from the node

      const edgesPromise = new Promise((resolve, reject) => {
        db.query(
          `select * from links where from_bank_id = ${node}`,
          (err, res) => {
            if (err) reject(err);
            return resolve(res);
          }
        );
      });
      const edges = await edgesPromise;

      for (let i = 0; i < edges.length; i++) {
        let to = edges[i].to_bank_id;
        let edgeWt = edges[i].transaction_time;
        if (dist[to] > weight + edgeWt) {
          dist[to] = weight + edgeWt;
          pq.enqueue(to, dist[to]);
          console.log(to, dist[to]);
        }
      }
    }

    return dist[to_Bank_Id];
  } catch (error) {
    throw new Error(error.message);
  }
};

const calculateMinCost = async (from_Bank_Id, to_Bank_Id) => {
  try {
    const total_banksPromise = new Promise((resolve, reject) =>
      db.query(`select * from banks`, (err, result) => {
        if (err) reject(err);
        resolve(result.length);
      })
    );
    const total_banks = await total_banksPromise;
    let dist = [];
    for (let i = 0; i < total_banks; i++) {
      dist[i] = 1000000000;
    }
    dist[from_Bank_Id] = 0;
    let pq = new PriorityQueue();
    pq.enqueue(from_Bank_Id, 0);

    while (pq.size() !== 0) {
      let top = pq.dequeue();
      let node = top.node;
      let weight = top.priority;
      // get all the edges from the node
      const edgesPromise = new Promise((resolve, reject) => {
        db.query(
          `select * from links where from_bank_id = ${node}`,
          (err, res) => {
            if (err) reject(err);
            return resolve(res);
          }
        );
      });
      const edges = await edgesPromise;
      const edgeWtPromise = new Promise((resolve, reject) => {
        db.query(
          `select charges from banks where bank_id = ${node}`,
          (err, res) => {
            if (err) reject(err);

            return resolve(res);
          }
        );
      });

      const chargesObject = await edgeWtPromise;

      for (let i = 0; i < edges.length; i++) {
        let to = edges[i].to_bank_id;
        const edgeWt = parseInt(chargesObject[0].charges);
        if (dist[to] > weight + edgeWt) {
          dist[to] = weight + edgeWt;
          pq.enqueue(to, dist[to]);
        }
      }
    }

    return dist[to_Bank_Id];
  } catch (error) {
    throw new Error(error.message);
  }
};
