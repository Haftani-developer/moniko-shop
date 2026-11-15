import { Link } from 'react-router-dom';
import { ReactNode } from 'react';

/** لینک داخلی (/...) با React Router و لینک خارجی (https://...) با تگ a. اگر لینک خالی باشد فقط محتوا. */
export default function SmartLink({ to, className, children, title }: {
  to?: string | null; className?: string; children: ReactNode; title?: string;
}) {
  if (!to) return <div className={className} title={title}>{children}</div>;
  if (to.startsWith('/') && !to.startsWith('//')) {
    return <Link to={to} className={className} title={title}>{children}</Link>;
  }
  if (/^https?:\/\//.test(to)) {
    return <a href={to} className={className} title={title} target="_blank" rel="noopener noreferrer">{children}</a>;
  }
  return <div className={className} title={title}>{children}</div>;
}
