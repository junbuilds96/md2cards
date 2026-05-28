export function shouldShowCardLabels(showCardLabels: boolean): boolean {
  return showCardLabels;
}

export function getCardClassName(themeClassName: string, showCardLabels: boolean): string {
  return ['social-card', themeClassName, showCardLabels ? '' : 'card-labels-hidden']
    .filter(Boolean)
    .join(' ');
}
