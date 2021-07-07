import { Request, Response } from "express";
import * as AuthorizedService from "src/service/AuthorizedService";
import * as PublicServices from "src/service/PublicService";
import { httpUtils } from "src/utils";

const codes = httpUtils.codes;

export async function getAllUsers(_req: Request, res: Response): Promise<void> {
  try {
    const users = await PublicServices.getAllWallets();
    httpUtils.createHttpResponse(users, codes.OK, res);
  } catch (err) {
    httpUtils.createHttpResponse(
      {
        message: "Server error: " + err,
      },
      codes.SERVER_ERROR,
      res
    );
  }
}

export async function getUser(req: Request, res: Response): Promise<void> {
  try {
    const id = req?.params?.id;
    const user = await PublicServices.getWallet(id);
    // Create as an array of one item for API consistency
    httpUtils.createHttpResponse([user], codes.OK, res);
  } catch (err) {
    if (err.message && err.message.includes("ERR_USER_NOT_EXIST"))
      httpUtils.createHttpResponse(
        {
          message: "User does not exist",
        },
        codes.NOT_FOUND,
        res
      );
    else {
      httpUtils.createHttpResponse(
        {
          message: "Server error: " + err,
        },
        codes.SERVER_ERROR,
        res
      );
    }
  }
}

export async function createUser(req: Request, res: Response): Promise<void> {
  try {
    const newUser = req.body;
    await AuthorizedService.createUser(newUser);
    const wallet = await PublicServices.getWallet(newUser.userId);
    httpUtils.createHttpResponse(wallet, codes.CREATED, res);
  } catch (err) {
    if (err.message?.includes("ERR_USER_EXISTS"))
      httpUtils.createHttpResponse(
        {
          message: "Could not create user, already exists",
        },
        codes.UNPROCESSABLE,
        res
      );
    else
      httpUtils.createHttpResponse(
        {
          message: "Server error: " + err,
        },
        codes.SERVER_ERROR,
        res
      );
  }
}

export async function deposit(req: Request, res: Response): Promise<void> {
  try {
    const id = req?.params?.id;
    const deposit = req.body;
    await AuthorizedService.deposit(id, deposit.amount);
    const wallet = await PublicServices.getWallet(id);
    httpUtils.createHttpResponse(wallet, codes.OK, res);
  } catch (err) {
    httpUtils.createHttpResponse(
      {
        message: "Server error: " + err,
      },
      codes.SERVER_ERROR,
      res
    );
  }
}

export async function transferTo(req: Request, res: Response): Promise<void> {
  try {
    const id = req?.params?.id;
    const transfer = req.body;
    await AuthorizedService.transferTo(id, transfer.toUserId, transfer.amount);
    const user = await PublicServices.getWallet(id);
    httpUtils.createHttpResponse(user, codes.OK, res);
  } catch (err) {
    httpUtils.createHttpResponse(
      {
        message: "Server error: " + err,
      },
      codes.SERVER_ERROR,
      res
    );
  }
}
