import { describe, expect, it } from 'vitest';
import { parseMutation } from './parse-mutation';

describe('parseMutation', () => {
  it('returns the text node of a characterData mutation', () => {
    const text = document.createTextNode('原文');
    const record = { type: 'characterData', target: text } as unknown as MutationRecord;

    expect(parseMutation(record)).toEqual([text]);
  });

  it('returns the added nodes of a childList mutation', () => {
    const parent = document.createElement('div');
    const added = document.createElement('p');
    const record = {
      type: 'childList',
      target: parent,
      addedNodes: [added],
    } as unknown as unknown as MutationRecord;

    expect(parseMutation(record)).toEqual([added]);
  });

  it('returns an empty list for a childList mutation without added nodes', () => {
    const parent = document.createElement('div');
    const removed = document.createElement('span');
    const record = {
      type: 'childList',
      target: parent,
      addedNodes: [],
      removedNodes: [removed],
    } as unknown as unknown as MutationRecord;

    expect(parseMutation(record)).toEqual([]);
  });

  it('returns the element of an attributes mutation', () => {
    const element = document.createElement('input');
    const record = { type: 'attributes', target: element } as unknown as MutationRecord;

    expect(parseMutation(record)).toEqual([element]);
  });
});
