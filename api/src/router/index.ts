import express from "express";
import user from "./user";
import webhook from "./webhook";
import stats from "./stats";
import admin from "./admin";
import businesses from "./businesses";
import health from "./health";

const router = express();

router.use(health);
router.use(webhook);
router.use(user);
router.use(stats);
router.use(admin);
router.use(businesses);

export default router;
