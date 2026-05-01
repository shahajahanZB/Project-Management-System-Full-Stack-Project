import { useEffect } from 'react';
import { APP_NAME } from '@/lib/constants';

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = `${title} | ${APP_NAME}`;
  }, [title]);
}
