import { describe, expect, it } from 'vitest';
import { TEXT_SAMPLE_LIMIT, classifyTextSample, resolveDetectedKind } from './zh-sample';

const simplified = '这是一个简体中文测试页面，电脑网络显示汉字转换。';
const traditional = '這是一個簡體中文測試頁面，電腦網絡顯示漢字轉換。';

describe('classifyTextSample', () => {
  it('classifies a simplified sample', () => {
    expect(classifyTextSample(simplified)).toBe('hans');
  });

  it('classifies a traditional sample', () => {
    expect(classifyTextSample(traditional)).toBe('hant');
  });

  it('returns und for text without enough distinctive characters', () => {
    expect(classifyTextSample('Hello world')).toBe('und');
    expect(classifyTextSample('门开')).toBe('und');
  });

  it('returns und when both sides are mixed', () => {
    expect(classifyTextSample(`${simplified}${traditional}`)).toBe('und');
  });

  it('ignores characters beyond the sample limit', () => {
    expect(classifyTextSample(`${'a'.repeat(TEXT_SAMPLE_LIMIT)}${simplified}`)).toBe('und');
  });
});

describe('resolveDetectedKind', () => {
  it('does not sample explicit non-Chinese language tags', () => {
    expect(resolveDetectedKind('en', simplified)).toBe('und');
    expect(resolveDetectedKind('ja-JP', simplified)).toBe('und');
    expect(resolveDetectedKind('ko', traditional)).toBe('und');
  });

  it('samples when the language tag is missing', () => {
    expect(resolveDetectedKind('', simplified)).toBe('hans');
    expect(resolveDetectedKind('', traditional)).toBe('hant');
    expect(resolveDetectedKind('', 'Hello')).toBe('und');
  });

  it('samples a generic zh tag instead of assuming simplified Chinese', () => {
    expect(resolveDetectedKind('zh', traditional)).toBe('hant');
    expect(resolveDetectedKind('zh', simplified)).toBe('hans');
    expect(resolveDetectedKind('zh', 'Hello')).toBe('und');
  });

  it('keeps explicit Chinese tags', () => {
    expect(resolveDetectedKind('zh-CN', '')).toBe('hans');
    expect(resolveDetectedKind('zh-Hant-TW', '')).toBe('hant');
  });
});
