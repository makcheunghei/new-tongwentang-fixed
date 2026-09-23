import { classifyLanguageTag, normalizeLanguageTag } from './language-tags';

export const TEXT_SAMPLE_LIMIT = 4000;
export const TEXT_SAMPLE_MINIMUM = 3;

const HANS_CHARS =
  '门开东车长马鱼鸟页风飞电话请谢对时现过还进边头爱气点线经习总应该会说读写听见认识让给从众万与专业产广义乐医历压厅县参双变号吗国体为这个发网龙华无来们样学问题么没软盘键盘电脑网络测试简体汉转换书语实际办证';
const HANT_CHARS =
  '門開東車長馬魚鳥頁風飛電話請謝對時現過還進邊頭愛氣點線經習總應該會說讀寫聽見認識讓給從眾萬與專業產廣義樂醫歷壓廳縣參雙變號嗎國體為這個發網龍華無來們樣學問題麼沒軟盤鍵盤電腦網絡測試簡體漢轉換書語實際辦證';

const HANS = new Set(HANS_CHARS);
const HANT = new Set(HANT_CHARS);

export type TextSampleKind = 'hans' | 'hant' | 'und';

export const classifyTextSample = (text: string): TextSampleKind => {
  const sample = text.slice(0, TEXT_SAMPLE_LIMIT);
  let hans = 0;
  let hant = 0;

  for (const char of sample) {
    if (HANS.has(char)) hans += 1;
    else if (HANT.has(char)) hant += 1;
  }

  if (hans >= TEXT_SAMPLE_MINIMUM && hans >= hant * 2) return 'hans';
  if (hant >= TEXT_SAMPLE_MINIMUM && hant >= hans * 2) return 'hant';
  return 'und';
};

export const resolveDetectedKind = (
  languageTag: string,
  sample: string,
  chtTags?: readonly string[],
  chsTags?: readonly string[],
): TextSampleKind => {
  const tag = normalizeLanguageTag(languageTag);
  if (tag === '' || tag === 'zh') return classifyTextSample(sample);
  return classifyLanguageTag(tag, chtTags, chsTags) ?? 'und';
};
