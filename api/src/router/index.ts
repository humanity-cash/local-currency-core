import express from "express";
import user from "./user";
import webhook from "./webhook";
import stats from "./stats";
import admin from "./admin";

const router = express();

router.use(webhook);
router.use(user);
router.use(stats);
router.use(admin);

export default router;
