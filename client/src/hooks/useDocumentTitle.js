import { useEffect, useRef } from 'react';

/**
 * useDocumentTitle — side-effect hook
 *
 * Updates document.title whenever `title` changes and restores
 * the previous title when the component unmounts.
 *
 * Demonstrates:
 *  - useEffect with a dependency array ([title]) — only re-runs when
 *    `title` changes, not on every render.
 *  - useRef to hold a mutable value (previous title) that does NOT
 *    trigger a re-render when written.
 *  - Cleanup function: runs when the component unmounts OR before the
 *    effect re-runs, preventing stale titles on navigation.
 *
 * @param {string} title - The page title to set
 * @param {string} [suffix] - Optional suffix appended to every title, e.g. "· Nexus Expense AI"
 */
export const useDocumentTitle = (title, suffix = '· Nexus Expense AI') => {
  // useRef: stores the original title without causing re-renders
  const previousTitle = useRef(document.title);

  useEffect(() => {
    // Side effect: mutates a browser API (document.title) — always in useEffect
    document.title = suffix ? `${title} ${suffix}` : title;

    // Cleanup: restore the previous title when this component unmounts.
    // Without cleanup, navigating away would leave a stale title.
    return () => {
      document.title = previousTitle.current;
    };
  }, [title, suffix]); // only re-runs when title or suffix changes
};
