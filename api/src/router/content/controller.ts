import { Request, Response } from "express";
import { HomeScreenContent } from "src/types";
import { httpUtils, log } from "src/utils";
import { DidYouKnow } from "src/content/DidYouKnow";
import { FeaturedArtists } from "src/content/FeaturedArtists";
import { Heroes } from "src/content/Heroes";
import { Values } from "src/content/Values";
import { FeaturedBusiness } from "src/content/FeaturedBusiness";

const codes = httpUtils.codes;

function randomInteger(upTo: number, includingZero = true): number {
  return Math.floor(Math.random() * upTo + (includingZero ? 0 : 1));
}

function selectContentFromSource(
  sourceContent: HomeScreenContent[],
  random?: number
): HomeScreenContent[] {
  let selectedContent: HomeScreenContent[] = [];

  if (random) {
    for (let i = 0; i < random; i++) {
      if (sourceContent.length > 0) {
        const index = randomInteger(sourceContent.length);
        selectedContent.push(sourceContent[index]);
        sourceContent.splice(index, 1);
      }
    }
  } else selectedContent = sourceContent;

  return selectedContent;
}

export async function getContent(_req: Request, res: Response): Promise<void> {
  try {
    const limit: number | undefined = _req?.query?.limit
      ? Number(_req?.query?.limit)
      : undefined;
    const random: number | undefined = _req?.query?.random
      ? Number(_req?.query?.random)
      : undefined;
    let type = _req?.query?.type;

    let content: HomeScreenContent[] = [];

    if (!type) {
      content = [...DidYouKnow, ...FeaturedArtists, ...Heroes, ...Values];
    } else {
      type = String(type).toUpperCase();

      if (type == "DIDYOUKNOW") content = DidYouKnow;
      if (type == "FEATUREDARTISTS") content = FeaturedArtists;
      if (type == "HEROES") content = Heroes;
      if (type == "VALUES") content = Values;
      if (type == "FEATUREDBUSINESS") content = FeaturedBusiness;
    }

    content = selectContentFromSource(content, random);

    if (limit) {
      content = content.slice(0, limit);
    }

    httpUtils.createHttpResponse(content, codes.OK, res);
  } catch (err) {
    log(err);
    httpUtils.createHttpResponse(
      { message: "Server error: " + err },
      codes.SERVER_ERROR,
      res
    );
  }
}
