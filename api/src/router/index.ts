import express from "express";
import user from "./user";
import webhook from "./webhook";
import stats from "./stats";
import admin from "./admin";
import businesses from "./businesses";
import health from "./health";
import content from "./content";

const router = express();

router.use(health);
router.use(webhook);
router.use(user);
router.use(stats);
router.use(admin);
router.use(businesses);
router.use(content);

export default router;
