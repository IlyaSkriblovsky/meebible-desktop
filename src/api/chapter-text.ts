import { universalFetch } from "./utils.ts";

export async function fetchChapterText(
  transCode: string,
  langCode: string,
  bookCode: string,
  chapterNo: number,
): Promise<string> {
  const response = await universalFetch(
    `https://meebible.org/chapter?trans=${transCode}&lang=${langCode}&book=${bookCode}&chapter=${chapterNo}`,
  );
  return await response.text();
}
