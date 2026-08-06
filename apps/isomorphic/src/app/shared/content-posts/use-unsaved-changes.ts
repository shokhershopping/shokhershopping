'use client';

import { useCallback, useEffect, useRef } from 'react';

const WARNING_MESSAGE = 'You have unsaved changes. Leave this page?';

export default function useUnsavedChanges(when: boolean) {
  const bypassNextNavigation = useRef(false);

  const confirmNavigation = useCallback(() => {
    if (!when || typeof window === 'undefined') return true;

    const confirmed = window.confirm(WARNING_MESSAGE);
    if (confirmed) {
      bypassNextNavigation.current = true;
      window.setTimeout(() => {
        bypassNextNavigation.current = false;
      }, 1000);
    }
    return confirmed;
  }, [when]);

  useEffect(() => {
    if (!when) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (bypassNextNavigation.current) return;
      event.preventDefault();
      event.returnValue = '';
    };

    const handleInternalLink = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>('a[href]');
      if (
        !anchor ||
        anchor.target === '_blank' ||
        anchor.hasAttribute('download')
      ) {
        return;
      }

      let destination: URL;
      try {
        destination = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      if (
        destination.origin !== window.location.origin ||
        destination.href === window.location.href
      ) {
        return;
      }

      if (!confirmNavigation()) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleInternalLink, true);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleInternalLink, true);
    };
  }, [confirmNavigation, when]);

  return confirmNavigation;
}
