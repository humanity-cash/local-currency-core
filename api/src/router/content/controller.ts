import { Request, Response } from "express";
import { HomeScreenContent } from "src/types";
import { httpUtils, log } from "src/utils";
import { DidYouKnow } from "src/content/DidYouKnow";
import { FeaturedArtists } from "src/content/FeaturedArtists";
import { Heroes } from "src/content/Heroes";
import { Values } from "src/content/Values";

const codes = httpUtils.codes;

export async function getContent(_req: Request, res: Response): Promise<void> {
  try {
    const content: HomeScreenContent[] = [
      ...DidYouKnow,
      ...FeaturedArtists,
      ...Heroes,
      ...Values,
    ];
    httpUtils.createHttpResponse(content, codes.OK, res);
  } catch (err) {
    log(err);
    httpUtils.createHttpResponse({ message: "Server error: " + err }, 500, res);
  }
}
