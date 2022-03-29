import { FunctionDeclaration, SyntaxKind } from 'ts-morph';

const dateRegExp = /['"]?(\d{1,2}\/\d{1,2}\/\d{1,4})["']?.*,/;

export function getDate(commentString: string): string {
  const matchResult = commentString.match(dateRegExp);
  return (matchResult && matchResult[1]) ? matchResult[1] : '';
}

export function extractDateFromComments(funDecl: FunctionDeclaration): string {
  return extractDateFromInlineComment(funDecl) || extractDateFromBlockComments(funDecl);
}

function extractDateFromBlockComments(funDecl: FunctionDeclaration): string {
  const returnStatement = funDecl.getFirstDescendantByKind(SyntaxKind.ReturnStatement);
  const comment = returnStatement.getChildren()[1]?.getText();
  return getDate(comment);
}

function extractDateFromInlineComment(funDecl: FunctionDeclaration): string {
  const returnStatement = funDecl.getFirstDescendantByKind(SyntaxKind.ReturnStatement);
  const callExp = returnStatement?.getExpressionIfKind(SyntaxKind.CallExpression);

  const comments = callExp?.getArguments()[0]?.getTrailingCommentRanges();
  let dateString = '';
  for (const comment of comments) {
    dateString = getDate(comment.getText()) || dateString;
  }
  return dateString;
}
