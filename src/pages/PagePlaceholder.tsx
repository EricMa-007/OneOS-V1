/**
 * OneOS 页面占位符组件
 * 用于快速创建页面骨架
 */

import React from 'react';
import { EmptyState } from '../components/ui/EmptyState';
import { IconName } from '../components/ui/Icon';

interface PagePlaceholderProps {
  title: string;
  description: string;
  icon: IconName;
  actionLabel?: string;
  onAction?: () => void;
  children?: React.ReactNode;
}

export const PagePlaceholder: React.FC<PagePlaceholderProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  children,
}) => {
  if (children) {
    return <div style={{ width: '100%', height: '100%' }}>{children}</div>;
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <EmptyState
        icon={icon}
        title={title}
        description={description}
        actionLabel={actionLabel}
        onAction={onAction}
        size="lg"
      />
    </div>
  );
};
