import { Request, Response } from "express";
import { httpUtils } from "src/utils";
import {
  pause,
  unpause,
  transferContractOwnership,
  transferWalletOwnership,
} from "src/service/contracts";
import { ITransferOwnerRequest } from "src/types";

export async function adminPause(_req: Request, res: Response): Promise<void> {
  try {
    await pause();
    httpUtils.createHttpResponse(
      { message: "Paused by admin" },
      httpUtils.codes.ACCEPTED,
      res
    );
  } catch (err) {
    if (err.message?.includes("Ownable: caller is not the owner"))
      httpUtils.forbidden(
        "Current operating account is not the owner of the controller and cannot unpause",
        res
      );
    else httpUtils.serverError(err, res);
  }
}

export async function adminUnpause(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    await unpause();
    httpUtils.createHttpResponse(
      { message: "Unpaused by admin" },
      httpUtils.codes.ACCEPTED,
      res
    );
  } catch (err) {
    if (err.message?.includes("Ownable: caller is not the owner"))
      httpUtils.forbidden(
        "Current operating account is not the owner of the controller and cannot unpause",
        res
      );
    else httpUtils.serverError(err, res);
  }
}

export async function transferControllerOwner(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    const request: ITransferOwnerRequest = _req.body;
    await transferContractOwnership(request.newOwner);
    httpUtils.createHttpResponse(
      { message: `Controller owner changed to ${request.newOwner}` },
      httpUtils.codes.ACCEPTED,
      res
    );
  } catch (err) {
    if (err.message?.includes("Ownable: caller is not the owner"))
      httpUtils.forbidden(
        "Current operating account is not the owner of the controller and cannot transfer ownership",
        res
      );
    else httpUtils.serverError(err, res);
  }
}

export async function transferWalletOwner(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    const request: ITransferOwnerRequest = _req.body;
    await transferWalletOwnership(request.newOwner, request.userId);
    httpUtils.createHttpResponse(
      {
        message: `Wallet ${request.userId} owner changed to ${request.newOwner}`,
      },
      httpUtils.codes.ACCEPTED,
      res
    );
  } catch (err) {
    if (err.message?.includes("Ownable"))
      httpUtils.forbidden(
        "Current operating account is not the owner of the controller and cannot transfer ownership",
        res
      );
    else httpUtils.serverError(err, res);
  }
}
