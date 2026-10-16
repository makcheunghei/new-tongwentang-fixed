import type { FC } from 'react';
export const Divider: FC<{ content?: string }> = ({ content }) =>
  content ? <h2 className="group-heading">{content}</h2> : <hr className="divider" />;
