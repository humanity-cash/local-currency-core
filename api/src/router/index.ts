import express from "express";
import user from "./user";
import webhook from "./webhook";
import stats from "./stats";

const router = express();

router.use(webhook);
router.use(user);
router.use(stats);

export default router;
