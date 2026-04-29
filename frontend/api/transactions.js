import { listTransactions } from "../../backend/service";
export default function handler(_req, res) {
    res.status(200).json(listTransactions());
}
