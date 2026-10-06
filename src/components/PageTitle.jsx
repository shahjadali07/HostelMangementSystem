import { useEffect } from 'react';

export default function PageTitle({ title }) {
  useEffect(() => {
    if (title) {
      document.title = title;
    }
  }, [title]);

  return null;
}
