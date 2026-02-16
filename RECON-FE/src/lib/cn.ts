/**
 * Simple classNames merger. Replace with clsx/classnames if you add more deps.
 */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
