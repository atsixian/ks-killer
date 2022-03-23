import { FunctionDeclaration } from 'ts-morph';
import { getDate, extractDateFromComments } from './dateParser';
import { getInfoFromText } from '.';

const validComments = [
  `/* '08/24/2021' , 'fix focus lost when cancel the dialog' */`,
  `/* "08/24/2021", fix focus lost when cancel the dialog */`,
  `/* 08/24/2021, fix focus lost when cancel the dialog */`,
  `// '08/24/2021', 'fix focus lost when cancel the dialog' `,
];

const invalidComments = [
  `/* '08/24/2021'. 'fix focus lost when cancel the dialog' */`,
  `/* '08/24/2021 */`
];


describe('Extract date from a given string', () => {
  it.each(validComments)('Valid comment string : %s', (comment) => {
    expect(getDate(comment)).toBe('08/24/2021');
  });

  it('should get date with different format', () => {
    const comment = `/* '8/24/21', 'fix focus lost when cancel the dialog' */`;
    expect(getDate(comment)).toBe('8/24/21');
  });
  
  it.each(invalidComments)('Invalid comment string : %s', (comment) => {
    const date = getDate(comment);
    expect(date).toBe('');
  });
});

describe('Extract date from comments', () => {
  it('should parse inline comments', () => {
    const funDecl = getInfoFromText(`
      export function isKSActivated(): boolean {
        return _SPKillSwitch.isActivated(
          '39ededd5-f5aa-441c-9197-e312dea3ec45' /* '9/24/2021', 'Encode URLs before setting them as link href' */
        );
      }
    `).firstChild;
    expect(extractDateFromComments(funDecl as FunctionDeclaration)).toBe('9/24/2021');
  });

  it('should parse inline trailing comments', () => {
    const funDecl = getInfoFromText(`
      export function isKSActivated(): boolean {
        return _SPKillSwitch.isActivated(
          '39ededd5-f5aa-441c-9197-e312dea3ec45' // '9/24/2021', 'Encode URLs before setting them as link href'
        );
      }
    `).firstChild;
    expect(extractDateFromComments(funDecl as FunctionDeclaration)).toBe('9/24/2021');
  });

  it('should parse block comments after the first parameter', () => {
    const funDecl = getInfoFromText(`
      export function isKSActivated(): boolean {
        return _SPKillSwitch.isActivated(
          '39ededd5-f5aa-441c-9197-e312dea3ec45' 
          /* '9/24/2021', 'Encode URLs before setting them as link href' */
        );
      }
    `).firstChild;
    expect(extractDateFromComments(funDecl as FunctionDeclaration)).toBe('9/24/2021');
  });

  it('should parse block comments before the first parameter', () => {
    const funDecl = getInfoFromText(`
      export function isKSActivated(): boolean {
        return _SPKillSwitch.isActivated(
          /* '9/24/2021', 'Encode URLs before setting them as link href' */
          '39ededd5-f5aa-441c-9197-e312dea3ec45' 
        );
      }
    `).firstChild;
    expect(extractDateFromComments(funDecl as FunctionDeclaration)).toBe('9/24/2021');
  });

  it('cannot parse block comments out of return statement', () => {
    const funDecl = getInfoFromText(`
      export function isKSActivated(): boolean {
        /* '9/24/2021', 'Encode URLs before setting them as link href' */
        return _SPKillSwitch.isActivated(
          '39ededd5-f5aa-441c-9197-e312dea3ec45' 
        );
      }
    `).firstChild;
    expect(extractDateFromComments(funDecl as FunctionDeclaration)).toBe('');
  });
});